const router = require('express').Router();
const prisma = require('../prisma');
const internal = role => ['PLATFORM_ADMIN', 'PLATFORM_USER'].includes(role);

router.get('/options', async (req, res, next) => {
    if (!internal(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    try {
        const [clients, vendors] = await Promise.all([
            prisma.client.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
            prisma.vendor.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
        ]);
        res.json({ clients, vendors });
    } catch (error) { next(error); }
});

router.get('/services', async (req, res, next) => {
    const global = internal(req.user.role);
    if (!global && !req.tenantId) return res.status(403).json({ error: 'Company required' });
    const { status, clientId } = req.query;
    if ((status && !['PENDING', 'COMPLETED', 'CANCELED'].includes(status)) ||
        (clientId && typeof clientId !== 'string')) return res.status(400).json({ error: 'Invalid filter' });
    if (!global && clientId && clientId !== req.tenantId) return res.status(403).json({ error: 'Forbidden' });
    try {
        const scope = global ? clientId : req.tenantId;
        const records = await prisma.serviceRecord.findMany({
            where: { ...(scope ? { clientId: scope } : {}), ...(status ? { status } : {}) },
            select: {
                id: true, title: true, description: true, status: true, serviceDate: true,
                clientId: true, location: { select: { id: true, label: true } },
                client: { select: { id: true, name: true } }, vendor: { select: { id: true, name: true } },
                invoice: { select: { id: true, number: true } },
                ...(global ? { costCents: true, currency: true, billingMode: true } : {}),
            }, orderBy: { serviceDate: 'desc' },
        });
        res.json({ records });
    } catch (error) { next(error); }
});
module.exports = router;
