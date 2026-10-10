const BookingEvent = require('../models/BookingEvent');
const BookingSlot = require('../models/BookingSlot');
const FormSubmission = require('../models/FormSubmission');
const Lead = require('../models/Lead');
const { readAttribution, applyAttributionToLead } = require('../utils/attribution');
const { sendMetaEvent } = require('../services/metaConversions');

const generateTimeSlots = (startTimeStr, endTimeStr, intervalMinutes = 30) => {
  const slots = [];
  const [startH, startM] = startTimeStr.split(':').map(Number);
  const [endH, endM] = endTimeStr.split(':').map(Number);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes + intervalMinutes <= endMinutes) {
    const h = Math.floor(currentMinutes / 60);
    const m = currentMinutes % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m < 10 ? `0${m}` : m;
    slots.push(`${displayH}:${displayM} ${period}`);
    currentMinutes += intervalMinutes;
  }
  return slots;
};

/**
 * GET /api/bookings/:slug
 * GET public booking event by slug
 */
exports.getPublicBookingEvent = async (req, res) => {
  try {
    const event = await BookingEvent.findOne({ slug: req.params.slug, active: true });
    if (!event) return res.status(404).json({ message: 'Booking event not found or inactive' });

    const availableSlots = generateTimeSlots(
      event.startTime || '10:00',
      event.endTime || '18:00',
      event.durationMinutes || 30
    );

    return res.json({
      title: event.title,
      slug: event.slug,
      subheading: event.subheading,
      description: event.description,
      imageUrl: event.imageUrl,
      videoUrl: event.videoUrl,
      durationMinutes: event.durationMinutes,
      workingDays: event.workingDays,
      availableTimeSlots: availableSlots
    });
  } catch (err) {
    console.error('Error fetching public booking event:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/bookings/:slug/booked-slots
 * GET booked slots for a specific date
 */
exports.getBookedSlots = async (req, res) => {
  try {
    const event = await BookingEvent.findOne({ slug: req.params.slug, active: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const { date } = req.query;
    if (!date) return res.json([]);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const booked = await BookingSlot.find({
      bookingEvent: event._id,
      bookingDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    }).select('timeSlot');

    return res.json(booked.map(b => b.timeSlot));
  } catch (err) {
    console.error('Error fetching booked slots:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/bookings/:slug/book
 * Book time slot
 */
exports.bookSlot = async (req, res) => {
  try {
    const event = await BookingEvent.findOne({ slug: req.params.slug, active: true }).populate('pipeline');
    if (!event) return res.status(404).json({ message: 'Booking event not found or inactive' });

    const { studentName, studentEmail, studentPhone, dreamCountry, preferredIntake, bookingDate, timeSlot, notes } = req.body;

    if (!studentName || !studentEmail || !studentPhone || !bookingDate || !timeSlot) {
      return res.status(400).json({ message: 'Name, email, phone, date, and time slot are required.' });
    }

    const dateObj = new Date(bookingDate);

    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await BookingSlot.findOne({
      bookingEvent: event._id,
      bookingDate: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $ne: 'cancelled' }
    });

    if (existing) {
      return res.status(400).json({ message: 'Selected time slot is already booked. Please choose another slot.' });
    }

    const slot = new BookingSlot({
      bookingEvent: event._id,
      studentName,
      studentEmail,
      studentPhone,
      dreamCountry: dreamCountry || '',
      preferredIntake: preferredIntake || '',
      bookingDate: dateObj,
      timeSlot,
      notes: notes || '',
      status: 'confirmed'
    });
    await slot.save();

    event.bookingCount = (event.bookingCount || 0) + 1;
    await event.save();

    if (event.pipeline) {
      const targetStage = event.stageName || event.pipeline.stages?.[0]?.name || 'New Lead';
      const submission = new FormSubmission({
        form: event._id,
        pipeline: event.pipeline._id,
        currentStage: targetStage,
        data: {
          'Full Name': studentName,
          'Email': studentEmail,
          'Phone': studentPhone,
          'Dream Country': dreamCountry || 'Not Specified',
          'Preferred Intake': preferredIntake || 'Not Specified',
          'Booking Date': dateObj.toLocaleDateString(),
          'Time Slot': timeSlot,
          'Booking Event': event.title
        },
        submittedAt: new Date()
      });
      await submission.save();
      slot.formSubmission = submission._id;
      await slot.save();
    }

    const attribution = readAttribution(req.body);
    sendMetaEvent({
      eventName: 'Lead',
      eventId: attribution?.eventId,
      user: { email: studentEmail, phone: studentPhone, name: studentName },
      req,
      attribution,
      customData: { content_name: `Booking: ${event.title}` }
    });

    try {
      const existingLead = await Lead.findOne({ email: studentEmail });
      if (!existingLead) {
        const newLead = new Lead({
          name: studentName,
          email: studentEmail,
          phone: studentPhone,
          dreamCountry: dreamCountry || 'Other',
          preferredIntake: preferredIntake || '2026',
          source: `Booking: ${event.title}`,
          status: 'new'
        });
        applyAttributionToLead(newLead, attribution);
        await newLead.save();
      }
    } catch (e) {
      console.error('Lead auto-create error:', e);
    }

    return res.status(201).json({
      success: true,
      message: `Booking confirmed for ${timeSlot} on ${dateObj.toLocaleDateString()}!`,
      booking: slot
    });
  } catch (err) {
    console.error('Error booking slot:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
