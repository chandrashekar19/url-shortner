const env = require("../env");
const utils = require("../utils");

/**
 * ✅ config
 * 
 * Middleware to attach global environment/config values.
 * 
 * You can optionally expose these via a route like `/api/config`
 * so your React app can fetch basic site information.
 */
function config(req, res, next) {
  req.appConfig = {
    default_domain: env.DEFAULT_DOMAIN,
    site_name: env.SITE_NAME,
    contact_email: env.CONTACT_EMAIL,
    server_ip_address: env.SERVER_IP_ADDRESS,
    server_cname_address: env.SERVER_CNAME_ADDRESS,
    disallow_registration: env.DISALLOW_REGISTRATION,
    mail_enabled: env.MAIL_ENABLED,
    report_email: env.REPORT_EMAIL,
    custom_styles: utils.getCustomCSSFileNames(),
  };
  next();
}

module.exports = {
  config,
};
