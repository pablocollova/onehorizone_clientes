// backend/src/routes/auth.js
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const prisma = require('../prisma'); // 👈 IMPORTANTE: importar prisma
const { signAuthToken, requireAuth } = require("../middleware/auth");
const { sendActivationEmail } = require("../services/email");

function normalizeEmail(value) {
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

async function findUnambiguousEmailUser(email, includeClient = false) {
    // Legacy rows may retain mixed case; never choose one of two case-only duplicates.
    const matches = await prisma.user.findMany({
        where: { email: { equals: email, mode: 'insensitive' } },
        take: 2,
        ...(includeClient ? { include: { client: true } } : {}),
    });
    return matches.length === 1 ? matches[0] : null;
}

function publicUser(user) {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        clientId: user.clientId,
    };
}

// Rate limit for resend-invite
const resendInviteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // limit each IP to 3 requests per windowMs
    message: { error: "Too many requests, please try again later." }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body || {};

        if (typeof username !== 'string' || !username || typeof password !== 'string' || !password) {
            return res.status(400).json({ error: "username and password required" });
        }
        // Support login by username OR email
        const isEmail = username.includes('@');
        const user = isEmail
            ? await findUnambiguousEmailUser(normalizeEmail(username), true)
            : await prisma.user.findUnique({ where: { username }, include: { client: true } });

        // Check if user exists and has a password
        if (!user || user.status !== "ACTIVE" || user.deletedAt || !user.password) {
            return res.status(401).json({ error: "Invalid credentials or account not active" });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = signAuthToken(user);

        return res.json({
            token,
            user: publicUser(user),
        });

    } catch (error) {
        console.error('🔥 Error en login:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/auth/activate
router.post("/activate", async (req, res) => {
    try {
        const { token, password, profile } = req.body;

        if (!token || !password) {
            return res.status(400).json({ error: "token and password required" });
        }

        // Hash the incoming token
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        const hashedPassword = await bcrypt.hash(password, 10);
        // Consume the token and activate only a pending account in one transaction.
        const updatedUser = await prisma.$transaction(async (tx) => {
            const inviteToken = await tx.inviteToken.findFirst({
                where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
                include: { user: true },
            });
            if (!inviteToken || inviteToken.user.status !== "INVITED" || inviteToken.user.deletedAt) return null;
            const consumed = await tx.inviteToken.updateMany({
                where: { id: inviteToken.id, usedAt: null, expiresAt: { gt: new Date() } },
                data: { usedAt: new Date() },
            });
            if (consumed.count !== 1) return null;
            const user = inviteToken.user;
            const activated = await tx.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword, status: "ACTIVE", emailVerifiedAt: new Date(),
                    sessionVersion: { increment: 1 },
                    phone: profile?.phone || user.phone, address: profile?.address || user.address,
                    docType: profile?.docType || user.docType, docNumber: profile?.docNumber || user.docNumber,
                    name: profile?.name || user.name,
                },
            });
            await tx.inviteToken.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } });
            return activated;
        }, { isolationLevel: 'Serializable' });
        if (!updatedUser) return res.status(400).json({ error: "Invalid or expired token" });

        const jwtToken = signAuthToken(updatedUser);

        return res.json({
            token: jwtToken,
            user: publicUser(updatedUser)
        });

    } catch (error) {
        if (error.code === "P2034") return res.status(409).json({ error: "Activation changed concurrently; retry" });
        console.error("🔥 Error and activate:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/auth/resend-invite
router.post("/resend-invite", resendInviteLimiter, async (req, res) => {
    try {
        const email = normalizeEmail(req.body?.email);

        if (!email) {
            return res.status(400).json({ error: "email is required" });
        }

        const user = await findUnambiguousEmailUser(email);

        if (!user || user.status !== "INVITED") {
            // Return success even if not found to prevent email enumeration
            return res.json({ ok: true, message: "If the account exists and is pending, an email was sent" });
        }

        // Generate new token
        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48);

        // Invalidate old unused tokens (optional but good practice)
        await prisma.inviteToken.updateMany({
            where: {
                userId: user.id,
                usedAt: null
            },
            data: {
                usedAt: new Date() // Mark as used to invalidate
            }
        });

        // Store new Token
        await prisma.inviteToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt,
                sentToEmail: user.email
            }
        });

        // Send Email
        await sendActivationEmail(user.email, rawToken, user.name);

        return res.json({ ok: true, message: "If the account exists and is pending, an email was sent" });

    } catch (error) {
        console.error("🔥 Error and resend-invite:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// Revokes every token for this account, including the token making this request.
router.post("/logout", requireAuth, async (req, res, next) => {
    try {
        await prisma.user.update({ where: { id: req.user.id }, data: { sessionVersion: { increment: 1 } } });
        return res.json({ ok: true });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
