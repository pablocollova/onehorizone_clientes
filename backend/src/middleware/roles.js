// backend/src/middleware/roles.js

/**
 * Middleware to check if the authenticated user has one of the required roles.
 * Must be used AFTER requireAuth middleware.
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 */
function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden: insufficient permissions" });
        }

        next();
    };
}

module.exports = {
    requireRole
};
