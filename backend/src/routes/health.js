// backend/src/routes/health.js
const router = require("express").Router();

router.get("/health", (req, res) => {
  res.json({ ok: true, service: "onehorizon-backend", ts: new Date().toISOString() });
});

module.exports = router;