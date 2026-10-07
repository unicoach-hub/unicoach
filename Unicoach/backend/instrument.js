// instrument.js - Sentry initialization
require('dotenv').config();
const Sentry = require('@sentry/node');

const dsn = process.env.SENTRY_DSN || "https://bf36504726688a72a5e53902c68e690e@o4511976683143168.ingest.us.sentry.io/4511976696512512";

if (dsn) {
  Sentry.init({
    dsn: dsn,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 0.2, // Track 20% of requests for performance monitoring
  });
  console.log('✅ Sentry APM & Error Tracking initialized');
}

module.exports = Sentry;
