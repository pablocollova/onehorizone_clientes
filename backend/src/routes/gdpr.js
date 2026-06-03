// backend/src/routes/gdpr.js
const router = require("express").Router();
const prisma = require("../prisma");
const { getJwtSecret, requireAuth } = require("../middleware/auth");
const auditLog = require("../middleware/auditLog");

function publicUserData(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    clientId: user.clientId,
    status: user.status,
    role: user.role,
    phone: user.phone,
    address: user.address,
    docType: user.docType,
    docNumber: user.docNumber,
    emailVerifiedAt: user.emailVerifiedAt,
    consentedAt: user.consentedAt,
    deletedAt: user.deletedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    consentLogs: user.consentLogs || [],
  };
}

// Public route to store cookie consent
router.post("/consent", async (req, res) => {
  try {
    const { type, value, source } = req.body;
    
    // Accept array of consents
    const consents = Array.isArray(req.body) ? req.body : [{ type, value, source }];
    
    // We try to get userId if they pass a token, but it's optional here for public banners
    let userId = null;
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    
    if (token) {
      const jwt = require("jsonwebtoken");
      try {
        const payload = jwt.verify(token, getJwtSecret());
        userId = payload.userId || payload.id;
      } catch (e) {
        // ignore invalid token for public consent
      }
    }

    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;

    const createData = consents.map(c => ({
      userId,
      type: c.type,
      value: Boolean(c.value),
      source: c.source || "cookie_banner",
      ipAddress,
      userAgent
    }));

    await prisma.consentLog.createMany({
      data: createData
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("🔥 Error in POST /gdpr/consent:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.use((req, res, next) => {
  if (req.query.token) {
    return res.status(400).json({ error: "Token query parameter is not supported" });
  }
  next();
});

// Protect all following routes
router.use(requireAuth);

// Get all user personal data
router.get("/me/data", auditLog("GDPR_ACCESS"), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        consentLogs: { orderBy: { createdAt: 'desc' }, take: 50 },
      }
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user: publicUserData(user) });
  } catch (error) {
    console.error("🔥 Error in GET /gdpr/me/data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Export user personal data as JSON
router.get("/me/export", auditLog("GDPR_EXPORT"), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        consentLogs: true,
      }
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="gdpr_export_${userId}.json"`);
    res.send(JSON.stringify({ data: publicUserData(user) }, null, 2));
  } catch (error) {
    console.error("🔥 Error in GET /gdpr/me/export:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Rectify user personal data
router.put("/me/rectify", auditLog("GDPR_RECTIFY"), async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address, docType, docNumber } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(docType !== undefined && { docType }),
        ...(docNumber !== undefined && { docNumber }),
      }
    });

    res.json({ ok: true, user: publicUserData({ ...updatedUser, consentLogs: [] }) });
  } catch (error) {
    console.error("🔥 Error in PUT /gdpr/me/rectify:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Request account deletion (Right to erasure)
router.post("/me/delete", auditLog("GDPR_DELETE"), async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Soft delete / anonymize
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: "[DELETED]",
        email: null,
        phone: null,
        address: null,
        docType: null,
        docNumber: null,
        status: "DISABLED",
        deletedAt: new Date(),
        // username might be needed to keep uniques, or we randomize it
        username: `deleted_${userId}`,
      }
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("🔥 Error in POST /gdpr/me/delete:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
