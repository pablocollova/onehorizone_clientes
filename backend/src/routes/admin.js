// backend/src/routes/admin.js
const router = require("express").Router();
const crypto = require("crypto");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const { sendActivationEmail } = require("../services/email");
const prisma = require("../prisma");

// Allowed roles for inviting
const INVITE_ROLES = ["PLATFORM_ADMIN", "CLIENT_ADMIN"];

router.post("/users/invite", requireAuth, requireRole(INVITE_ROLES), async (req, res) => {
    try {
        const { email, name, clientId, role } = req.body;

        // Validation
        if (!email || !role) {
            return res.status(400).json({ error: "email and role are required" });
        }

        if (req.user.role === "CLIENT_ADMIN") {
            // CLIENT_ADMIN can only invite to their own client
            if (clientId && clientId !== req.user.clientId) {
                return res.status(403).json({ error: "Cannot invite users for other clients" });
            }
            // Force their own clientId
            req.body.clientId = req.user.clientId;

            // CLIENT_ADMIN cannot invite PLATFORM_ADMIN
            if (role === "PLATFORM_ADMIN") {
                return res.status(403).json({ error: "Cannot invite platform admins" });
            }
        } else if (req.user.role === "PLATFORM_ADMIN") {
            // PLATFORM_ADMIN inviting CLIENT_ADMIN or CLIENT_USER needs a clientId
            if (role !== "PLATFORM_ADMIN" && !clientId) {
                return res.status(400).json({ error: "clientId is required for client roles" });
            }
        }

        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { email }
        });

        if (user) {
            if (user.status !== "INVITED") {
                return res.status(400).json({ error: "User already exists and is not in INVITED status" });
            }
            // Update existing INVITED user with new info if provided
            user = await prisma.user.update({
                where: { email },
                data: {
                    name: name || user.name,
                    role: role,
                    clientId: req.body.clientId || null, // Allow null if PLATFORM_ADMIN
                }
            });
        } else {
            // Create new user (using email as username for now to satisfy unique username constraint, 
            // but username could be handled differently if needed)
            const baseUsername = email.split('@')[0];
            let username = baseUsername;
            let counter = 1;

            // Ensure unique username
            while (await prisma.user.findUnique({ where: { username } })) {
                username = `${baseUsername}${counter}`;
                counter++;
            }

            user = await prisma.user.create({
                data: {
                    email,
                    username,
                    name: name || email.split('@')[0],
                    role,
                    clientId: req.body.clientId || null,
                    status: "INVITED"
                }
            });
        }

        // Generate Token
        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

        // Expiration 48h
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48);

        // Store Token
        await prisma.inviteToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt,
                sentToEmail: email
            }
        });

        // Send Email
        await sendActivationEmail(email, rawToken, user.name);

        return res.json({ ok: true, message: "Invitation sent successfully" });

    } catch (error) {
        console.error("🔥 Error inviting user:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

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

// POST /api/admin/invites — alias for /users/invite (spec-required path)
// Shares identical logic: creates INVITED user + InviteToken + sends/logs activation link.
const handleInvite = async (req, res) => {
    try {
        const { email, name, clientId, role = "CLIENT_USER" } = req.body;

        if (!email) {
            return res.status(400).json({ error: "email is required" });
        }

        if (req.user.role === "CLIENT_ADMIN") {
            req.body.clientId = req.user.clientId;
            if (role === "PLATFORM_ADMIN") {
                return res.status(403).json({ error: "Cannot invite platform admins" });
            }
        } else if (req.user.role === "PLATFORM_ADMIN") {
            if (role !== "PLATFORM_ADMIN" && !clientId) {
                return res.status(400).json({ error: "clientId is required for client roles" });
            }
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            if (user.status !== "INVITED") {
                return res.status(400).json({ error: "User already exists and is active" });
            }
            user = await prisma.user.update({
                where: { email },
                data: { name: name || user.name, role, clientId: req.body.clientId || null }
            });
        } else {
            const baseUsername = email.split('@')[0];
            let username = baseUsername;
            let counter = 1;
            while (await prisma.user.findUnique({ where: { username } })) {
                username = `${baseUsername}${counter++}`;
            }
            user = await prisma.user.create({
                data: {
                    email, username,
                    name: name || baseUsername,
                    role, status: "INVITED",
                    clientId: req.body.clientId || null,
                }
            });
        }

        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

        await prisma.inviteToken.create({
            data: { userId: user.id, tokenHash, expiresAt, sentToEmail: email }
        });

        // Always log the invite link in dev; sendActivationEmail does the same fallback
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const inviteLink = `${frontendUrl}/activate?token=${rawToken}`;

        await sendActivationEmail(email, rawToken, user.name);

        return res.json({ ok: true, inviteLink, message: "Invitation sent" });

    } catch (error) {
        console.error("🔥 Error in invite:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

router.post("/invites", requireAuth, requireRole(INVITE_ROLES), handleInvite);

module.exports = router;
