const { Router } = require("express");
const controller = require("./links.controller");
const { LinkCreateSchema } = require("./links.schema");
const auth = require("../../handlers/auth.handler");
const asyncHandler = require("../../utils/asyncHandler");

const router = Router();

/**
 * 🛡️ Validation Middleware (Zod)
 * Checks the incoming data against our schema before hitting the controller.
 */
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (err) {
        return res.status(400).json({
            error: "Validation failed",
            details: err.errors.map(e => e.message)
        });
    }
};

// --- Routes ---

// Create a link
router.post(
    "/",
    validate(LinkCreateSchema),
    asyncHandler(controller.createLink)
);

// Get my links
router.get(
    "/",
    asyncHandler(auth.jwt),
    asyncHandler(controller.getUserLinks)
);

// Delete a link
router.delete(
    "/:id",
    asyncHandler(auth.jwt),
    asyncHandler(controller.deleteLink)
);

module.exports = router;
