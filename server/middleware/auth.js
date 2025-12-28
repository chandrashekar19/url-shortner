const passport = require("passport");

/**
 * 🔐 Auth Middleware (Simplified)
 */

// JWT Authentication
const jwt = (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        req.user = user;
        next();
    })(req, res, next);
};

// Local (email/password) Authentication
const local = (req, res, next) => {
    passport.authenticate("local", { session: false }, (err, user) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        req.user = user;
        next();
    })(req, res, next);
};

// Admin-only access
const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "Admin access required" });
    }
    next();
};

module.exports = {
    jwt,
    local,
    adminOnly,
};
