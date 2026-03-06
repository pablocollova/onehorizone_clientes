// Health check mejorado - RESPONDE RÁPIDO
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Health check detallado (opcional)
app.get('/health/detailed', async (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: 'unknown',
    memory: process.memoryUsage()
  };
  
  try {
    // Prueba DB
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    healthcheck.database = 'connected';
    await prisma.$disconnect();
  } catch (e) {
    healthcheck.database = 'disconnected';
  }
  
  res.status(200).json(healthcheck);
});

module.exports = router;