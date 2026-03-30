// backend/src/services/dataRetention.js
// GDPR data retention: anonymize/hard-delete users whose deletedAt is old enough.
const prisma = require('../prisma');

const RETENTION_DAYS = parseInt(process.env.DATA_RETENTION_DAYS || '90', 10);

async function runDataRetention() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

  // Find soft-deleted users past retention window
  const candidates = await prisma.user.findMany({
    where: {
      deletedAt: { not: null, lte: cutoff },
      // Only anonymize if not already done (name still set)
      NOT: { name: '[PURGED]' },
    },
    select: { id: true },
  });

  if (candidates.length === 0) {
    console.log('🔒 Data Retention: no users to purge.');
    return { purged: 0 };
  }

  const ids = candidates.map((u) => u.id);

  // Further anonymize (already anonymized on deletion, this is a final cleanup)
  await prisma.user.updateMany({
    where: { id: { in: ids } },
    data: {
      name: '[PURGED]',
      username: `purged_${Date.now()}`,
      password: null,
    },
  });

  // Hard-delete consent logs older than retention window for these users
  await prisma.consentLog.deleteMany({
    where: {
      userId: { in: ids },
      createdAt: { lte: cutoff },
    },
  });

  console.log(`🔒 Data Retention: purged ${ids.length} user(s).`);
  return { purged: ids.length };
}

module.exports = { runDataRetention, RETENTION_DAYS };
