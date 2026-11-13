// Per-account lockout: too many wrong passwords for one account locks that account, whatever
// address the attempts come from. Runs on the in-memory store (no REDIS_URL in tests).
delete process.env.REDIS_URL;
const throttle = require('../services/loginThrottle');

beforeEach(() => { throttle._memory.clear(); });

const fail = (account, times) => Promise.all([]).then(async () => {
  let locked = 0;
  for (let i = 0; i < times; i += 1) locked = await throttle.recordFailure(account);
  return locked;
});

describe('admin login throttle', () => {
  it('lets a few typos through without locking anything', async () => {
    expect(await fail('sagar', throttle.MAX_FAILURES - 1)).toBe(0);
    expect(await throttle.retryAfter('sagar')).toBe(0);
  });

  it('locks the account once the limit is reached', async () => {
    expect(await fail('sagar', throttle.MAX_FAILURES)).toBe(throttle.LOCK_SECONDS);
    expect(await throttle.retryAfter('sagar')).toBeGreaterThan(0);
  });

  it('locks only that account, not everyone else', async () => {
    await fail('sagar', throttle.MAX_FAILURES);
    expect(await throttle.retryAfter('mayur@visawebs.com')).toBe(0);
  });

  it('treats the same account the same however it is typed', async () => {
    await fail('  Mayur@Visawebs.com ', throttle.MAX_FAILURES);
    expect(await throttle.retryAfter('mayur@visawebs.com')).toBeGreaterThan(0);
  });

  it('clears the count on a correct password', async () => {
    await fail('sagar', throttle.MAX_FAILURES - 1);
    await throttle.recordSuccess('sagar');
    // the counter restarted, so one more failure is nowhere near the limit
    expect(await fail('sagar', 1)).toBe(0);
    expect(await throttle.retryAfter('sagar')).toBe(0);
  });

  it('a correct password also ends an active lock', async () => {
    await fail('sagar', throttle.MAX_FAILURES);
    await throttle.recordSuccess('sagar');
    expect(await throttle.retryAfter('sagar')).toBe(0);
  });

  it('tells the user how long to wait, in minutes', () => {
    expect(throttle.lockMessage(900)).toContain('15 minutes');
    expect(throttle.lockMessage(30)).toContain('1 minute');
    expect(throttle.lockMessage(30)).not.toContain('1 minutes');
  });
});
