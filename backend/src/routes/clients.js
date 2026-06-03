// backend/src/routes/clients.js
const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

// GET /clients
// - Si el token tiene clientId → devuelve solo ese client (array de 1)
// - Si clientId es null (admin) → devuelve todos
router.get("/clients", requireAuth, async (req, res) => {
    try {
        const where = req.tenantId ? { id: req.tenantId } : {};
        const clients = await prisma.client.findMany({
            where,
            select: { id: true, name: true, email: true, createdAt: true },
            orderBy: { name: "asc" },
        });

        return res.json({ clients });
    } catch (error) {
        console.error("🔥 Error en GET /clients:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /clients/:id/locations
// - Valida que el client exista (404)
// - Si el token tiene clientId y no coincide con :id → 403
// - Si existe pero sin locations → devuelve array vacío
router.get("/clients/:id/locations", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        // Verify authorization: scoped clients can only see their own
        if (req.tenantId && req.tenantId !== id) {
            return res.status(403).json({ error: "Forbidden: client id mismatch" });
        }

        // Verificar que el client existe
        const client = await prisma.client.findUnique({
            where: { id },
            select: { id: true, name: true },
        });

        if (!client) {
            return res.status(404).json({ error: "Client not found" });
        }

        const locations = await prisma.location.findMany({
            where: { clientId: id },
            select: {
                id: true,
                label: true,
                address: true,
                city: true,
                country: true,
                createdAt: true,
            },
            orderBy: { label: "asc" },
        });

        return res.json({ clientId: id, locations });
    } catch (error) {
        console.error("🔥 Error en GET /clients/:id/locations:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
