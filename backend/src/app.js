// backend/src/app.js
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
const gdprRoutes = require("./routes/gdpr");

const { requireAuth } = require("./middleware/auth");
const tenantMiddleware = require("./middleware/tenant");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ── CORS ───────────────────────────────────────────────────────────────────────
// CORS_ORIGINS is a comma-separated list of allowed origins.
// Falls back to localhost for local development.
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
  })
);

// JSON parse error handler (must be before routes)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("🔥 JSON Parse Error:", err.message);
    return res.status(400).json({ error: "Invalid JSON payload" });
  }
  next(err);
});

// ── Root + Health endpoints ────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({ ok: true, service: "onehorizone-backend" });
});

// ── Public routes (no auth required) ──────────────────────────────────────────
app.use(healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/gdpr", gdprRoutes);

// ── Auth + tenant resolution for all routes below ─────────────────────────────
app.use(requireAuth);
app.use(tenantMiddleware);

// ── Protected routes ───────────────────────────────────────────────────────────
app.use(meRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", clientsRoutes);
app.use(clientsRoutes);
app.use(invoicesRoutes);
app.use("/api/admin", adminRoutes);

// ── Global error handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled Server Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = { app, allowedOrigins };
