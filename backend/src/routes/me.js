// backend/src/routes/me.js
const router = require("express").Router();
const prisma = require("../prisma");  // 👈 SIN llaves { }
const { requireAuth } = require("../middleware/auth");

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { client: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      clientId: user.clientId,
      client: user.client ? { 
        id: user.client.id, 
        name: user.client.name, 
        email: user.client.email 
      } : null,       
    });
  } catch (error) {
    console.error('🔥 Error en /me:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
