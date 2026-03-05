// backend/src/routes/auth.js
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const prisma = require('../prisma'); // 👈 IMPORTANTE: importar prisma
const { sendActivationEmail } = require("../services/email");

// Rate limit for resend-invite
const resendInviteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // limit each IP to 3 requests per windowMs
    message: { error: "Too many requests, please try again later." }
});

// POST /api/auth/login
router.post("/login", (req, res, next) => {
    console.log('\n--- [auth/login] Request Logger ---');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body:', JSON.stringify(req.body));
    console.log('-----------------------------------\n');
    next();
}, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "username and password required" });
        }

        console.log('🔍 Buscando usuario:', username);

        // Support login by username OR email
        const isEmail = username.includes('@');
        const user = await prisma.user.findUnique({
            where: isEmail ? { email: username } : { username },
            include: { client: true },
        });

        console.log('👤 Usuario encontrado:', user ? 'Sí' : 'No');

        // Check if user exists and has a password
        if (!user || user.status === "INVITED" || !user.password) {
            return res.status(401).json({ error: "Invalid credentials or account not active" });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Crear payload del token
        const payload = {
            id: user.id,
            clientId: user.clientId,
            username: user.username,
            role: user.role, // Added role
            status: user.status // Added status
        };

        // Generar token
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || "dev_secret",
            { expiresIn: "7d" }
        );

        console.log('✅ Login exitoso para:', username);

        return res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
                role: user.role,
                status: user.status,
                clientId: user.clientId
            },
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

        // Find valid token
        const inviteToken = await prisma.inviteToken.findFirst({
            where: {
                tokenHash,
                usedAt: null,
                expiresAt: { gt: new Date() }
            },
            include: { user: true }
        });

        if (!inviteToken) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        const user = inviteToken.user;

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update User
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                status: "ACTIVE",
                emailVerifiedAt: new Date(),
                phone: profile?.phone || user.phone,
                address: profile?.address || user.address,
                docType: profile?.docType || user.docType,
                docNumber: profile?.docNumber || user.docNumber,
                name: profile?.name || user.name
            }
        });

        // Mark token as used
        await prisma.inviteToken.update({
            where: { id: inviteToken.id },
            data: { usedAt: new Date() }
        });

        // Generate JWT for auto-login
        const payload = {
            id: updatedUser.id,
            clientId: updatedUser.clientId,
            username: updatedUser.username,
            role: updatedUser.role,
            status: updatedUser.status
        };

        const jwtToken = jwt.sign(
            payload,
            process.env.JWT_SECRET || "dev_secret",
            { expiresIn: "7d" }
        );

        return res.json({
            token: jwtToken,
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role,
                status: updatedUser.status,
                clientId: updatedUser.clientId
            }
        });

    } catch (error) {
        console.error("🔥 Error and activate:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/auth/resend-invite
router.post("/resend-invite", resendInviteLimiter, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "email is required" });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

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
                sentToEmail: email
            }
        });

        // Send Email
        await sendActivationEmail(email, rawToken, user.name);

        return res.json({ ok: true, message: "If the account exists and is pending, an email was sent" });

    } catch (error) {
        console.error("🔥 Error and resend-invite:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;