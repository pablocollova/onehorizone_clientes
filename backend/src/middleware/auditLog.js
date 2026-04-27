// backend/src/middleware/auditLog.js
// Records audit trail for personal data access operations (GDPR Art. 30 requirement)
const prisma = require('../prisma');

/**
 * Factory: returns Express middleware that logs the given action to AuditLog.
 * Usage: router.get('/route', requireAuth, auditLog('GDPR_ACCESS'), handler)
 */
function auditLog(action) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId || req.user?.id || null;
      const ip =
        req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.socket?.remoteAddress ||
        null;

      const writeAuditLog = prisma.auditLog.create({
        data: {
          userId,
          action,
          endpoint: `${req.method} ${req.originalUrl}`,
          ipAddress: ip,
          userAgent: req.headers['user-agent'] || null,
        },
      });

      if (process.env.NODE_ENV === 'test') {
        await writeAuditLog;
      } else {
        // Fire-and-forget outside tests — don't block the request.
        writeAuditLog.catch((err) => console.error('⚠️ AuditLog write failed:', err.message));
      }
    } catch (err) {
      console.error('⚠️ AuditLog middleware error:', err.message);
    }
    next();
  };
}

module.exports = auditLog;
