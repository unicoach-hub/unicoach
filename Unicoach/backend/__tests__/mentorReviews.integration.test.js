// Student reviews against an in-memory MongoDB: long comments are cut to 1000 characters,
// and an admin delete removes the review and recomputes the mentor's rating.
process.env.UNICOACH_MONGO_URI = ''; // keep UniCoach models on the in-memory test connection
jest.setTimeout(120000);

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const UnicoachMentor = require('../unicoach/models/UnicoachMentor');
const UnicoachService = require('../unicoach/models/UnicoachService');
const UnicoachBooking = require('../unicoach/models/UnicoachBooking');
const UnicoachReview = require('../unicoach/models/UnicoachReview');
const { submitReview } = require('../unicoach/controllers/featureController');
const { getAllReviews, deleteReview } = require('../unicoach/controllers/adminUnicoachController');

let mongo;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
  await mongoose.connect(mongo.getUri());
});
afterAll(async () => { await mongoose.disconnect(); await mongo.stop(); });
beforeEach(async () => {
  await Promise.all([
    UnicoachMentor.deleteMany({}), UnicoachService.deleteMany({}),
    UnicoachBooking.deleteMany({}), UnicoachReview.deleteMany({}),
  ]);
});

const call = async (fn, req = {}) => {
  const res = { code: 200 };
  res.status = (c) => { res.code = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  await fn({ params: {}, query: {}, body: {}, ...req }, res);
  return res;
};

let n = 0;
const setup = async () => {
  n += 1;
  const mentor = await UnicoachMentor.create({ name: 'Prachi', handle: `prachi${n}`, email: `p${n}@example.com`, active: true });
  const service = await UnicoachService.create({ mentorId: mentor._id, title: '1:1 call', type: 'ONE_ON_ONE', priceInINR: 1000 });
  const bookingRef = `UM-TEST-${n}`;
  await UnicoachBooking.create({
    bookingRef, mentorId: mentor._id, serviceId: service._id,
    studentName: 'Aman', studentEmail: 'aman@example.com', studentPhone: '+919000000000',
    state: 'COMPLETED', amountInINR: 1000, idempotencyKey: `idem-${n}`,
  });
  return { mentor, bookingRef };
};

describe('student reviews', () => {
  it('cuts a very long comment down to 1000 characters', async () => {
    const { mentor, bookingRef } = await setup();
    const res = await call(submitReview, {
      params: { handle: mentor.handle },
      body: { bookingRef, rating: 5, comment: 'x'.repeat(5000) },
    });

    expect(res.code).toBe(201);
    const saved = await UnicoachReview.findOne({});
    expect(saved.comment).toHaveLength(1000);
  });

  it('keeps a normal comment exactly as the student wrote it', async () => {
    const { mentor, bookingRef } = await setup();
    await call(submitReview, {
      params: { handle: mentor.handle },
      body: { bookingRef, rating: 4, comment: '  Very helpful call about Germany.  ' },
    });

    const saved = await UnicoachReview.findOne({});
    expect(saved.comment).toBe('Very helpful call about Germany.');
    expect(saved.rating).toBe(4);
  });

  it('lists reviews for the admin with the mentor and booking attached', async () => {
    const { mentor, bookingRef } = await setup();
    await call(submitReview, { params: { handle: mentor.handle }, body: { bookingRef, rating: 5, comment: 'Great' } });

    const res = await call(getAllReviews);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].mentorId.handle).toBe(mentor.handle);
    expect(res.body[0].bookingId.bookingRef).toBe(bookingRef);
  });

  it('deletes a review and recomputes the mentor rating', async () => {
    const { mentor, bookingRef } = await setup();
    await call(submitReview, { params: { handle: mentor.handle }, body: { bookingRef, rating: 1, comment: 'Abusive text' } });

    const afterSubmit = await UnicoachMentor.findById(mentor._id);
    expect(afterSubmit.reviewCount).toBe(1);
    expect(afterSubmit.ratingAvg).toBe(1);

    const review = await UnicoachReview.findOne({});
    const res = await call(deleteReview, { params: { reviewId: String(review._id) } });

    expect(res.code).toBe(200);
    expect(res.body.success).toBe(true);
    expect(await UnicoachReview.countDocuments({})).toBe(0);

    const afterDelete = await UnicoachMentor.findById(mentor._id);
    expect(afterDelete.reviewCount).toBe(0);
    expect(afterDelete.ratingAvg).toBe(0);
  });

  it('returns 404 when the review is already gone', async () => {
    const res = await call(deleteReview, { params: { reviewId: String(new mongoose.Types.ObjectId()) } });
    expect(res.code).toBe(404);
  });
});
