// backend/src/server.js


// Al principio del archivo
console.log('🚀 ===== INICIO DE DIAGNÓSTICO =====');
console.log('📅 Fecha:', new Date().toISOString());
console.log('📂 Directorio actual:', process.cwd());
console.log('📄 Archivo ejecutado:', __filename);
console.log('🔧 PID:', process.pid);
console.log('🌍 Node version:', process.version);
console.log('💻 Plataforma:', process.platform);
console.log('🔌 PORT variable:', process.env.PORT);
console.log('📦 Módulos cargados:', Object.keys(require.cache).length);
console.log('🚀 ===== FIN DE DIAGNÓSTICO =====\n');

// Y al final, cuando se cierre
process.on('beforeExit', (code) => {
  console.log(`🔴 Process beforeExit with code: ${code}`);
  console.log('📊 Event loop active handles:', process._getActiveHandles());
  console.log('📊 Event loop active requests:', process._getActiveRequests());
});

process.on('exit', (code) => {
  console.log(`🔴 Process exit with code: ${code}`);
});




require("dotenv").config();
const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/health");
const authRoutes = require("./routes/auth");
const meRoutes = require("./routes/me");
const dashboardRoutes = require("./routes/dashboard");
const clientsRoutes = require("./routes/clients");
const invoicesRoutes = require("./routes/invoices");
const adminRoutes = require("./routes/admin");

const { requireAuth } = require("./middleware/auth");
const tenantMiddleware = require("./middleware/tenant");

const app = express();

// ── Global middleware ──────────────────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({ ok: true, service: "onehorizone-backend-root" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, service: "onehorizone-backend-health" });
});

// JSON parse error handler (must be before routes)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("🔥 JSON Parse Error:", err.message);
    return res.status(400).json({ error: "Invalid JSON payload" });
  }
  next(err);
});

// ── Public routes (no auth required) ──────────────────────────────────────────
app.use(healthRoutes);
app.use("/api/auth", authRoutes);

// ── Auth + tenant resolution for all routes below ─────────────────────────────
// requireAuth populates req.user, then tenantMiddleware sets req.tenantId.
app.use(requireAuth);
app.use(tenantMiddleware);

// ── Protected routes ───────────────────────────────────────────────────────────
app.use(meRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use(clientsRoutes);
app.use(invoicesRoutes);
app.use("/api/admin", adminRoutes);

// ── Global error handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled Server Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

const port = process.env.PORT || 4000;

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ API listening on 0.0.0.0:${port}`);
});

// 🟢 NUEVO: Log cada 10 segundos para ver que está vivo
  setInterval(() => {
    console.log(`🟢 Server still alive at ${new Date().toISOString()}`);
    console.log(`🟢 Memory usage: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`);
  }, 10000);
});

// 🟢 NUEVO: Manejador de cierre
server.on('close', () => {
  console.log('🔴 Server closed at', new Date().toISOString());
});

// 🟢 NUEVO: Manejador de errores del servidor
server.on('error', (err) => {
  console.error('🔴 Server error:', err);
});