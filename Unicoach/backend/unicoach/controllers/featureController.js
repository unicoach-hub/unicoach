const UnicoachMentor = require('../models/UnicoachMentor');
const UnicoachService = require('../models/UnicoachService');
const UnicoachBooking = require('../models/UnicoachBooking');
const UnicoachCoupon = require('../models/UnicoachCoupon');
const UnicoachReview = require('../models/UnicoachReview');

/**
 * POST /api/unicoach/@:handle/validate-coupon
 * Validates promo code and computes dynamic discount (100% In-House)
 */
const validateCoupon = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle.replace(/^@/, '');
    const { code, serviceId } = req.body;

    if (!code || !serviceId) {
      return res.status(400).json({ error: 'Promo code and serviceId are required.' });
    }

    const mentor = await UnicoachMentor.findOne({ handle, active: true });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const service = await UnicoachService.findOne({ _id: serviceId, mentorId: mentor._id, active: true });
    if (!service) return res.status(404).json({ error: 'Service not found.' });

    const cleanCode = code.toUpperCase().trim();
    const coupon = await UnicoachCoupon.findOne({
      mentorId: mentor._id,
      code: cleanCode,
      active: true
    });

    if (!coupon) {
      return res.status(404).json({ valid: false, error: 'Invalid coupon code.' });
    }

    // Check expiry
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ valid: false, error: 'This coupon code has expired.' });
    }

    // Check max usage
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ valid: false, error: 'This coupon has reached its maximum usage limit.' });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((service.priceInINR * coupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(service.priceInINR, coupon.discountValue);
    }

    const finalPrice = Math.max(0, service.priceInINR - discountAmount);

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      originalPrice: service.priceInINR,
      discountAmount,
      finalPrice
    });
  } catch (err) {
    console.error('Error validating coupon:', err);
    res.status(500).json({ error: 'Server error while validating coupon.' });
  }
};

/**
 * POST /api/unicoach/mentors/:handle/coupons
 * Creator creates a new discount code
 */
const createCoupon = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle.replace(/^@/, '');
    const mentor = await UnicoachMentor.findOne({ handle });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const { code, discountType, discountValue, maxUses, expiresAt } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({ error: 'Coupon code and discountValue are required.' });
    }

    const cleanCode = code.toUpperCase().trim();

    const existing = await UnicoachCoupon.findOne({ mentorId: mentor._id, code: cleanCode });
    if (existing) {
      return res.status(409).json({ error: `Coupon code '${cleanCode}' already exists for your account.` });
    }

    const coupon = new UnicoachCoupon({
      mentorId: mentor._id,
      code: cleanCode,
      discountType: discountType || 'PERCENTAGE',
      discountValue: Number(discountValue),
      maxUses: Number(maxUses) || 0,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    await coupon.save();

    res.status(201).json({ success: true, coupon });
  } catch (err) {
    console.error('Error creating coupon:', err);
    res.status(500).json({ error: 'Failed to create coupon.' });
  }
};

/**
 * GET /api/unicoach/mentors/:handle/coupons
 */
const getCoupons = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle.replace(/^@/, '');
    const mentor = await UnicoachMentor.findOne({ handle });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const coupons = await UnicoachCoupon.find({ mentorId: mentor._id }).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    console.error('Error fetching coupons:', err);
    res.status(500).json({ error: 'Failed to fetch coupons.' });
  }
};

/**
 * DELETE /api/unicoach/mentors/:handle/coupons/:couponId
 */
const deleteCoupon = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle.replace(/^@/, '');
    const mentor = await UnicoachMentor.findOne({ handle });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const { couponId } = req.params;
    await UnicoachCoupon.findOneAndDelete({ _id: couponId, mentorId: mentor._id });

    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (err) {
    console.error('Error deleting coupon:', err);
    res.status(500).json({ error: 'Failed to delete coupon.' });
  }
};

/**
 * POST /api/unicoach/@:handle/reviews
 * Submit verified review for completed session
 */
const submitReview = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle.replace(/^@/, '');
    const { bookingRef, rating, comment } = req.body;

    if (!bookingRef || !rating) {
      return res.status(400).json({ error: 'bookingRef and rating (1-5) are required.' });
    }

    const mentor = await UnicoachMentor.findOne({ handle });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const booking = await UnicoachBooking.findOne({ bookingRef, mentorId: mentor._id })
      .populate('serviceId', 'title');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (!['CONFIRMED', 'COMPLETED'].includes(booking.state)) {
      return res.status(400).json({ error: 'Reviews can only be submitted for confirmed or completed sessions.' });
    }

    // Check if already reviewed
    const existing = await UnicoachReview.findOne({ bookingId: booking._id });
    if (existing) {
      return res.status(409).json({ error: 'A review has already been submitted for this booking.' });
    }

    const review = new UnicoachReview({
      mentorId: mentor._id,
      bookingId: booking._id,
      studentName: booking.studentName,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment: comment || '',
      serviceTitle: booking.serviceId?.title || '1:1 Session',
      verifiedPurchase: true
    });

    await review.save();

    res.status(201).json({ success: true, message: 'Review submitted successfully!', review });
  } catch (err) {
    console.error('Error submitting review:', err);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
};

/**
 * GET /api/unicoach/@:handle/reviews
 * Fetch public reviews for mentor profile
 */
const getReviews = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle.replace(/^@/, '');
    const mentor = await UnicoachMentor.findOne({ handle, active: true });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const reviews = await UnicoachReview.find({ mentorId: mentor._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : 5.0;

    res.json({
      mentorHandle: mentor.handle,
      totalReviews,
      averageRating: Number(averageRating),
      reviews
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
};

module.exports = {
  validateCoupon,
  createCoupon,
  getCoupons,
  deleteCoupon,
  submitReview,
  getReviews
};
