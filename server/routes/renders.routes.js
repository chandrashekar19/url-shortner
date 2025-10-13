const { Router } = require("express");
const asyncHandler = require("../utils/asyncHandler");
const helpers = require("../handlers/helpers.handler");
const auth = require("../handlers/auth.handler");
const env = require("../env");
const query = require("../queries");
const utils = require("../utils");

const router = Router();

/**
  🏠 Homepage (redirects based on setup)
 */
router.get(
  "/",
  asyncHandler(auth.jwtLoosePage),
  asyncHandler(helpers.adminSetup),
  async (req, res) => {
    return res.status(200).json({
      message: "Welcome to the API",
      user: req.user || null,
      setupRequired: !req.user
    });
  }
);

/**
 * Login page equivalent (React handles UI)
 */
router.get(
  "/login",
  asyncHandler(auth.jwtLoosePage),
  asyncHandler(helpers.adminSetup),
  async (req, res) => {
    if (req.user) {
      return res.redirect("/");
    }
    return res.status(200).json({ message: "Please log in" });
  }
);

/**
 * Logout
 */
router.get(
  "/logout",
  async (req, res) => {
    utils.deleteCurrentToken(res);
    return res.status(200).json({ message: "Logged out successfully" });
  }
);

/**
 * Admin creation setup
 */
router.get(
  "/create-admin",
  asyncHandler(async (req, res) => {
    const adminExists = await query.user.findAny();
    if (adminExists) {
      return res.redirect("/login");
    }
    return res.status(200).json({ message: "Admin setup allowed" });
  })
);

/**
 * User settings
 */
router.get(
  "/settings",
  asyncHandler(auth.jwtPage),
  async (req, res) => {
    return res.status(200).json({
      message: "Settings available",
      user: utils.sanitize.user(req.user)
    });
  }
);

/**
 * Admin panel
 */
router.get(
  "/admin",
  asyncHandler(auth.jwtPage),
  asyncHandler(auth.admin),
  async (req, res) => {
    return res.status(200).json({
      message: "Welcome to admin panel",
      user: utils.sanitize.user(req.user)
    });
  }
);

/**
 * Stats placeholder (React handles rendering)
 */
router.get(
  "/stats",
  asyncHandler(auth.jwtPage),
  async (req, res) => {
    return res.status(200).json({ message: "Stats route available" });
  }
);

/**
 *  Banned page (React shows message)
 */
router.get(
  "/banned",
  asyncHandler(auth.jwtLoosePage),
  async (req, res) => {
    return res.status(403).json({ message: "Your account or link is banned." });
  }
);

/**
 *  Report abuse form
 */
router.get(
  "/report",
  asyncHandler(auth.jwtLoosePage),
  async (req, res) => {
    if (!env.REPORT_EMAIL) {
      return res.redirect("/");
    }
    return res.status(200).json({
      message: "Report abuse endpoint",
      email: env.REPORT_EMAIL
    });
  }
);

/**
 * Reset password request
 */
router.get(
  "/reset-password",
  auth.featureAccessPage([env.MAIL_ENABLED]),
  asyncHandler(auth.jwtLoosePage),
  async (req, res) => {
    return res.status(200).json({
      message: "Password reset request endpoint"
    });
  }
);

/**
 * Reset password with token
 */
router.get(
  "/reset-password/:resetPasswordToken",
  asyncHandler(auth.jwtLoosePage),
  async (req, res) => {
    const token = req.params.resetPasswordToken;
    const user = await query.user.find({
      reset_password_token: token,
      reset_password_expires: [">", utils.dateToUTC(new Date())]
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    return res.status(200).json({
      message: "Reset token valid",
      token
    });
  }
);

/**
 * ✉️ Verify change email
 */
router.get(
  "/verify-email/:changeEmailToken",
  asyncHandler(auth.changeEmail),
  async (req, res) => {
    return res.status(200).json({
      message: "Email change verification complete"
    });
  }
);

/**
 * ✅ Verify account
 */
router.get(
  "/verify/:verificationToken",
  asyncHandler(auth.verify),
  async (req, res) => {
    return res.status(200).json({
      message: "Account verified successfully"
    });
  }
);

/**
 * 📄 Terms of Service
 */
router.get(
  "/terms",
  async (req, res) => {
    return res.status(200).json({
      message: "Terms of Service endpoint",
      site: env.SITE_NAME
    });
  }
);

module.exports = router;
