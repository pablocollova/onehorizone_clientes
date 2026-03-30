require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('ConsentLog','GdprRequest','AuditLog') ORDER BY table_name`
  .then(r => { console.log('Tables found:', JSON.stringify(r)); })
  .catch(e => { console.error('Error:', e.message); })
  .finally(() => p.$disconnect());
