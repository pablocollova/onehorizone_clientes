// backend/src/routes/dashboard.js
const express = require("express");
const prisma = require("../prisma"); // 👈 Importamos la instancia ya configurada con adapter

const router = express.Router();

function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let num = bytes;
  while (num >= 1024 && i < units.length - 1) {
    num /= 1024;
    i++;
  }
  const fixed = i === 0 ? 0 : 1;
  return `${num.toFixed(fixed)} ${units[i]}`;
}

function docTypeLabel(doc) {
  const mt = (doc.mimeType || "").toLowerCase();
  const name = (doc.name || "").toLowerCase();

  if (mt.includes("pdf") || name.endsWith(".pdf")) return "PDF Document";
  if (mt.includes("image/")) return "Image";
  if (mt.includes("word") || name.endsWith(".doc") || name.endsWith(".docx")) return "Word Document";
  if (mt.includes("excel") || name.endsWith(".xls") || name.endsWith(".xlsx")) return "Spreadsheet";
  return "Document";
}

// Middleware de autenticación (asumiendo que existe)
const { requireAuth } = require("../middleware/auth");
router.use(requireAuth);

// GET /dashboard (sin /api)
router.get("/dashboard", async (req, res) => {
  try {
    console.log('📊 Dashboard - Usuario:', req.user?.userId, 'Cliente:', req.user?.clientId);
    
    // ✅ multi-tenant: usamos clientId del token
    let clientId = req.user?.clientId;

    // Si no hay clientId en el token (solo para desarrollo)
    if (!clientId) {
      console.log('⚠️ No clientId en token, buscando primer cliente...');
      const firstClient = await prisma.client.findFirst({ 
        select: { id: true } 
      });
      
      if (!firstClient) {
        console.log('❌ No hay clientes en la base de datos');
        return res.json({
          currentBalance: 0,
          balanceByLocation: 0,
          pendingInvoices: 0,
          recentDocuments: [],
        });
      }
      clientId = firstClient.id;
    }

    console.log('📍 Usando clientId:', clientId);

    const pendingStatuses = ["ISSUED", "OVERDUE"];

    // 1) Pending invoices count + sum
    const [pendingCount, pendingAgg, recentDocs] = await Promise.all([
      prisma.invoice.count({
        where: { 
          clientId, 
          status: { in: pendingStatuses } 
        },
      }),
      prisma.invoice.aggregate({
        where: { 
          clientId, 
          status: { in: pendingStatuses } 
        },
        _sum: { totalCents: true },
      }),
      prisma.document.findMany({
        where: { clientId },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: { 
          id: true, 
          name: true, 
          mimeType: true, 
          sizeBytes: true, 
          createdAt: true 
        },
      }),
    ]);

    const currentBalanceCents = pendingAgg._sum.totalCents || 0;

    // 2) Balance by location (top location by pending amount)
    const pendingByLocation = await prisma.invoice.groupBy({
      by: ["locationId"],
      where: {
        clientId,
        status: { in: pendingStatuses },
        locationId: { not: null },
      },
      _sum: { totalCents: true },
    });

    const topLocationPendingCents =
      pendingByLocation.length > 0
        ? Math.max(...pendingByLocation.map((x) => x._sum.totalCents || 0))
        : 0;

    const response = {
      currentBalance: Number((currentBalanceCents / 100).toFixed(2)),
      balanceByLocation: Number((topLocationPendingCents / 100).toFixed(2)),
      pendingInvoices: pendingCount,
      recentDocuments: recentDocs.map((d) => ({
        id: d.id,
        name: d.name,
        type: docTypeLabel(d),
        date: d.createdAt.toISOString(),
        size: d.sizeBytes ? formatBytes(d.sizeBytes) : "",
      })),
    };

    console.log('✅ Dashboard respondiendo:', response);
    res.json(response);
    
  } catch (err) {
    console.error("🔥 GET /dashboard failed:", err);
    res.status(500).json({ error: "DASHBOARD_FETCH_FAILED" });
  }
});

module.exports = router;
/*
const router = require("express").Router();
const prisma = require("../prisma"); // default export — no destructuring
const { requireAuth } = require("../middleware/auth");

router.get("/dashboard/summary", requireAuth, async (req, res) => {
  try {
    const clientId = req.user.clientId;

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

    return res.json({
      cards: {
        currentBalanceCents: 1245000, // MVP: fijo por ahora
        balanceByLocationCents: 420000,
        pendingInvoices,
        invoicesTotal,
      },
      recentDocuments,
    });
  } catch (error) {
    console.error("🔥 Error en GET /dashboard/summary:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
*/