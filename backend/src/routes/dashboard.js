const router = require('express').Router();
const prisma = require('../prisma');
const { statement } = require('../services/accounts');
router.get('/', async (req, res, next) => {
    try {
        const clientId = req.tenantId;
        if (!clientId && !['PLATFORM_ADMIN', 'PLATFORM_USER'].includes(req.user.role)) return res.status(401).json({ error: 'UNAUTHORIZED_CLIENT_REQUIRED' });
        const where = clientId ? { clientId } : {};
        const [recentDocuments, pendingCount, account] = await Promise.all([
            prisma.document.findMany({ where, take: 4, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, mimeType: true, sizeBytes: true, createdAt: true } }),
            prisma.invoice.count({ where: { ...where, status: { in: ['ISSUED', 'OVERDUE'] } } }),
            clientId ? statement(req.user, clientId) : null,
        ]);
        const locations = new Map();
        for (const invoice of account?.invoices || []) {
            if (invoice.eligible && invoice.currency === 'EUR' && invoice.recipient === 'ONE_HORIZON' && invoice.locationId) locations.set(invoice.locationId, (locations.get(invoice.locationId) || 0) + invoice.totalCents - invoice.appliedCents);
        }
        res.json({
            currentBalance: account ? account.balances.find(x => x.currency === 'EUR' && x.recipient === 'ONE_HORIZON').netCents / 100 : null,
            balanceByLocation: account ? Math.max(0, ...locations.values()) / 100 : null,
            monetaryScope: 'EUR_ONE_HORIZON_NET_ONLY; use balances per currency and recipient; select a company for financial data',
            pendingInvoices: account ? account.invoices.filter(x => x.eligible && x.totalCents > x.appliedCents).length : pendingCount,
            balances: account?.balances || [], warnings: account?.warnings || {}, recentDocuments,
        });
    } catch (error) { next(error); }
});
module.exports = router;
