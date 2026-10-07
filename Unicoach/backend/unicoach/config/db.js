const mongoose = require('mongoose');

/**
 * UniCoach Database Connection Resolver
 * 
 * Supports two operational modes:
 * 1. Independent Database Mode: If UNICOACH_MONGO_URI is set in process.env, 
 *    it creates a dedicated Mongoose connection pool for UniCoach.
 * 2. Shared Database Mode: Falls back to the global Mongoose connection, 
 *    using distinct 'unicoach_' collection names to prevent interference.
 */

let unicoachConnection = null;

const getUniCoachConnection = () => {
  if (process.env.UNICOACH_MONGO_URI) {
    if (!unicoachConnection) {
      unicoachConnection = mongoose.createConnection(process.env.UNICOACH_MONGO_URI, {
        maxPoolSize: 50,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
      });

      unicoachConnection.on('connected', () => {
        console.log('✅ UniCoach: Connected to dedicated independent MongoDB database');
      });

      unicoachConnection.on('error', (err) => {
        console.error('❌ UniCoach: Dedicated MongoDB connection error:', err.message);
      });
    }
    return unicoachConnection;
  }

  // Shared connection fallback
  return mongoose;
};

/**
 * Helper to register models on the resolved connection
 */
const createUniCoachModel = (modelName, schema, collectionName) => {
  const conn = getUniCoachConnection();
  // Ensure collection has unicoach_ prefix for safe namespace isolation
  const finalCollection = collectionName || `unicoach_${modelName.toLowerCase()}s`;
  
  if (conn.models && conn.models[modelName]) {
    return conn.models[modelName];
  }
  return conn.model(modelName, schema, finalCollection);
};

module.exports = {
  getUniCoachConnection,
  createUniCoachModel
};
