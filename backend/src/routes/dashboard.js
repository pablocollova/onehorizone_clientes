// backend/src/routes/dashboard.js
const router = require("express").Router();
const { prisma } = require("../prisma");
const { requireAuth } = require("../middleware/auth");

router.get("/dashboard/summary", requireAuth, async (req, res) => {
  const clientId = req.user.clientId;

  // Si todavía no hay data real, devolvemos algo usable para el front
  const invoicesTotal = await prisma.invoice.count({ where: { clientId } });
  const pendingInvoices = await prisma.invoice.count({
    where: { clientId, status: { in: ["ISSUED", "OVERDUE"] } },
  });

  const recentDocuments = await prisma.document.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, mimeType: true, sizeBytes: true, createdAt: true },
  });

  res.json({
    cards: {
      currentBalanceCents: 1245000, // MVP: fijo por ahora (luego lo calculamos con invoices/payments)
      balanceByLocationCents: 420000,
      pendingInvoices,
      invoicesTotal,
    },
    recentDocuments,
  });
});

module.exports = router;