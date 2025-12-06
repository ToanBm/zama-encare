/**
 * ZamaHealth Backend Service
 * Main entry point
 */

import express from 'express';
import config from './config.mjs';
import logger from './logger.mjs';
import { startListener } from './listener.mjs';

const app = express();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Start HTTP server
app.listen(config.port, () => {
  logger.info(`ZamaHealth Backend Service started`);
  logger.info(`Port: ${config.port}`);
  logger.info(`Contract: ${config.contractAddress}`);
  logger.info(`Polling interval: ${config.pollingInterval}ms`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

logger.info('✅ Backend service initialized');
startListener().catch((err) => {
  logger.error(`❌ Listener failed: ${err}`);
});

