const crypto = require('crypto');
const BookingEvent = require('../models/BookingEvent');
const BookingSlot = require('../models/BookingSlot');

const generateSlug = () => crypto.randomBytes(4).toString('hex');

/**
 * GET /api/admin/bookings/events
 * GET all booking event definitions
 */
exports.getAllBookingEvents = async (req, res) => {
  try {
    const events = await BookingEvent.find().populate('pipeline', 'name stages').sort({ createdAt: -1 });
    return res.json(events);
  } catch (err) {
    console.error('Error fetching booking events:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/bookings/events
 * Create booking event definition
 */
exports.createBookingEvent = async (req, res) => {
  try {
    const { title, subheading, description, imageUrl, videoUrl, durationMinutes, workingDays, startTime, endTime, pipeline, stageName } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const slug = generateSlug();
    const bookingEvent = new BookingEvent({
      title,
      slug,
      subheading: subheading || '',
      description: description || '',
      imageUrl: imageUrl || '',
      videoUrl: videoUrl || '',
      durationMinutes: Number(durationMinutes) || 30,
      workingDays: workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      startTime: startTime || '10:00',
      endTime: endTime || '18:00',
      pipeline: pipeline || undefined,
      stageName: stageName || '',
      createdBy: req.user?.id
    });
    await bookingEvent.save();
    return res.status(201).json(bookingEvent);
  } catch (err) {
    console.error('Error creating booking event:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/admin/bookings/events/:id
 * Update booking event definition
 */
exports.updateBookingEvent = async (req, res) => {
  try {
    const { title, subheading, description, imageUrl, videoUrl, durationMinutes, workingDays, startTime, endTime, pipeline, stageName, active } = req.body;
    const event = await BookingEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Booking event not found' });

    if (title) event.title = title;
    if (subheading !== undefined) event.subheading = subheading;
    if (description !== undefined) event.description = description;
    if (imageUrl !== undefined) event.imageUrl = imageUrl;
    if (videoUrl !== undefined) event.videoUrl = videoUrl;
    if (durationMinutes) event.durationMinutes = Number(durationMinutes);
    if (workingDays) event.workingDays = workingDays;
    if (startTime) event.startTime = startTime;
    if (endTime) event.endTime = endTime;
    if (pipeline !== undefined) event.pipeline = pipeline || undefined;
    if (stageName !== undefined) event.stageName = stageName;
    if (active !== undefined) event.active = active;

    await event.save();
    return res.json(event);
  } catch (err) {
    console.error('Error updating booking event:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/admin/bookings/events/:id
 * Delete booking event definition
 */
exports.deleteBookingEvent = async (req, res) => {
  try {
    await BookingEvent.findByIdAndDelete(req.params.id);
    await BookingSlot.deleteMany({ bookingEvent: req.params.id });
    return res.json({ message: 'Booking event deleted' });
  } catch (err) {
    console.error('Error deleting booking event:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/bookings/slots
 * GET all booked slots
 */
exports.getAllBookedSlots = async (req, res) => {
  try {
    const slots = await BookingSlot.find().populate('bookingEvent', 'title slug').sort({ bookingDate: -1 });
    return res.json(slots);
  } catch (err) {
    console.error('Error fetching booked slots:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/admin/bookings/slots/:id
 * Update slot status/counselor/notes
 */
exports.updateBookedSlot = async (req, res) => {
  try {
    const { status, counselor, notes } = req.body;
    const slot = await BookingSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    if (status) slot.status = status;
    if (counselor !== undefined) slot.counselor = counselor;
    if (notes !== undefined) slot.notes = notes;

    await slot.save();
    return res.json(slot);
  } catch (err) {
    console.error('Error updating slot:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/admin/bookings/slots/:id
 * Delete booked slot
 */
exports.deleteBookedSlot = async (req, res) => {
  try {
    await BookingSlot.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Slot deleted' });
  } catch (err) {
    console.error('Error deleting slot:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
