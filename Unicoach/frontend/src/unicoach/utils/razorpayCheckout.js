import { loadScript } from '../../utils/loadScript';

const RAZORPAY_CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

/**
 * Opens Razorpay Checkout for an order created by our backend.
 * Supports UPI, Indian cards, netbanking, wallets and international cards (when enabled on the Razorpay account).
 *
 * Resolves with { razorpay_payment_id, razorpay_order_id, razorpay_signature } on success.
 * Rejects with an Error whose `code` is 'DISMISSED' if the student closes the popup, or 'FAILED' on a declined payment.
 *
 * @param {object} order   Response from create-payment-order / book-course-mentor: { orderId, amount, currency, keyId, prefill }
 * @param {object} options { name, description, image, prefill }
 */
export const openRazorpayCheckout = async (order, { name = 'UniCoach', description = '', image, prefill } = {}) => {
  const isLoaded = await loadScript(RAZORPAY_CHECKOUT_SRC);
  if (!isLoaded || !window.Razorpay) {
    throw Object.assign(new Error('Could not load Razorpay checkout. Please check your internet connection.'), { code: 'LOAD_FAILED' });
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency || 'INR',
      order_id: order.orderId,
      name,
      description,
      ...(image ? { image } : {}),
      prefill: prefill || order.prefill || {},
      theme: { color: '#DE5C2B' },
      handler: (response) => {
        settled = true;
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          if (!settled) {
            settled = true;
            reject(Object.assign(new Error('Payment was cancelled.'), { code: 'DISMISSED' }));
          }
        }
      }
    });

    rzp.on('payment.failed', (res) => {
      if (!settled) {
        settled = true;
        reject(Object.assign(new Error(res?.error?.description || 'Payment was declined. Please try another method.'), { code: 'FAILED' }));
      }
    });

    rzp.open();
  });
};
