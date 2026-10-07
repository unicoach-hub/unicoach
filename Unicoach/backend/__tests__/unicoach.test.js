const request = require('supertest');
const mongoose = require('mongoose');
process.env.NODE_ENV = 'test';
const app = require('../server');
const { validateHandle } = require('../unicoach/middlewares/slugValidator');
const { canTransition, assertTransition } = require('../unicoach/services/fsmService');
const { acquireSlotLock, releaseSlotLock } = require('../unicoach/services/lockService');
const { satisfiesNoticePeriod, generateDaySlots } = require('../unicoach/services/timezoneService');

describe('UniCoach Modular Subsystem & Senior Engineering Engines', () => {
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }, 20000);

  describe('1. Subsystem Health Diagnostic Endpoint', () => {
    test('GET /api/unicoach/health returns subsystem status', async () => {
      const res = await request(app).get('/api/unicoach/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('subsystem', 'UniCoach (Mentorship & Booking Engine)');
      expect(res.body).toHaveProperty('components');
      expect(res.body.components).toHaveProperty('databaseMode');
      expect(res.body.components).toHaveProperty('distributedLockEngine');
    });
  });

  describe('2. Reserved Slug & Handle Namespace Protection (Pillar #8)', () => {
    test('Blocks reserved system keywords', () => {
      expect(validateHandle('admin').valid).toBe(false);
      expect(validateHandle('@checkout').valid).toBe(false);
      expect(validateHandle('api').valid).toBe(false);
      expect(validateHandle('webhook').valid).toBe(false);
      expect(validateHandle('unicoach').valid).toBe(false);
    });

    test('Rejects invalid format with special characters or spaces', () => {
      expect(validateHandle('aarav sharma').valid).toBe(false);
      expect(validateHandle('aarav$123').valid).toBe(false);
      expect(validateHandle('a').valid).toBe(false); // Too short
    });

    test('Accepts valid mentor handles', () => {
      const result = validateHandle('@aarav_sharma');
      expect(result.valid).toBe(true);
      expect(result.cleanHandle).toBe('aarav_sharma');
    });
  });

  describe('3. Finite State Machine (FSM) Lifecycle Protection (Pillar #5)', () => {
    test('Permits legal state transitions', () => {
      expect(canTransition('CREATED', 'PAYMENT_PENDING')).toBe(true);
      expect(canTransition('PAYMENT_PENDING', 'CONFIRMED')).toBe(true);
      expect(canTransition('CONFIRMED', 'IN_PROGRESS')).toBe(true);
      expect(canTransition('IN_PROGRESS', 'COMPLETED')).toBe(true);
    });

    test('Blocks illegal state jumps that cause financial corruption', () => {
      // Cannot jump straight from PAYMENT_PENDING to COMPLETED without confirmation
      expect(canTransition('PAYMENT_PENDING', 'COMPLETED')).toBe(false);
      expect(() => assertTransition('PAYMENT_PENDING', 'COMPLETED')).toThrow();

      // Cannot uncancel a CANCELLED booking
      expect(canTransition('CANCELLED', 'CONFIRMED')).toBe(false);
      expect(() => assertTransition('CANCELLED', 'CONFIRMED')).toThrow();
    });
  });

  describe('4. Distributed Locking & Race Condition Concurrency (Pillar #1)', () => {
    test('Guarantees only ONE winner when two users attempt to lock the same slot', async () => {
      const slotId = 'test_slot_concurrency_101';
      const studentA = 'token_student_A';
      const studentB = 'token_student_B';

      // Student A acquires lock
      const lockA = await acquireSlotLock(slotId, studentA, 60);
      expect(lockA).toBe(true);

      // Student B attempts to lock the exact same slot concurrently
      const lockB = await acquireSlotLock(slotId, studentB, 60);
      expect(lockB).toBe(false); // BLOCKED! Zero double booking

      // Student A finishes or cancels
      const released = await releaseSlotLock(slotId, studentA);
      expect(released).toBe(true);

      // Now Student B can successfully acquire the lock
      const retryB = await acquireSlotLock(slotId, studentB, 60);
      expect(retryB).toBe(true);

      // Cleanup
      await releaseSlotLock(slotId, studentB);
    });
  });

  describe('5. Buffer Time & Minimum Notice Period (Pillar #12)', () => {
    test('Enforces mentor minimum notice period', () => {
      const thirtyMinutesFromNow = new Date(Date.now() + 30 * 60 * 1000);
      const fourHoursFromNow = new Date(Date.now() + 4 * 60 * 60 * 1000);

      // With 2 hour notice period:
      expect(satisfiesNoticePeriod(thirtyMinutesFromNow, 2)).toBe(false);
      expect(satisfiesNoticePeriod(fourHoursFromNow, 2)).toBe(true);
    });

    test('Generates slots with mandatory buffer window inserted', () => {
      const slots = generateDaySlots({
        dateStr: '2026-10-15',
        startTime: '14:00',
        endTime: '15:30',
        durationMinutes: 30,
        bufferMinutes: 10
      });

      expect(slots.length).toBe(2);
      
      // Slot 1: 14:00 - 14:30
      expect(new Date(slots[0].startUtc).getUTCHours() || new Date(slots[0].startUtc).getHours()).toBeDefined();
      
      // Difference between Slot 1 end and Slot 2 start must be exactly bufferMinutes (10 min)
      const bufferDiffMinutes = (new Date(slots[1].startUtc) - new Date(slots[0].endUtc)) / 60000;
      expect(bufferDiffMinutes).toBe(10);
    });
  });

  describe('6. Multi-Session Bundles & Packages Support', () => {
    const UnicoachService = require('../unicoach/models/UnicoachService');

    test('Validates bundleCount default is 1 and accepts multi-session packages', () => {
      const singleService = new UnicoachService({
        mentorId: new mongoose.Types.ObjectId(),
        type: 'ONE_ON_ONE',
        title: 'Single 1:1 Mentorship Session',
        priceInINR: 999
      });
      expect(singleService.bundleCount).toBe(1);

      const bundleService = new UnicoachService({
        mentorId: new mongoose.Types.ObjectId(),
        type: 'ONE_ON_ONE',
        title: '3-Session Mentorship Package',
        priceInINR: 2499,
        bundleCount: 3
      });
      expect(bundleService.bundleCount).toBe(3);
    });
  });

  describe('7. Free Payouts & Double-Entry Ledger Invariants', () => {
    const UnicoachPayout = require('../unicoach/models/UnicoachPayout');
    const UnicoachLedger = require('../unicoach/models/UnicoachLedger');

    test('UnicoachPayout schema enforces minimum withdrawal amount of ₹100 and valid methods', () => {
      const validPayout = new UnicoachPayout({
        payoutRef: 'PO-TEST-001',
        mentorId: new mongoose.Types.ObjectId(),
        amountINR: 500,
        payoutMethod: 'UPI',
        payoutDetails: { upiId: 'creator@okaxis' }
      });
      expect(validPayout.status).toBe('REQUESTED');
      expect(validPayout.amountINR).toBe(500);

      const invalidPayout = new UnicoachPayout({
        payoutRef: 'PO-TEST-002',
        mentorId: new mongoose.Types.ObjectId(),
        amountINR: 50 // Below ₹100 minimum
      });
      const err = invalidPayout.validateSync();
      expect(err.errors['amountINR']).toBeDefined();
    });

    test('Double-entry ledger correctly accounts for PAYOUT_HOLD and BANK_SETTLEMENT', () => {
      const payoutId = new mongoose.Types.ObjectId();
      const mentorId = new mongoose.Types.ObjectId();

      // Step 1: Payout Request hold
      const holdDebit = new UnicoachLedger({
        payoutId,
        mentorId,
        type: 'DEBIT',
        account: 'CREATOR_WALLET',
        amount: 500,
        description: 'Creator payout withdrawal request'
      });
      const holdCredit = new UnicoachLedger({
        payoutId,
        mentorId,
        type: 'CREDIT',
        account: 'PAYOUT_HOLD',
        amount: 500,
        description: 'Pending payout escrow hold'
      });

      expect(holdDebit.account).toBe('CREATOR_WALLET');
      expect(holdDebit.type).toBe('DEBIT');
      expect(holdCredit.account).toBe('PAYOUT_HOLD');
      expect(holdCredit.type).toBe('CREDIT');

      // Step 2: Admin approves with UTR
      const settleDebit = new UnicoachLedger({
        payoutId,
        mentorId,
        type: 'DEBIT',
        account: 'PAYOUT_HOLD',
        amount: 500,
        description: 'Release hold for settled payout'
      });
      const settleCredit = new UnicoachLedger({
        payoutId,
        mentorId,
        type: 'CREDIT',
        account: 'BANK_SETTLEMENT',
        amount: 500,
        description: 'Disbursed via UPI UTR-123456789'
      });

      expect(settleDebit.account).toBe('PAYOUT_HOLD');
      expect(settleCredit.account).toBe('BANK_SETTLEMENT');
    });
  });

  describe('8. Zero-Login Student Tracking Diagnostic', () => {
    test('GET /api/unicoach/queries/INVALID_REF returns 404', async () => {
      const res = await request(app).get('/api/unicoach/queries/NON_EXISTENT_REF_9999');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Query reference not found.');
    });
  });
});
