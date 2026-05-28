'use strict';

// Load and validate environment variables first — fail fast if anything is missing
const { validateEnv, env } = require('./config/env');
validateEnv();

const app = require('./app');
const { connectDB } = require('./config/db');
const { startHealthCheckJob } = require('./jobs/healthCheck.job');
const logger = require('./config/logger');

let server;

async function start() {
  // 1. Connect to MongoDB
  await connectDB(env.mongoUri);

  // 2. Start cron job (only outside test environment)
  if (!env.isTest()) {
    startHealthCheckJob();
  }

  // 3. Start HTTP server
  server = app.listen(env.port, () => {
    logger.info(`[Server] InfraGuard Lite running on port ${env.port} [${env.nodeEnv}]`);
    logger.info(`[Server] API Docs → http://localhost:${env.port}/api-docs`);
    logger.info(`[Server] Health  → http://localhost:${env.port}/api/v1/health`);
  });

  server.on('error', (err) => {
    logger.error('[Server] HTTP server error:', err);
    process.exit(1);
  });
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
async function shutdown(signal) {
  logger.info(`[Server] Received ${signal}. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      const { disconnectDB } = require('./config/db');
      await disconnectDB();
      logger.info('[Server] Shutdown complete.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('[Server] Unhandled Promise Rejection:', reason);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  logger.error('[Server] Uncaught Exception:', err);
  shutdown('uncaughtException');
});

start();
