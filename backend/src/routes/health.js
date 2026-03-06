// backend/src/routes/health.js
const router = require('express').Router();

// Fast health check — used by Railway to verify the service is up
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Detailed health check — includes DB connectivity
router.get('/health/detailed', async (req, res) => {
  const prisma = require('../prisma');
  const healthcheck = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: 'unknown',
    memory: process.memoryUsage()
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    healthcheck.database = 'connected';
  } catch (e) {
    healthcheck.database = 'disconnected';
  }

  res.status(200).json(healthcheck);
});

module.exports = router;