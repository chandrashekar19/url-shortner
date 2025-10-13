const query = require("../queries");
const utils = require("../utils");
const env = require("../env");
const { CustomError } = require("../utils");

/**
 * ✅ Homepage
 * Redirect or show a simple JSON welcome message
 */
async function homepage(req, res) {
  if (env.DISALLOW_ANONYMOUS_LINKS && !req.user) {
    return res.status(401).json({ message: "Login required to create links." });
  }

  return res.status(200).json({
    message: "Welcome to the Kutt URL Shortener API",
    site: env.SITE_NAME,
  });
}

/**
 * ✅ Login page (React handles UI)
 */
async function login(req, res) {
  if (req.user) {
    return res.status(200).json({ message: "Already logged in." });
  }

  return res.status(200).json({
    message: "Please log in or sign up.",
  });
}

/**
 * ✅ Logout (clear token cookie)
 */
function logout(req, res) {
  utils.deleteCurrentToken(res);
  return res.status(200).json({
    message: "You have been logged out successfully.",
  });
}

/**
 * ✅ Create admin setup (first-time setup only)
 */
async function createAdmin(req, res) {
  const existingUser = await query.user.findAny();
  if (existingUser) {
    return res
      .status(400)
      .json({ message: "Admin already exists. Please log in instead." });
  }

  return res.status(200).json({
    message: "No admin user found. You can create the first admin account.",
  });
}

/**
 * ✅ 404 handler
 */
function notFound(req, res) {
  return res.status(404).json({
    error: "The requested resource was not found.",
  });
}

/**
 * ✅ Settings page — for React, just confirm API availability
 */
function settings(req, res) {
  return res.status(200).json({
    message: "Settings endpoint is active.",
  });
}

/**
 * ✅ Admin dashboard info
 */
function admin(req, res) {
  return res.status(200).json({
    message: "Admin endpoint is active.",
  });
}

/**
 * ✅ Stats page — React handles data visualization
 */
function stats(req, res) {
  return res.status(200).json({
    message: "Stats endpoint active. Use /api/links/:id/stats for data.",
  });
}

/**
 * ✅ Banned link page
 */
async function banned(req, res) {
  return res.status(403).json({
    message: "This link has been banned due to policy violations.",
  });
}

/**
 * ✅ Report abuse
 */
async function report(req, res) {
  if (!env.REPORT_EMAIL) {
    return res
      .status(400)
      .json({ message: "Reporting is disabled on this instance." });
  }

  return res.status(200).json({
    message: "You can report abuse by emailing:",
    report_email: env.REPORT_EMAIL,
  });
}

/**
 * ✅ Reset password request
 */
async function resetPassword(req, res) {
  return res.status(200).json({
    message: "Use /api/auth/reset-password to request a password reset.",
  });
}

/**
 * ✅ Reset password (verify token)
 */
async function resetPasswordSetNewPassword(req, res) {
  const reset_password_token = req.params.resetPasswordToken;
  let tokenValid = false;

  if (reset_password_token) {
    const user = await query.user.find({
      reset_password_token,
      reset_password_expires: [">", utils.dateToUTC(new Date())],
    });
    if (user) tokenValid = true;
  }

  return res.status(200).json({
    message: tokenValid
      ? "Reset token is valid. You can now set a new password."
      : "Reset token is invalid or expired.",
    tokenValid,
    ...(tokenValid && { reset_password_token }),
  });
}

/**
 * ✅ Verify change email endpoint
 */
async function verifyChangeEmail(req, res) {
  return res.status(200).json({
    message: "Verifying change of email address...",
  });
}

/**
 * ✅ Verify email endpoint
 */
async function verify(req, res) {
  return res.status(200).json({
    message: "Verifying account email...",
  });
}

/**
 * ✅ Terms of Service
 */
async function terms(req, res) {
  return res.status(200).json({
    title: "Terms of Service",
    content:
      "By using this service, you agree not to abuse or use it for malicious purposes.",
  });
}

/**
 * ✅ Support/Report endpoints
 */
async function getReportEmail(req, res) {
  if (!env.REPORT_EMAIL) {
    throw new CustomError("No report email is available.", 400);
  }
  return res.status(200).json({
    report_email: env.REPORT_EMAIL,
  });
}

async function getSupportEmail(req, res) {
  if (!env.CONTACT_EMAIL) {
    throw new CustomError("No support email is available.", 400);
  }

  await utils.sleep(500);
  return res.status(200).json({
    contact_email: env.CONTACT_EMAIL,
  });
}

module.exports = {
  homepage,
  login,
  logout,
  createAdmin,
  notFound,
  settings,
  admin,
  stats,
  banned,
  report,
  resetPassword,
  resetPasswordSetNewPassword,
  verifyChangeEmail,
  verify,
  terms,
  getReportEmail,
  getSupportEmail,
};
