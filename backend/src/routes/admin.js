// backend/src/routes/admin.js
const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const { inviteUser, InvitationError } = require("../services/invitations");
const prisma = require("../prisma");

// Allowed roles for inviting
const INVITE_ROLES = ["PLATFORM_ADMIN", "CLIENT_ADMIN"];

function invitationHandler(requireExplicitRole) {
    return async (req, res, next) => {
        try {
            const inviteLink = await inviteUser(req.user, req.body, { requireExplicitRole });
            return res.json(requireExplicitRole
                ? { ok: true, message: "Invitation sent successfully" }
                : { ok: true, inviteLink, message: "Invitation sent" });
        } catch (error) {
            if (error instanceof InvitationError) return res.status(error.status).json({ error: error.message });
            return next(error);
        }
    };
}

router.post("/users/invite", requireAuth, requireRole(INVITE_ROLES), invitationHandler(true));

// POST /api/admin/clients — PLATFORM_ADMIN only
router.post("/clients", requireAuth, requireRole(["PLATFORM_ADMIN"]), async (req, res) => {
    try {
        let { name, email } = req.body;

        // Validation
        if (!name || !email) {
            return res.status(400).json({ error: "VALIDATION_ERROR", message: "name and email are required" });
        }
        name = name.trim();
        email = email.trim().toLowerCase();

        if (!name || !email) {
            return res.status(400).json({ error: "VALIDATION_ERROR", message: "name and email cannot be blank" });
        }

        // Duplicate check
        const existing = await prisma.client.findFirst({ where: { email } });
        if (existing) {
            return res.status(409).json({ error: "CLIENT_EMAIL_EXISTS", message: "A client with this email already exists" });
        }

        const client = await prisma.client.create({
            data: { name, email },
        });

        return res.status(201).json({
            id: client.id,
            name: client.name,
            email: client.email,
            createdAt: client.createdAt,
        });
    } catch (error) {
        console.error("🔥 Error creating client:", error);
        return res.status(500).json({ error: "CLIENT_CREATE_FAILED" });
    }
});

// GET /api/admin/clients — PLATFORM_ADMIN only
router.get("/clients", requireAuth, requireRole(["PLATFORM_ADMIN"]), async (req, res) => {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { createdAt: "asc" },
            include: {
                _count: {
                    select: { users: true, locations: true, invoices: true }
                }
            }
        });
        return res.json(clients);
    } catch (error) {
        console.error("🔥 Error fetching clients:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/admin/users — PLATFORM_ADMIN only
router.get("/users", requireAuth, requireRole(["PLATFORM_ADMIN"]), async (req, res) => {
    try {
        const { clientId } = req.query;
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "asc" },
            where: clientId ? { clientId } : undefined,
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                role: true,
                status: true,
                createdAt: true,
                client: { select: { id: true, name: true } }
            }
        });
        return res.json(users);
    } catch (error) {
        console.error("🔥 Error fetching users:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// ─── Invoices ─────────────────────────────────────────────────────────────────

// GET /api/admin/invoices — list with optional filters: clientId, type, status
router.get("/invoices", requireAuth, requireRole(["PLATFORM_ADMIN"]), async (req, res) => {
    try {
        const { clientId, type, status } = req.query;
        const where = {};
        if (clientId) where.clientId = clientId;
        if (type) where.type = type;
        if (status) where.status = status;

        const invoices = await prisma.invoice.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                client: { select: { id: true, name: true } },
                location: { select: { id: true, label: true } },
                vendor: { select: { id: true, name: true } },
            },
        });
        return res.json(invoices);
    } catch (error) {
        console.error("🔥 Error fetching invoices:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/admin/invoices — create a new invoice
router.post("/invoices", requireAuth, requireRole(["PLATFORM_ADMIN"]), async (req, res) => {
    try {
        const { clientId, locationId, vendorId, type, totalCents, currency, dueDate, status, number } = req.body;

        if (!clientId || !type || totalCents === undefined) {
            return res.status(400).json({ error: "clientId, type, and totalCents are required" });
        }

        const validTypes = ["ONEHORIZON_FEE", "VENDOR_REBILL", "VENDOR_DIRECT"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: `type must be one of: ${validTypes.join(", ")}` });
        }

        const invoice = await prisma.invoice.create({
            data: {
                clientId,
                locationId: locationId || null,
                vendorId: vendorId || null,
                type,
                totalCents: Number(totalCents),
                currency: currency || "EUR",
                dueDate: dueDate ? new Date(dueDate) : null,
                status: status || "ISSUED",
                number: number || null,
            },
            include: {
                client: { select: { id: true, name: true } },
                location: { select: { id: true, label: true } },
                vendor: { select: { id: true, name: true } },
            },
        });
        return res.status(201).json(invoice);
    } catch (error) {
        console.error("🔥 Error creating invoice:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// PATCH /api/admin/invoices/:id — update an invoice
router.patch("/invoices/:id", requireAuth, requireRole(["PLATFORM_ADMIN"]), async (req, res) => {
    try {
        const existing = await prisma.invoice.findUnique({ where: { id: req.params.id } });
        if (!existing) return res.status(404).json({ error: "Invoice not found" });

        const allowed = ["clientId", "locationId", "vendorId", "type", "totalCents", "currency", "dueDate", "status", "number"];
        const data = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) {
                if (key === "totalCents") data[key] = Number(req.body[key]);
                else if (key === "dueDate") data[key] = req.body[key] ? new Date(req.body[key]) : null;
                else data[key] = req.body[key] || null;
            }
        }

        const invoice = await prisma.invoice.update({
            where: { id: req.params.id },
            data,
            include: {
                client: { select: { id: true, name: true } },
                location: { select: { id: true, label: true } },
                vendor: { select: { id: true, name: true } },
            },
        });
        return res.json(invoice);
    } catch (error) {
        console.error("🔥 Error updating invoice:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// ─── Service Records ──────────────────────────────────────────────────────────

// GET /api/admin/service-records — list with optional filters: clientId, billingMode, status
router.get("/service-records", requireAuth, requireRole(["PLATFORM_ADMIN"]), async (req, res) => {
    try {
        const { clientId, billingMode, status } = req.query;
        const where = {};
        if (clientId) where.clientId = clientId;
        if (billingMode) where.billingMode = billingMode;
        if (status) where.status = status;

        const records = await prisma.serviceRecord.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                client: { select: { id: true, name: true } },
                location: { select: { id: true, label: true } },
                vendor: { select: { id: true, name: true } },
                invoice: { select: { id: true, number: true } },
            },
        });
        return res.json(records);
    } catch (error) {
        console.error("🔥 Error fetching service records:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/admin/service-records — create a new service record
router.post("/service-records", requireAuth, requireRole(["PLATFORM_ADMIN"]), async (req, res) => {
    try {
        const { clientId, locationId, vendorId, title, description, serviceDate, costCents, currency, billingMode, status, invoiceId } = req.body;

        if (!clientId || !title || !serviceDate || costCents === undefined) {
            return res.status(400).json({ error: "clientId, title, serviceDate, and costCents are required" });
        }

        const validModes = ["REBILL", "DIRECT_VENDOR"];
        if (billingMode && !validModes.includes(billingMode)) {
            return res.status(400).json({ error: `billingMode must be one of: ${validModes.join(", ")}` });
        }

        const record = await prisma.serviceRecord.create({
            data: {
                clientId,
                locationId: locationId || null,
                vendorId: vendorId || null,
                title,
                description: description || null,
                serviceDate: new Date(serviceDate),
                costCents: Number(costCents),
                currency: currency || "EUR",
                billingMode: billingMode || "REBILL",
                status: status || "PENDING",
                invoiceId: invoiceId || null,
            },
            include: {
                client: { select: { id: true, name: true } },
                location: { select: { id: true, label: true } },
                vendor: { select: { id: true, name: true } },
                invoice: { select: { id: true, number: true } },
            },
        });
        return res.status(201).json(record);
    } catch (error) {
        console.error("🔥 Error creating service record:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// PATCH /api/admin/service-records/:id — update a service record
router.patch("/service-records/:id", requireAuth, requireRole(["PLATFORM_ADMIN"]), async (req, res) => {
    try {
        const existing = await prisma.serviceRecord.findUnique({ where: { id: req.params.id } });
        if (!existing) return res.status(404).json({ error: "Service record not found" });

        const allowed = ["clientId", "locationId", "vendorId", "title", "description", "serviceDate", "costCents", "currency", "billingMode", "status", "invoiceId"];
        const data = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) {
                if (key === "costCents") data[key] = Number(req.body[key]);
                else if (key === "serviceDate") data[key] = new Date(req.body[key]);
                else data[key] = req.body[key];
            }
        }

        const record = await prisma.serviceRecord.update({
            where: { id: req.params.id },
            data,
            include: {
                client: { select: { id: true, name: true } },
                location: { select: { id: true, label: true } },
                vendor: { select: { id: true, name: true } },
                invoice: { select: { id: true, number: true } },
            },
        });
        return res.json(record);
    } catch (error) {
        console.error("🔥 Error updating service record:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// Both routes share the same authorization and transactional invitation service.
router.post("/invites", requireAuth, requireRole(INVITE_ROLES), invitationHandler(false));

module.exports = router;
