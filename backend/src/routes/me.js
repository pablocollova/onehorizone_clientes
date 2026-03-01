// backend/src/routes/me.js
const router = require("express").Router();
const prisma = require("../prisma");  // 👈 SIN llaves { }
const { requireAuth } = require("../middleware/auth");

router.get("/me", requireAuth, async (req, res) => {
  try {
    console.log('🔍 Buscando usuario con ID:', req.user.userId);
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { client: true },
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return res.status(404).json({ error: "User not found" });
    }

    console.log('✅ Usuario encontrado:', user.username);
    
    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
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