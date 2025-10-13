const nodemailer = require("nodemailer");
const { resetMailText, verifyMailText, changeEmailText } = require("./text");
const { CustomError } = require("../utils");
const env = require("../env");

/**
 * ✅ Mail Transport Configuration
 */
const mailConfig = {
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  secure: env.MAIL_SECURE === "true" || env.MAIL_SECURE === true,
  auth: env.MAIL_USER
    ? {
        user: env.MAIL_USER,
        pass: env.MAIL_PASSWORD,
      }
    : undefined,
};

const transporter = nodemailer.createTransport(mailConfig);

/**
 * ✅ Verify connection once on startup (optional but helpful)
 */
if (env.MAIL_ENABLED) {
  transporter.verify((err) => {
    if (err) {
      console.warn("⚠️  Mail server verification failed:", err.message);
    } else {
      console.log("📨  Mail transporter ready to send emails");
    }
  });
}

/**
 * ✅ Utility to send an email
 */
async function sendMail({ to, subject, text }) {
  if (!env.MAIL_ENABLED) {
    throw new CustomError("Mail service is disabled in configuration.", 400);
  }

  const mail = await transporter.sendMail({
    from: env.MAIL_FROM || env.MAIL_USER || `noreply@${env.DEFAULT_DOMAIN}`,
    to,
    subject,
    text,
  });

  if (!mail.accepted.length) {
    throw new CustomError("Failed to send email. Try again later.", 500);
  }

  return mail;
}

/**
 * ✅ 1. Send Verification Email
 */
async function verification(user) {
  const token = user.verification_token;

  return sendMail({
    to: user.email,
    subject: `${env.SITE_NAME} – Verify your account`,
    text: verifyMailText
      .replace(/{{verification}}/gim, token)
      .replace(/{{domain}}/gm, env.DEFAULT_DOMAIN)
      .replace(/{{site_name}}/gm, env.SITE_NAME),
  });
}

/**
 * ✅ 2. Send Change Email Verification
 */
async function changeEmail(user) {
  const token = user.change_email_token;

  return sendMail({
    to: user.change_email_address,
    subject: `${env.SITE_NAME} – Verify your new email`,
    text: changeEmailText
      .replace(/{{verification}}/gim, token)
      .replace(/{{domain}}/gm, env.DEFAULT_DOMAIN)
      .replace(/{{site_name}}/gm, env.SITE_NAME),
  });
}

/**
 * ✅ 3. Send Reset Password Email
 */
async function resetPasswordToken(user) {
  const token = user.reset_password_token;

  return sendMail({
    to: user.email,
    subject: `${env.SITE_NAME} – Reset your password`,
    text: resetMailText
      .replace(/{{resetpassword}}/gm, token)
      .replace(/{{domain}}/gm, env.DEFAULT_DOMAIN),
  });
}

/**
 * ✅ 4. Send Report Email
 */
async function sendReportEmail(link) {
  return sendMail({
    to: env.REPORT_EMAIL,
    subject: `[REPORT] – Abuse Report on ${env.SITE_NAME}`,
    text: `A user has reported the following link:\n\n${link}\n\nPlease review it.`,
  });
}

module.exports = {
  verification,
  changeEmail,
  resetPasswordToken,
  sendReportEmail,
};
