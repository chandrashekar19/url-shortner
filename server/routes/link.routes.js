const { Router } = require("express");
const cors = require("cors");

const validators = require("../handlers/validators.handler");
const helpers = require("../handlers/helpers.handler");
const asyncHandler = require("../utils/asyncHandler");
const link = require("../handlers/links.handler");
const auth = require("../handlers/auth.handler");
const env = require("../env");

const router = Router();

/**
 * 🔗 Get all links for a user
 */
router.get(
  "/",
  asyncHandler(auth.apikey),
  asyncHandler(auth.jwt),
  helpers.parseQuery,
  asyncHandler(link.get)
);

/**
 *  Admin: Get all links
 */
router.get(
  "/admin",
  asyncHandler(auth.apikey),
  asyncHandler(auth.jwt),
  asyncHandler(auth.admin),
  helpers.parseQuery,
  asyncHandler(link.getAdmin)
);

/**
 * ➕ Create a new short link
 */
router.post(
  "/",
  cors(),
  asyncHandler(auth.apikey),
  asyncHandler(env.DISALLOW_ANONYMOUS_LINKS ? auth.jwt : auth.jwtLoose),
  validators.createLink,
  asyncHandler(helpers.verify),
  asyncHandler(link.create)
);

/**
 * ✏️ Edit a link (user)
 */
router.patch(
  "/:id",
  asyncHandler(auth.apikey),
  asyncHandler(auth.jwt),
  validators.editLink,
  asyncHandler(helpers.verify),
  asyncHandler(link.edit)
);

/**
 * 👑 Edit a link (admin)
 */
router.patch(
  "/admin/:id",
  asyncHandler(auth.apikey),
  asyncHandler(auth.jwt),
  asyncHandler(auth.admin),
  validators.editLink,
  asyncHandler(helpers.verify),
  asyncHandler(link.editAdmin)
);

/**
 * ❌ Delete a link
 */
router.delete(
  "/:id",
  asyncHandler(auth.apikey),
  asyncHandler(auth.jwt),
  validators.deleteLink,
  asyncHandler(helpers.verify),
  asyncHandler(link.remove)
);

/**
 * 🚫 Admin: Ban a link
 */
router.post(
  "/admin/ban/:id",
  asyncHandler(auth.apikey),
  asyncHandler(auth.jwt),
  asyncHandler(auth.admin),
  validators.banLink,
  asyncHandler(helpers.verify),
  asyncHandler(link.ban)
);

/**
 * 📊 Get link stats
 */
router.get(
  "/:id/stats",
  asyncHandler(auth.apikey),
  asyncHandler(auth.jwt),
  validators.getStats,
  asyncHandler(helpers.verify),
  asyncHandler(link.stats)
);

/**
 * 🔒 Access a protected link (password-protected)
 */
router.post(
  "/:id/protected",
  validators.redirectProtected,
  asyncHandler(helpers.verify),
  asyncHandler(link.redirectProtected)
);

/**
 * 🚨 Report a link (abuse report)
 */
router.post(
  "/report",
  auth.featureAccess([env.MAIL_ENABLED]),
  validators.reportLink,
  asyncHandler(helpers.verify),
  asyncHandler(link.report)
);

module.exports = router;
