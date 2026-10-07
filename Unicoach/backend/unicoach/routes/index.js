const express = require('express');
const router = express.Router();
const publicRoutes = require('./publicRoutes');
const mentorRoutes = require('./mentorRoutes');
const { getUniCoachConnection } = require('../config/db');
const { redisClient } = require('../config/redis');

/**
 * GET /api/unicoach/health
 * Subsystem diagnostic health endpoint
 */
router.get('/health', (req, res) => {
  const dbConn = getUniCoachConnection();
  const isDbReady = (dbConn.readyState === 1) || (dbConn.connection && dbConn.connection.readyState === 1);
  const isRedisReady = Boolean(redisClient && redisClient.status === 'ready');

  res.json({
    subsystem: 'UniCoach (Mentorship & Booking Engine)',
    status: isDbReady ? 'HEALTHY' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    components: {
      database: isDbReady ? 'CONNECTED' : 'DISCONNECTED',
      databaseMode: process.env.UNICOACH_MONGO_URI ? 'DEDICATED' : 'SHARED',
      distributedLockEngine: isRedisReady ? 'REDIS' : 'IN_MEMORY_FALLBACK'
    },
    version: '1.0.0-modular'
  });
});

// Mount Admin Management Suite
router.use('/admin', require('./adminRoutes'));

// Mount Mentor Management
router.use('/mentors', mentorRoutes);

// Mount Public Profile & 2-Phase Booking Routes
router.use('/', publicRoutes);

module.exports = router;
