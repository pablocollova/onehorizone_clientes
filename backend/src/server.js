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
app.use(authRoutes);
app.use(meRoutes);
app.use(dashboardRoutes);
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

app.get("/api/dashboard", (req, res) => {
  res.json({
    currentBalance: 12450,
    balanceByLocation: 4200,
    pendingInvoices: 3,
    recentDocuments: [
      { id: "1", name: "Annual Tax Return 2024", type: "PDF Document", date: "2024-10-24", size: "2.4 MB" },
      { id: "2", name: "Property Lease Agreement", type: "Legal Contract", date: "2024-10-20", size: "1.8 MB" },
      { id: "3", name: "Utility Invoice - Oct", type: "Invoice", date: "2024-10-15", size: "450 KB" },
      { id: "4", name: "Residency Application", type: "Form", date: "2024-09-28", size: "3.2 MB" }
    ]
  });
});