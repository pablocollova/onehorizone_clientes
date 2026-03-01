// backend/src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/health");
const authRoutes = require("./routes/auth");
const meRoutes = require("./routes/me");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
}));

// Add JSON and URL-encoded body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle JSON parsing errors before they reach the routes (to prevent HTML errors)
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('🔥 JSON Parse Error:', err.message);
        return res.status(400).json({ error: "Invalid JSON payload" });
    }
    next(err);
});

app.use(healthRoutes);
app.use(authRoutes);
app.use(meRoutes);
app.use(dashboardRoutes);

// Catch-all route for unhandled errors
app.use((err, req, res, next) => {
    console.error("🔥 Unhandled Server Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`✅ API listening on http://localhost:${port}`);
});