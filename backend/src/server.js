// backend/src/server.js
const { app, allowedOrigins } = require("./app");

// ── Start server ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ API listening on 0.0.0.0:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 CORS allowed origins: ${allowedOrigins.join(", ")}`);
});

server.on("close", () => {
  console.log("🔴 Server closed at", new Date().toISOString());
});

server.on("error", (err) => {
  console.error("🔴 Server error:", err);
  process.exit(1);
});
