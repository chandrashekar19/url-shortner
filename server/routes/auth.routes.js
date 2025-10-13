const { Router } = require("express");
const validators = require("../handlers/validators.handler");
const helpers = require("../handlers/helpers.handler");
const asyncHandler = require("../utils/asyncHandler");
const auth = require("../handlers/auth.handler");
const env = require("../env");

const router = Router();

/**
 * 🔑 Login
 */
router.post(
  "/login",
  validators.login,
  asyncHandler(helpers.verify),
  helpers.rateLimit({ window: 60, limit: 5 }),
  asyncHandler(auth.local),
  asyncHandler(auth.login)
);

/**
 * 🧍‍♀️ User Signup
 */
router.post(
  "/signup",
  auth.featureAccess([!env.DISALLOW_REGISTRATION, env.MAIL_ENABLED]),
  validators.signup,
  asyncHandler(helpers.verify),
  helpers.rateLimit({ window: 60, limit: 5 }),
  validators.signupEmailTaken,
  asyncHandler(helpers.verify),
  asyncHandler(auth.signup)
);

/**
 * 👑 First-time Admin Creation
 */
router.post(
  "/create-admin",
  validators.createAdmin,
  asyncHandler(helpers.verify),
  helpers.rateLimit({ window: 60, limit: 5 }),
  asyncHandler(auth.createAdminUser)
);

/**
 * 🔐 Change Password
 */
router.post(
  "/change-password",
  asyncHandler(auth.jwt),
  validators.changePassword,
  asyncHandler(helpers.verify),
  helpers.rateLimit({ window: 60, limit: 5 }),
  asyncHandler(auth.changePassword)
);

/**
 * 📧 Change Email (requires Mail Enabled)
 */
router.post(
  "/change-email",
  asyncHandler(auth.jwt),
  auth.featureAccess([env.MAIL_ENABLED]),
  validators.changeEmail,
  asyncHandler(helpers.verify),
  helpers.rateLimit({ window: 60, limit: 3 }),
  asyncHandler(auth.changeEmailRequest)
);

/**
 * 🔑 Generate API Key
 */
router.post(
  "/apikey",
  asyncHandler(auth.jwt),
  helpers.rateLimit({ window: 60, limit: 10 }),
  asyncHandler(auth.generateApiKey)
);

/**
 * ♻️ Request Password Reset
 */
router.post(
  "/reset-password",
  auth.featureAccess([env.MAIL_ENABLED]),
  validators.resetPassword,
  asyncHandler(helpers.verify),
  helpers.rateLimit({ window: 60, limit: 3 }),
  asyncHandler(auth.resetPassword)
);

/**
 * 🆕 Set New Password (after reset)
 */
router.post(
  "/new-password",
  validators.newPassword,
  asyncHandler(helpers.verify),
  helpers.rateLimit({ window: 60, limit: 5 }),
  asyncHandler(auth.newPassword)
);

module.exports = router;
