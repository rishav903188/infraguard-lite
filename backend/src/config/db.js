'use strict';

const mongoose = require('mongoose');
const logger = require('./logger');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

/**
 * Connect to MongoDB Atlas with retry logic.
 * @param {string} uri - MongoDB connection URI
 * @param {number} retries - remaining retry attempts
 */
async function connectDB(uri, retries = MAX_RETRIES) {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    logger.info('[DB] MongoDB connected successfully');
  } catch (err) {
    if (retries === 0) {
      logger.error('[DB] Could not connect to MongoDB after max retries. Exiting.');
      process.exit(1);
    }
    logger.warn(`[DB] Connection failed. Retrying in ${RETRY_DELAY_MS / 1000}s... (${retries} attempts left)`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return connectDB(uri, retries - 1);
  }
}

/**
 * Gracefully disconnect from MongoDB.
 */
async function disconnectDB() {
  await mongoose.disconnect();
  logger.info('[DB] MongoDB disconnected');
}

// Log mongoose connection events
mongoose.connection.on('disconnected', () => logger.warn('[DB] MongoDB disconnected'));
mongoose.connection.on('reconnected', () => logger.info('[DB] MongoDB reconnected'));
mongoose.connection.on('error', (err) => logger.error('[DB] MongoDB error:', err));

module.exports = { connectDB, disconnectDB };
