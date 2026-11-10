// req.ip must be the real visitor behind Traefik, with or without Cloudflare in front, and never a
// value the visitor typed into their own X-Forwarded-For header.
const express = require('express');
const request = require('supertest');
const { trustProxy } = require('../utils/trustProxy');

const app = express();
app.set('trust proxy', trustProxy);
app.get('/ip', (req, res) => res.json({ ip: req.ip }));
// supertest connects from 127.0.0.1, which plays Traefik on the Docker network
const ipFor = async (xff) => (await request(app).get('/ip').set('X-Forwarded-For', xff)).body.ip;

test('today: visitor → Traefik', async () => {
  expect(await ipFor('49.36.12.7')).toBe('49.36.12.7');
});

test('with Cloudflare: visitor → Cloudflare edge → Traefik', async () => {
  expect(await ipFor('49.36.12.7, 104.16.3.9')).toBe('49.36.12.7');
  expect(await ipFor('2401:4900::1, 2606:4700::6810:1')).toBe('2401:4900::1');
});

test('a faked X-Forwarded-For is ignored: the last untrusted hop wins', async () => {
  // visitor 5.6.7.8 sent "X-Forwarded-For: 1.1.1.1"; Traefik appended their real address
  expect(await ipFor('1.1.1.1, 5.6.7.8')).toBe('5.6.7.8');
  // someone pretending to be Cloudflare from outside its ranges
  expect(await ipFor('1.1.1.1, 8.8.8.8')).toBe('8.8.8.8');
});
