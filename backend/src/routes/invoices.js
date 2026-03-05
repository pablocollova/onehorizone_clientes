// backend/src/routes/invoices.js
const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

const VALID_STATUSES = ["DRAFT", "ISSUED", "PAID", "OVERDUE", "CANCELED"];

// GET /invoices?clientId=&status=
// - clientId del query param es ignorado si el token ya tiene clientId (previene IDOR)
// - Si el token NO tiene clientId (admin), puede filtrar por clientId del query param
// - status es validado contra el enum InvoiceStatus del schema
router.get("/invoices", requireAuth, async (req, res) => {
    try {
        const { clientId: queryClientId, status } = req.query;

        // Validar status si se proveyó
        if (status && !VALID_STATUSES.includes(status.toUpperCase())) {
            return res.status(400).json({
                error: `Invalid status. Valid values: ${VALID_STATUSES.join(", ")}`,
            });
        }

        // req.tenantId is set by tenantMiddleware:
        //   - client roles → their clientId (always scoped, ignores query param)
        //   - PLATFORM_ADMIN → null (can filter by optional ?clientId= query param)
        const effectiveClientId = req.tenantId || queryClientId || undefined;

        const where = {};
        if (effectiveClientId) where.clientId = effectiveClientId;
        if (status) where.status = status.toUpperCase();

        const invoices = await prisma.invoice.findMany({
            where,
            select: {
                id: true,
                number: true,
                type: true,
                status: true,
                issueDate: true,
                dueDate: true,
                currency: true,
                totalCents: true,
                clientId: true,
                locationId: true,
            },
            orderBy: { issueDate: "desc" },
        });

        return res.json({ invoices, total: invoices.length });
    } catch (error) {
        console.error("🔥 Error en GET /invoices:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
