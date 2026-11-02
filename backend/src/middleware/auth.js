// backend/src/middleware/auth.js
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");

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
    sessionVersion: user.sessionVersion,
  };
}

function signAuthToken(user) {
  return jwt.sign(buildAuthPayload(user), getJwtSecret(), { expiresIn: "7d" });
}

async function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Missing token" });

  let payload;
  try {
    payload = jwt.verify(token, getJwtSecret());
    if (!payload || typeof payload.id !== "string" || !Number.isInteger(payload.sessionVersion)) {
      return res.status(401).json({ error: "Invalid token" });
    }
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, username: true, clientId: true, role: true, status: true, deletedAt: true, sessionVersion: true },
    });
    if (!user || user.status !== "ACTIVE" || user.deletedAt ||
        user.sessionVersion !== payload.sessionVersion || user.role !== payload.role ||
        user.clientId !== payload.clientId) {
      return res.status(401).json({ error: "Session revoked" });
    }
    req.user = buildAuthPayload(user);
    return next();
  } catch (error) {
    // A database outage must never fall back to trusting stale JWT claims.
    return next(error);
  }
}

module.exports = { buildAuthPayload, getJwtSecret, requireAuth, signAuthToken };
