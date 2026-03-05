// backend/src/middleware/tenant.js
// Injects req.tenantId based on req.user populated by requireAuth.
//
// CLIENT_ADMIN / CLIENT_USER → req.tenantId = req.user.clientId
// PLATFORM_ADMIN             → req.tenantId = null  (cross-tenant access)
// No req.user                → pass through (public routes)

function tenantMiddleware(req, res, next) {
    if (!req.user) {
        // Route is public or auth hasn't run yet — skip silently
        return next();
    }

    // Platform admins operate across tenants; tenantId is intentionally null
    if (req.user.role === "PLATFORM_ADMIN") {
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
