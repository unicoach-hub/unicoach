import { useState, useEffect, useRef, useCallback } from 'react';
import { reserveSlot, confirmBooking, verifyPayment, cancelReservation } from '../api/unicoachApi';

export const useReservation = (handle) => {
  const [reservation, setReservation] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isReserving, setIsReserving] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [error, setError] = useState(null);

  const timerRef = useRef(null);
  // Last reservation identifiers: kept even after the 10-min timer clears `reservation`, so a
  // student who completes Razorpay checkout after expiry still gets their payment verified server-side
  const lastReservationRef = useRef(null);

  // Countdown timer effect
  useEffect(() => {
    if (!reservation?.expiresAt) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const updateCountdown = () => {
      const diffMs = new Date(reservation.expiresAt).getTime() - Date.now();
      const remaining = Math.max(0, Math.floor(diffMs / 1000));
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setReservation(null);
        setError('Your 10-minute slot reservation has expired. Please select the slot again.');
      }
    };

    updateCountdown();
    timerRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [reservation?.expiresAt]);

  /**
   * Phase 1: Lock Slot
   */
  const handleReserve = useCallback(async (slotId, serviceId, studentDetails) => {
    setIsReserving(true);
    setError(null);

    try {
      const data = await reserveSlot(handle, {
        slotId,
        serviceId,
        studentName: studentDetails.name,
        studentEmail: studentDetails.email,
        studentPhone: studentDetails.phone,
        studentNotes: studentDetails.notes || '',
        customAnswers: Array.isArray(studentDetails.customAnswers) ? studentDetails.customAnswers : [],
        couponCode: studentDetails.couponCode || null
      });

      lastReservationRef.current = {
        bookingRef: data.bookingRef,
        reservationToken: data.reservationToken
      };

      setReservation({
        slotId,
        serviceId,
        bookingRef: data.bookingRef,
        reservationToken: data.reservationToken,
        expiresAt: data.expiresAt,
        checkoutSummary: data.checkoutSummary
      });

      setIsReserving(false);
      return data;
    } catch (err) {
      setIsReserving(false);
      setError(err.message);
      throw err;
    }
  }, [handle]);

  /**
   * Phase 2 (FREE bookings only): Confirm a ₹0 booking without payment.
   * Paid bookings must go through create-payment-order + verify-payment (handleVerifyPayment);
   * the server rejects paid bookings here with 402.
   */
  const handleConfirm = useCallback(async () => {
    if (!reservation) throw new Error('No active reservation to confirm.');

    setIsConfirming(true);
    setError(null);

    try {
      const data = await confirmBooking(handle, {
        bookingRef: reservation.bookingRef,
        reservationToken: reservation.reservationToken
      });

      setConfirmedBooking(data.booking);
      setReservation(null); // Clear hold
      setIsConfirming(false);
      return data;
    } catch (err) {
      setIsConfirming(false);
      setError(err.message);
      throw err;
    }
  }, [handle, reservation]);

  /**
   * Phase 2B: Server-side verification of the Razorpay payment (or { bookingRef } only for
   * free / dev-simulated orders). On 409 the slot was taken and the student is refunded;
   * the thrown Error carries the server's message.
   */
  const handleVerifyPayment = useCallback(async (paymentPayload) => {
    const active = reservation || lastReservationRef.current;
    if (!active?.bookingRef) throw new Error('No active reservation to verify payment for.');

    setIsConfirming(true);
    setError(null);

    try {
      const data = await verifyPayment(handle, {
        bookingRef: active.bookingRef,
        reservationToken: active.reservationToken,
        ...paymentPayload
      });

      lastReservationRef.current = null;

      setConfirmedBooking(data.booking);
      setReservation(null);
      setIsConfirming(false);
      return data;
    } catch (err) {
      setIsConfirming(false);
      setError(err.message);
      // 409: slot was taken by someone else and the payment is refunded — this reservation is dead
      if (err.status === 409) {
        setReservation(null);
        lastReservationRef.current = null;
      }
      throw err;
    }
  }, [handle, reservation]);

  /**
   * Early Cancel / Release Lock
   */
  const handleCancel = useCallback(async () => {
    if (!reservation) return;

    try {
      await cancelReservation({
        slotId: reservation.slotId,
        reservationToken: reservation.reservationToken,
        bookingRef: reservation.bookingRef
      });
    } catch (e) {
      console.warn('Cancel reservation error:', e);
    } finally {
      lastReservationRef.current = null;
      setReservation(null);
      setSecondsLeft(0);
    }
  }, [reservation]);

  // Formatted MM:SS display
  const formattedTime = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`;

  return {
    reservation,
    secondsLeft,
    formattedTime,
    isReserving,
    isConfirming,
    confirmedBooking,
    error,
    reserveSlot: handleReserve,
    confirmBooking: handleConfirm,
    verifyPaymentBooking: handleVerifyPayment,
    cancelReservation: handleCancel,
    resetConfirmation: () => setConfirmedBooking(null)
  };
};
