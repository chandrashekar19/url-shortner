const { Router } = require("express");
const controller = require("./auth.controller");
const { LoginSchema } = require("../users/users.schema");
const auth = require("../../middleware/auth");
const asyncHandler = require("../../utils/asyncHandler");

const router = Router();

// Validation Middleware
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (err) {
        return res.status(400).json({ error: err.errors[0].message });
    }
};

// --- Routes ---

// Login
router.post(
    "/login",
    validate(LoginSchema),
    asyncHandler(auth.local),
    controller.login
);

// Signup 
router.post(
    "/signup",
    validate(LoginSchema),
    asyncHandler(controller.signup)
);

// Get current user (Verify token)
router.get(
    "/me",
    asyncHandler(auth.jwt),
    controller.getMe
);

// Logout
router.post("/logout", controller.logout);

module.exports = router;
