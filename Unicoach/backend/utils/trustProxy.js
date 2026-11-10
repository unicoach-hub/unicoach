// Which proxies Express may trust when it reads the visitor's IP from X-Forwarded-For.
// The request path on the VPS is:  visitor → (Cloudflare, when proxied) → Traefik (Coolify) → backend.
// Traefik sits on the private Docker network and Cloudflare's edge IPs are published, so we trust
// exactly those hops and nothing else. req.ip is then the real visitor, with or without Cloudflare,
// and a visitor can't fake their IP by sending their own X-Forwarded-For header.
// That matters for the rate limits (one IP = one visitor) and the city in Website Visitors.
// Cloudflare's ranges: https://www.cloudflare.com/ips/ (checked 10 Nov 2026).
const proxyaddr = require('proxy-addr');

const CLOUDFLARE_RANGES = [
  '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22', '141.101.64.0/18',
  '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20', '197.234.240.0/22', '198.41.128.0/17',
  '162.158.0.0/15', '104.16.0.0/13', '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
  '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32', '2405:8100::/32',
  '2a06:98c0::/29', '2c0f:f248::/32',
];

// loopback, linklocal and uniquelocal cover 127.0.0.0/8, 10/8, 172.16/12, 192.168/16 and their IPv6 forms (Docker)
const trustProxy = proxyaddr.compile(['loopback', 'linklocal', 'uniquelocal', ...CLOUDFLARE_RANGES]);

module.exports = { trustProxy, CLOUDFLARE_RANGES };
