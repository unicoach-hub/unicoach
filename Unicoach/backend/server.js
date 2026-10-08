// server.js - Entry point for backend API
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

require('dotenv').config();

// ── Sentry Error Tracking (must init before anything else) ──
const Sentry = require('@sentry/node');
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.2, // 20% of requests tracked for performance (saves quota)
  });
  console.log('✅ Sentry error tracking initialized');
}

process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception:', err);
  Sentry.captureException(err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
  Sentry.captureException(reason);
});


const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const adminLeadsRoutes = require('./routes/adminLeads');
const adminStatsRoutes = require('./routes/adminStats');
const adminAuthRoutes = require('./routes/adminAuth');
const uploadRoutes = require('./routes/upload');
const path = require('path');
const fs = require('fs');

const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

// Ensure uploads folder exists on startup
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const app = express();

// Trust proxy (required if running behind a reverse proxy like Nginx or on VPS for accurate IP rate limiting)
app.set('trust proxy', 1);

// Custom lightweight HTTP Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// Files in /uploads are user content: never let a browser execute them on the API origin
const sandboxUploads = (req, res, next) => {
  res.setHeader('Content-Security-Policy', "sandbox; default-src 'none'; img-src 'self' data:; media-src 'self'; style-src 'unsafe-inline'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
};

// Performance Middlwares
app.use(compression());

// Allowed origins (Local + Deployed) for security
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5000',
  'https://unicoach-blush.vercel.app',
  'https://unicoach-mjs6.vercel.app',
  'https://unicoach-1.onrender.com',
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  // Extra exact origins, comma separated (e.g. a new admin/preview domain)
  ...(process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim())
].filter(Boolean).map((o) => o.replace(/\/+$/, ''));

// Our domains (unicoach.com is the main site, unicoach.in the second one) and their subdomains
// (www, admin, api…) over HTTPS
const TRUSTED_ORIGIN_PATTERN = /^https:\/\/([a-z0-9-]+\.)*unicoach\.(com|in)$/;

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser tools (like mobile apps, curl, server-to-server) or when origin is undefined
    if (!origin) return callback(null, true);

    // Exact matches only. Substring checks like includes('vercel.app') would let ANY site on that
    // host (e.g. evil.vercel.app) make credentialed requests with a logged-in admin's cookie.
    const isAllowed = allowedOrigins.includes(origin) || TRUSTED_ORIGIN_PATTERN.test(origin);

    if (isAllowed) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    callback(new Error('CORS Error: Unauthorized origin blocked by security policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Idempotency-Key', 
    'idempotency-key', 
    'X-Idempotency-Key', 
    'x-idempotency-key',
    'Accept'
  ]
}));

app.use(express.json({
  limit: '10mb',
  // Keep the exact bytes for webhook signature verification (Razorpay signs the raw body)
  verify: (req, res, buf) => {
    if (req.originalUrl && req.originalUrl.includes('/webhooks/')) {
      req.rawBody = buf;
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize()); // must run AFTER the body parsers, otherwise JSON bodies are never sanitized

// Smart Rate Limiting: High throughput for public reading, strict for sensitive actions
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // Generous 600 requests / 15 min for shared campus Wi-Fi
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'GET', // Never block students merely reading articles/universities
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Strict rate limiting for sign-in and public form routes
const authFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts from this IP. Please try again after 15 minutes.' }
});

// Admin login: brute-force protection for the admin panel password
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' }
});

// Dedicated AI Rate Limiter: Protect LLM API credits against bots and financial DoS
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 25, // 25 AI evaluations/generations per 10 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'You have reached the AI generation limit for this session. Please try again after 10 minutes.' }
});

// Apply rate limits
app.use('/api', generalLimiter);
app.use('/api/auth/login', authFormLimiter);
app.use('/api/auth/register', authFormLimiter);
app.use('/api/auth/forgot-password', authFormLimiter);
app.use('/api/auth/reset-password', authFormLimiter);
app.use('/api/leads/submit', authFormLimiter);
app.use('/api/leads/book-consultation', authFormLimiter);
app.use('/api/events/:id/register', authFormLimiter);
app.use('/api/admin/auth/login', adminLoginLimiter);
// Public mentor application + document upload: no login required, so throttle per IP
app.use('/api/unicoach/apply', authFormLimiter);
app.use('/api/unicoach/upload-verification-doc', authFormLimiter);
// Public support form sends an email to any address: limit it so it can't be used as a spam relay
app.use('/api/support-requests', (req, res, next) => (req.method === 'POST' && req.path === '/' ? authFormLimiter(req, res, next) : next()));
app.use('/api/ai', aiLimiter);

// Serve static uploads
app.use('/uploads', sandboxUploads, express.static(uploadsDir));

// Connect to MongoDB with production connection pooling options
const mongoURI = process.env.MONGO_URI;
if (!mongoURI && process.env.NODE_ENV !== 'test') {
  console.error('FATAL: MONGO_URI environment variable is not defined. Set it in your .env file or hosting provider.');
  process.exit(1);
}

const connectMongoDB = () => {
  if (!mongoURI) return;
  console.log('🔄 Connecting to MongoDB...');
  mongoose.connect(mongoURI, {
    maxPoolSize: 100, // Handle up to 100 concurrent connections
    minPoolSize: 10,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  })
    .then(() => {
      console.log('✅ MongoDB connected with production pool options');
      require('./unicoach/services/mentorStatsService').backfillMentorStats()
        .catch((err) => console.warn('Could not backfill mentor directory stats:', err.message));
      try {
        const { initCourseUpdateScheduler } = require('./services/courseUpdateSchedulerService');
        initCourseUpdateScheduler();
      } catch (schedErr) {
        console.warn('Could not initialize course update scheduler:', schedErr.message);
      }
    })
    .catch(err => {
      console.error('⚠️ MongoDB connection error (retrying in 5 seconds):', err.message);
      setTimeout(connectMongoDB, 5000);
    });
};

if (mongoURI) {
  connectMongoDB();
} else {
  console.log('ℹ️ Running in automated test mode without MongoDB connection');
}

mongoose.connection.on('error', err => {
  console.error('Mongoose connection error after initial connection:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected! Retrying connection in 5 seconds...');
  setTimeout(connectMongoDB, 5000);
});

// Import Cache Middleware for high-performance read caching
const { cacheMiddleware } = require('./utils/cache');

// Health Check Endpoint (Required by Coolify / Docker / Load Balancers)
app.get('/api/health', (req, res) => {
  const isHealthy = mongoose.connection.readyState === 1;
  const payload = {
    status: isHealthy ? 'UP' : 'DOWN',
    timestamp: new Date().toISOString()
  };

  // Only expose internal memory and process metrics in development or with admin secret
  if (process.env.NODE_ENV !== 'production' || (process.env.HEALTH_SECRET && req.query.key === process.env.HEALTH_SECRET)) {
    payload.database = isHealthy ? 'connected' : 'disconnected';
    payload.uptime = `${Math.floor(process.uptime())}s`;
    payload.memoryUsage = `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`;
  }

  res.status(isHealthy ? 200 : 503).json(payload);
});

// Static files
app.use('/uploads', sandboxUploads, express.static(path.join(__dirname, 'uploads')));

// Public Routes with Cache Middleware (5 mins TTL for public data)
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin/upload', uploadRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/writing', require('./routes/writing'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/events', cacheMiddleware(300), require('./routes/events'));
app.use('/api/blogs', cacheMiddleware(300), require('./routes/blogs'));
app.use('/api/news', cacheMiddleware(300), require('./routes/news'));
app.use('/api/digest', cacheMiddleware(300), require('./routes/digest'));
app.use('/api/public/universities-data', cacheMiddleware(600), require('./routes/publicUniversities'));
app.use('/api/shortlist', require('./routes/shortlist'));
app.use('/api/saved-universities', require('./routes/savedUniversities'));
app.use('/api/scholarships', require('./routes/scholarships'));
app.use('/api/support-requests', require('./routes/supportRequests'));
app.use('/api/courses', require('./routes/courseRoutes'));

// Admin Routes (protected)
app.use('/api/admin/content', require('./routes/adminContent'));
app.use('/api/admin/leads', adminLeadsRoutes);
app.use('/api/admin/stats', adminStatsRoutes);
app.use('/api/admin/universities-manage', require('./routes/adminUniversities'));
app.use('/api/admin/settings-manage', require('./routes/adminSettings'));

// Admin users & employees route
app.use('/api/admin/users', require('./routes/adminUsers'));
app.use('/api/admin/employees', require('./routes/adminEmployees'));

// Admin messaging & templates
app.use('/api/admin/templates', require('./routes/adminTemplates'));
app.use('/api/admin/messaging', require('./routes/adminMessaging'));

// CRM — Pipelines, Forms & Bookings (admin)
app.use('/api/admin/pipelines', require('./routes/adminPipelines'));
app.use('/api/admin/forms', require('./routes/adminForms'));
app.use('/api/admin/bookings', require('./routes/adminBookings'));

// Social Media Management Suite (admin)
app.use('/api/admin/social', require('./routes/adminSocial'));

// Public Forms & Bookings (no auth — shareable links)
app.use('/api/forms', require('./routes/publicForms'));
app.use('/api/bookings', require('./routes/publicBookings'));

// ── UniCoach Isolated Mentorship & Concurrency-Safe Booking Subsystem ──
app.use('/api/unicoach', require('./unicoach/routes'));
app.use('/api/admin/unicoach', require('./unicoach/routes/adminRoutes'));

// Test endpoint to verify Sentry error logging (never exposed in production: anyone could flood Sentry)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/debug-sentry', (req, res) => {
    throw new Error('UniCoach Sentry Test Error! Sentry monitoring is working perfectly.');
  });
}

// Sentry express error handler
if (typeof Sentry.setupExpressErrorHandler === 'function') {
  Sentry.setupExpressErrorHandler(app);
}

// Global centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Centralized error handler caught error:', err);
  Sentry.captureException(err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong on the server.' : err.message
  });
});

const PORT = process.env.PORT || 5000;
let server = null;

// Only bind HTTP listener when not running in automated testing mode
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => console.log(`🚀 Backend server running on port ${PORT}`));

  // Graceful Shutdown Handlers for Docker / Coolify zero-downtime redeploys
  const gracefulShutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    if (server) {
      server.close(() => {
        console.log('HTTP server closed.');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed.');
          process.exit(0);
        });
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = app;
