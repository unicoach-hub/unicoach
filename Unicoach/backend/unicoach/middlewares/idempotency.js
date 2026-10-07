const { 
  getIdempotencyRecord, 
  markInProgress, 
  storeCompletedResponse 
} = require('../services/idempotencyService');

/**
 * Idempotency Enforcement Middleware (Pillar #3)
 * 
 * Inspects `Idempotency-Key` or `X-Idempotency-Key` header.
 * - If request is in progress: returns 409 Conflict.
 * - If request has already completed: returns previously cached response.
 * - Otherwise: marks as IN_PROGRESS and caches response on completion.
 */
const idempotencyMiddleware = async (req, res, next) => {
  // Only apply to state-modifying requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
  if (!idempotencyKey) {
    // If no key provided, continue normally
    return next();
  }

  try {
    const existing = await getIdempotencyRecord(idempotencyKey);

    if (existing) {
      if (existing.status === 'IN_PROGRESS') {
        return res.status(409).json({
          error: 'Conflict: A request with this Idempotency-Key is currently being processed. Please wait.'
        });
      }

      if (existing.status === 'COMPLETED') {
        res.setHeader('X-Cache-Lookup', 'IDEMPOTENT-HIT');
        return res.status(existing.statusCode).json(existing.responseBody);
      }
    }

    // Mark in progress
    await markInProgress(idempotencyKey);

    // Intercept response to store on success
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Store in background
      storeCompletedResponse(idempotencyKey, res.statusCode, body).catch(err => {
        console.warn('Failed to store idempotency record:', err.message);
      });
      return originalJson(body);
    };

    next();
  } catch (err) {
    console.error('Idempotency middleware error:', err);
    next();
  }
};

module.exports = idempotencyMiddleware;
