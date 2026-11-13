// The admin API must refuse writes that did not come from our own admin panel: the admin cookie is
// SameSite=None, so a cross-site form POST would otherwise carry it (CSRF).
const { sameOriginOnly } = require('../middleware/sameOrigin');

const guard = sameOriginOnly({
  allowedOrigins: ['https://unicoach-nine.vercel.app', 'http://localhost:5174/'],
  trustedPattern: /^https:\/\/([a-z0-9-]+\.)*unicoach\.(com|in)$/,
});

const run = (headers = {}, method = 'POST') => {
  const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  const req = { method, get: (h) => lower[h.toLowerCase()] };
  const res = { code: 200 };
  res.status = (c) => { res.code = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  let passed = false;
  guard(req, res, () => { passed = true; });
  return { passed, code: res.code, body: res.body };
};

describe('admin CSRF guard', () => {
  it('lets a write from the admin panel through', () => {
    expect(run({ Origin: 'https://unicoach-nine.vercel.app' }).passed).toBe(true);
  });

  it('lets a write from our own domain and its subdomains through', () => {
    expect(run({ Origin: 'https://admin.unicoach.com' }).passed).toBe(true);
    expect(run({ Origin: 'https://www.unicoach.in' }).passed).toBe(true);
  });

  it('ignores a trailing slash in the configured origin', () => {
    expect(run({ Origin: 'http://localhost:5174' }).passed).toBe(true);
  });

  it('blocks a cross-site form post from an attacker page', () => {
    const r = run({ Origin: 'https://evil.example.com' });
    expect(r.passed).toBe(false);
    expect(r.code).toBe(403);
  });

  it('blocks a look-alike domain', () => {
    expect(run({ Origin: 'https://unicoach.com.evil.net' }).passed).toBe(false);
    expect(run({ Origin: 'http://unicoach.com' }).passed).toBe(false); // http, not https
  });

  it('falls back to the Referer when there is no Origin', () => {
    expect(run({ Referer: 'https://admin.unicoach.com/unicoach' }).passed).toBe(true);
    expect(run({ Referer: 'https://evil.example.com/page' }).passed).toBe(false);
  });

  it('never lets a cookie-only request through without an origin', () => {
    const r = run({ Cookie: 'admin_token=abc' });
    expect(r.passed).toBe(false);
    expect(r.code).toBe(403);
  });

  it('allows a server-to-server call that carries a Bearer token', () => {
    expect(run({ Authorization: 'Bearer abc.def.ghi' }).passed).toBe(true);
    expect(run({ Authorization: 'Bearer ' }).passed).toBe(false);
  });

  it('allows any local port while developing, but never on the live server', () => {
    const was = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    expect(run({ Origin: 'http://localhost:5181' }).passed).toBe(true);
    process.env.NODE_ENV = 'production';
    expect(run({ Origin: 'http://localhost:5181' }).passed).toBe(false);
    process.env.NODE_ENV = was;
  });

  it('never blocks reads', () => {
    expect(run({ Origin: 'https://evil.example.com' }, 'GET').passed).toBe(true);
    expect(run({}, 'HEAD').passed).toBe(true);
    expect(run({}, 'OPTIONS').passed).toBe(true);
  });

  it('blocks every other write method from an attacker page', () => {
    for (const m of ['PUT', 'PATCH', 'DELETE']) {
      expect(run({ Origin: 'https://evil.example.com' }, m).passed).toBe(false);
    }
  });
});
