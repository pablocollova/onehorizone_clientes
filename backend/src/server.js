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

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JSON parse error handler (must be before routes)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("🔥 JSON Parse Error:", err.message);
    return res.status(400).json({ error: "Invalid JSON payload" });
  }
  next(err);
});

// Routes — all mounted flat; each router defines its own full path
app.use(healthRoutes);
app.use("/api/auth", authRoutes);
app.use(meRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use(clientsRoutes);
app.use(invoicesRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled Server Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`✅ API listening on http://localhost:${port}`);
});

