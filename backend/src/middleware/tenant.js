// backend/src/middleware/tenant.js
// Injects req.tenantId based on req.user populated by requireAuth.
//
// CLIENT_ADMIN / CLIENT_USER → req.tenantId = req.user.clientId
// PLATFORM_ADMIN / PLATFORM_USER → req.tenantId = null (global read scope)
// No req.user                → pass through (public routes)

function tenantMiddleware(req, res, next) {
    if (!req.user) {
        // Route is public or auth hasn't run yet — skip silently
        return next();
    }

    // Internal roles operate across tenants; write authorization is checked per route
    if (["PLATFORM_ADMIN", "PLATFORM_USER"].includes(req.user.role)) {
        if (req.user.role === "PLATFORM_USER" && req.user.clientId) {
            return res.status(401).json({ error: "INVALID_PLATFORM_SCOPE" });
        }
        req.tenantId = null;
        return next();
    }

    // All other roles MUST have a clientId
    if (!req.user.clientId) {
        return res.status(401).json({ error: "UNAUTHORIZED_CLIENT_REQUIRED" });
    }

    req.tenantId = req.user.clientId;
    next();
}

module.exports = tenantMiddleware;
