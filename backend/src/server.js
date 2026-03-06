// backend/src/server.js
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

