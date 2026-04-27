// backend/src/middleware/auth.js
const jwt = require("jsonwebtoken");

function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production");
  }

  return "dev_secret";
}

function buildAuthPayload(user) {
  return {
    id: user.id,
    clientId: user.clientId,
    username: user.username,
    role: user.role,
    status: user.status,
  };
}

function signAuthToken(user) {
  return jwt.sign(buildAuthPayload(user), getJwtSecret(), { expiresIn: "7d" });
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.user = buildAuthPayload(payload);
    return next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { buildAuthPayload, getJwtSecret, requireAuth, signAuthToken };
