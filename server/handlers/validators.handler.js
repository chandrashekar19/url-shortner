const { addMilliseconds } = require("date-fns");
const { body, param, query: queryValidator } = require("express-validator");
const promisify = require("node:util").promisify;
const bcrypt = require("bcryptjs");
const dns = require("node:dns");
const URL = require("node:url");
const ms = require("ms");

const { ROLES } = require("../consts");
const query = require("../queries");
const utils = require("../utils");
const env = require("../env");

const dnsLookup = promisify(dns.lookup);

const checkUser = (value, { req }) => !!req.user;
const sanitizeCheckbox = (value) => value === true || value === "on" || value;

/**
 * ✅ Create Link Validator
 */
const createLink = [
  body("target")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage("Target URL is required.")
    .isString()
    .trim()
    .isLength({ min: 1, max: 2040 })
    .withMessage("Maximum URL length is 2040 characters.")
    .customSanitizer(utils.addProtocol)
    .custom(
      (value) =>
        utils.urlRegex.test(value) ||
        /^(?!https?|ftp)(\w+:|\/\/)/.test(value)
    )
    .withMessage("Invalid URL format.")
    .custom(
      (value) =>
        utils.removeWww(URL.parse(value).host) !== env.DEFAULT_DOMAIN
    )
    .withMessage(`${env.DEFAULT_DOMAIN} URLs are not allowed.`),

  body("password")
    .optional({ nullable: true, checkFalsy: true })
    .custom(checkUser)
    .withMessage("Only authenticated users can set passwords.")
    .isString()
    .isLength({ min: 3, max: 64 })
    .withMessage("Password length must be between 3 and 64 characters."),

  body("customurl")
    .optional({ nullable: true, checkFalsy: true })
    .custom(checkUser)
    .withMessage("Only authenticated users can use custom URLs.")
    .isString()
    .trim()
    .isLength({ min: 1, max: 64 })
    .withMessage("Custom URL must be between 1 and 64 characters.")
    .custom(
      (value) =>
        utils.customAddressRegex.test(value) ||
        utils.customAlphabetRegex.test(value)
    )
    .withMessage("Custom URL contains invalid characters.")
    .custom(
      (value) =>
        !utils.preservedURLs.some((url) => url.toLowerCase() === value)
    )
    .withMessage("This custom URL is reserved."),

  body("reuse")
    .optional({ nullable: true })
    .custom(checkUser)
    .withMessage("Only authenticated users can reuse links.")
    .isBoolean()
    .withMessage("Reuse flag must be boolean."),

  body("description")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 2040 })
    .withMessage("Description length must be between 1 and 2040 characters."),

  body("expire_in")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .custom((value) => {
      try {
        return !!ms(value);
      } catch {
        return false;
      }
    })
    .withMessage("Invalid expire format (e.g., 1m, 8h, 42d).")
    .customSanitizer(ms)
    .custom((value) => value >= ms("1m"))
    .withMessage("Expiration must be at least 1 minute.")
    .customSanitizer((value) =>
      utils.dateToUTC(addMilliseconds(new Date(), value))
    ),

  body("domain")
    .optional({ nullable: true, checkFalsy: true })
    .customSanitizer((value) =>
      value === env.DEFAULT_DOMAIN ? null : value
    )
    .custom(checkUser)
    .withMessage("Only authenticated users can assign domains.")
    .isString()
    .withMessage("Domain must be a string.")
    .customSanitizer((value) => value.toLowerCase())
    .custom(async (address, { req }) => {
      const domain = await query.domain.find({
        address,
        user_id: req.user.id,
      });
      req.body.fetched_domain = domain || null;
      if (!domain)
        return Promise.reject(
          new Error("Invalid domain or not associated with your account.")
        );
    }),
];

/**
 * ✅ Edit Link Validator
 */
const editLink = [
  body("target")
    .optional({ checkFalsy: true, nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 2040 })
    .withMessage("Maximum URL length is 2040 characters.")
    .customSanitizer(utils.addProtocol)
    .custom(
      (value) =>
        utils.urlRegex.test(value) ||
        /^(?!https?|ftp)(\w+:|\/\/)/.test(value)
    )
    .withMessage("Invalid URL format.")
    .custom(
      (value) =>
        utils.removeWww(URL.parse(value).host) !== env.DEFAULT_DOMAIN
    )
    .withMessage(`${env.DEFAULT_DOMAIN} URLs are not allowed.`),

  body("password")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .isLength({ min: 3, max: 64 })
    .withMessage("Password must be between 3 and 64 characters."),

  body("address")
    .optional({ checkFalsy: true, nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 64 })
    .withMessage("Custom URL must be between 1 and 64 characters.")
    .custom(
      (value) =>
        utils.customAddressRegex.test(value) ||
        utils.customAlphabetRegex.test(value)
    )
    .withMessage("Custom URL contains invalid characters.")
    .custom(
      (value) =>
        !utils.preservedURLs.some((url) => url.toLowerCase() === value)
    )
    .withMessage("This custom URL is reserved."),

  body("expire_in")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .custom((value) => {
      try {
        return !!ms(value);
      } catch {
        return false;
      }
    })
    .withMessage("Invalid expire format (e.g., 1m, 8h, 42d).")
    .customSanitizer(ms)
    .custom((value) => value >= ms("1m"))
    .withMessage("Expiration must be at least 1 minute.")
    .customSanitizer((value) =>
      utils.dateToUTC(addMilliseconds(new Date(), value))
    ),

  body("description")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isLength({ min: 0, max: 2040 })
    .withMessage("Description length must be between 0 and 2040."),

  param("id", "Invalid ID.")
    .exists({ checkFalsy: true, checkNull: true })
    .isLength({ min: 36, max: 36 }),
];

/**
 * ✅ Redirect Protected Validator
 */
const redirectProtected = [
  body("password", "Invalid password.")
    .exists({ checkFalsy: true, checkNull: true })
    .isString()
    .isLength({ min: 3, max: 64 }),
  param("id", "Invalid ID.")
    .exists({ checkFalsy: true, checkNull: true })
    .isLength({ min: 36, max: 36 }),
];

/**
 * ✅ Domain Validators
 */
const addDomain = [
  body("address", "Invalid domain.")
    .exists({ checkFalsy: true, checkNull: true })
    .isLength({ min: 3, max: 64 })
    .trim()
    .customSanitizer(utils.addProtocol)
    .custom((value) => utils.urlRegex.test(value))
    .customSanitizer((value) => {
      const parsed = URL.parse(value);
      return utils.removeWww(parsed.hostname || parsed.href);
    })
    .custom((value) => value !== env.DEFAULT_DOMAIN)
    .withMessage("Cannot use the default domain.")
    .custom(async (value) => {
      const domain = await query.domain.find({ address: value });
      if (domain?.user_id || domain?.banned)
        return Promise.reject(new Error("Domain is already in use or banned."));
    }),

  body("homepage")
    .optional({ checkFalsy: true, nullable: true })
    .customSanitizer(utils.addProtocol)
    .custom(
      (value) =>
        utils.urlRegex.test(value) ||
        /^(?!https?|ftp)(\w+:|\/\/)/.test(value)
    )
    .withMessage("Invalid homepage URL."),
];

/**
 * ✅ Admin Domain
 */
const addDomainAdmin = [
  body("address", "Invalid domain.")
    .exists({ checkFalsy: true, checkNull: true })
    .isLength({ min: 3, max: 64 })
    .trim()
    .customSanitizer(utils.addProtocol)
    .custom((value) => utils.urlRegex.test(value))
    .customSanitizer((value) => {
      const parsed = URL.parse(value);
      return utils.removeWww(parsed.hostname || parsed.href);
    })
    .custom((value) => value !== env.DEFAULT_DOMAIN)
    .withMessage("Cannot use the default domain.")
    .custom(async (value) => {
      const domain = await query.domain.find({ address: value });
      if (domain) return Promise.reject(new Error("Domain already exists."));
    }),

  body("homepage")
    .optional({ checkFalsy: true, nullable: true })
    .customSanitizer(utils.addProtocol)
    .custom(
      (value) =>
        utils.urlRegex.test(value) ||
        /^(?!https?|ftp)(\w+:|\/\/)/.test(value)
    )
    .withMessage("Invalid homepage URL."),

  body("banned").optional().customSanitizer(sanitizeCheckbox).isBoolean(),
];

/**
 * ✅ Ban Domain Validator
 */
const banDomain = [
  param("id", "Invalid ID.")
    .exists({ checkFalsy: true, checkNull: true })
    .isNumeric(),
  body("links", '"links" should be a boolean.')
    .optional()
    .customSanitizer(sanitizeCheckbox)
    .isBoolean(),
];

/**
 * ✅ Custom Validation Utilities
 */
async function bannedDomain(domain) {
  const isBanned = await query.domain.find({ address: domain, banned: true });
  if (isBanned) {
    throw new utils.CustomError("Domain is banned.", 400);
  }
}

async function bannedHost(domain) {
  try {
    const dnsRes = await dnsLookup(domain);
    if (!dnsRes?.address) {
      throw new utils.CustomError("Could not resolve domain DNS.", 400);
    }

    const isBanned = await query.host.find({
      address: dnsRes.address,
      banned: true,
    });

    if (isBanned) {
      throw new utils.CustomError("Domain host is flagged as malicious.", 400);
    }
  } catch (error) {
    throw new utils.CustomError(
      "DNS lookup failed. Please check the domain.",
      400
    );
  }
}

module.exports = {
  addDomain,
  addDomainAdmin,
  banDomain,
  bannedDomain,
  bannedHost,
  checkUser,
  createLink,
  editLink,
  redirectProtected,
};
