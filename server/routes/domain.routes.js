const { Router } = require("express");
const validators = require("../handlers/validators.handler");
const helpers = require("../handlers/helpers.handler");
const domains = require("../handlers/domains.handler");
const asyncHandler = require("../utils/asyncHandler");
const auth = require("../handlers/auth.handler");

const router = Router();

/*
  Admin: Get all domains with optional filters
 */
router.get(
  "/admin",
  asyncHandler(auth.apikey),
  asyncHandler(auth.jwt),
  asyncHandler(auth.admin),
  helpers.parseQuery,
  asyncHandler(domains.getAdmin)
);

/**
 Add a new domain (User)
 */
router.post(
  "/",
  asyncHandler(auth.apikey),
  asyncHandler(auth.jwt),
  validators.addDomain,
  asyncHandler(helpers.verify),
  asyncHandler(domains.add)
);

/**
 * Admin: Add a new domain
 */
router.post(
  "/admin",
  asyncHandler(auth.apikey),
  asyncHandler(auth.jwt),
  asyncHandler(auth.admin),
  validators.addDomainAdmin,
  asyncHandler(helpers.verify),
  asyncHandler(domains.addAdmin)
);

/**
 * Delete a domain (User)
 */
router.delete(
  "/:id",
  asyncHandler(auth.apikey),
  asyncHandler(auth.jwt),
  validators.removeDomain,
  asyncHandler(helpers.verify),
  asyncHandler(domains.remove)
);

/**
 *  Admin: Delete a domain
 */
router.delete(
  "/admin/:id",
  asyncHandler(auth.apikey),
  asyncHandler(auth.jwt),
  asyncHandler(auth.admin),
  validators.removeDomainAdmin,
  asyncHandler(helpers.verify),
  asyncHandler(domains.removeAdmin)
);

/**
 Admin: Ban a domain
 */
router.post(
  "/admin/ban/:id",
  asyncHandler(auth.apikey),
  asyncHandler(auth.jwt),
  asyncHandler(auth.admin),
  validators.banDomain,
  asyncHandler(helpers.verify),
  asyncHandler(domains.ban)
);

module.exports = router;
