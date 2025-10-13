const { Router } = require("express");

const validators = require("../handlers/validators.handler");
const helpers = require("../handlers/helpers.handler");
const asyncHandler = require("../utils/asyncHandler");
const user = require("../handlers/users.handler");
const auth = require("../handlers/auth.handler");

const router = Router();

/**
 * 👤 Get logged-in user's profile & domains
 */
router.get(
  "/",
  asyncHandler(auth.apikey),
  asyncHandler(auth.jwt),
  asyncHandler(user.get)
);

/**
 * 👑 Admin: Get all users
 */
router.get(
  "/admin",
  asyncHandler(auth.apikey),
  asyncHandler(auth.jwt),
  asyncHandler(auth.admin),
  helpers.parseQuery,
  asyncHandler(user.getAdmin)
);

/**
 * 👑 Admin: Create a new user
 */
router.post(
  "/admin",
  asyncHandler(auth.apikey),
  asyncHandler(auth.jwt),
  asyncHandler(auth.admin),
  validators.createUser,
  asyncHandler(helpers.verify),
  asyncHandler(user.create)
);

/**
 * 🗑️ Delete current logged-in user's account
 */
router.post(
  "/delete",
  asyncHandler(auth.apikey),
  asyncHandler(auth.jwt),
  validators.deleteUser,
  asyncHandler(helpers.verify),
  asyncHandler(user.remove)
);

/**
 * 👑 Admin: Delete a specific user
 */
router.delete(
  "/admin/:id",
  asyncHandler(auth.apikey),
  asyncHandler(auth.jwt),
  asyncHandler(auth.admin),
  validators.deleteUserByAdmin,
  asyncHandler(helpers.verify),
  asyncHandler(user.removeByAdmin)
);

/**
 * 👑 Admin: Ban a user (and optionally links/domains)
 */
router.post(
  "/admin/ban/:id",
  asyncHandler(auth.apikey),
  asyncHandler(auth.jwt),
  asyncHandler(auth.admin),
  validators.banUser,
  asyncHandler(helpers.verify),
  asyncHandler(user.ban)
);

module.exports = router;
