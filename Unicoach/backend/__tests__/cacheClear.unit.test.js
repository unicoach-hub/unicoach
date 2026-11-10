// clearCache with Redis: no pattern must clear every cached response (admin edits call clearCache()),
// a pattern clears only that part, and the scan walks every batch.
process.env.REDIS_URL = 'redis://fake:6379';

const mockStore = new Map();
jest.mock('ioredis', () => jest.fn().mockImplementation(() => ({
  status: 'ready',
  on: jest.fn(),
  get: jest.fn(async (k) => mockStore.get(k) ?? null),
  setex: jest.fn(async (k, ttl, v) => { mockStore.set(k, v); }),
  del: jest.fn(async (...keys) => { keys.forEach((k) => mockStore.delete(k)); return keys.length; }),
  // two-batch scan so the loop is exercised
  scan: jest.fn(async (cursor, _m, pattern) => {
    const rx = new RegExp(`^${pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`);
    // like real SCAN, the batches are fixed when the scan starts
    if (cursor === '0') mockStore.scanBatch = [...mockStore.keys()].filter((k) => rx.test(k));
    const all = mockStore.scanBatch;
    const half = Math.ceil(all.length / 2);
    return cursor === '0' ? ['7', all.slice(0, half)] : ['0', all.slice(half)];
  }),
})));

const { clearCache } = require('../utils/cache');

beforeEach(() => {
  mockStore.clear();
  ['/api/blogs', '/api/blogs?page=2', '/api/news', '/api/courses/1', '/api/courses/2'].forEach((u) => mockStore.set(`express_cache:${u}`, '{}'));
  mockStore.set('lock:slot:1', 'x'); // not a cache key: never touched
});

test('clearCache() with no pattern removes every cached response (and nothing else)', async () => {
  await clearCache();
  expect([...mockStore.keys()]).toEqual(['lock:slot:1']);
});

test('clearCache(pattern) removes only that part of the cache', async () => {
  await clearCache('/api/courses');
  expect([...mockStore.keys()].sort()).toEqual(['express_cache:/api/blogs', 'express_cache:/api/blogs?page=2', 'express_cache:/api/news', 'lock:slot:1']);
});
