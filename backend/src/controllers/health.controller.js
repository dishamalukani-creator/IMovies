import { getConnectionStatus } from '../config/db.js';

const startTime = Date.now();

/**
 * Controller for application health check
 */
export const getHealth = (req, res) => {
  const dbStatus = getConnectionStatus();
  const isHealthy = dbStatus.status === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    success: true,
    service: 'imovies-backend',
    status: isHealthy ? 'healthy' : 'degraded',
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
  });
};

export default {
  getHealth,
};
