const { CustomError, sanitize } = require("../utils");
const query = require("../queries");
const redis = require("../redis");
const utils = require("../utils");
const env = require("../env");

// ✅ Add new domain (user)
async function add(req, res) {
  const { address, homepage } = req.body;

  const domain = await query.domain.add({
    address,
    homepage,
    user_id: req.user.id,
  });

  return res.status(201).json({
    message: "Domain added successfully.",
    domain: sanitize.domain(domain),
  });
}

// ✅ Add new domain (admin)
async function addAdmin(req, res) {
  const { address, banned, homepage } = req.body;

  const domain = await query.domain.add({
    address,
    homepage,
    banned,
    ...(banned && { banned_by_id: req.user.id }),
  });

  return res.status(201).json({
    message: "Domain added successfully by admin.",
    domain: sanitize.domain(domain),
  });
}

// ✅ Remove a domain (user)
async function remove(req, res) {
  const domain = await query.domain.find({
    uuid: req.params.id,
    user_id: req.user.id,
  });

  if (!domain) throw new CustomError("Could not delete the domain.", 400);

  const [updatedDomain] = await query.domain.update(
    { id: domain.id },
    { user_id: null }
  );

  if (!updatedDomain) {
    throw new CustomError("Could not delete the domain.", 500);
  }

  if (env.REDIS_ENABLED) {
    redis.remove.domain(updatedDomain);
  }

  return res.status(200).json({
    message: "Domain deleted successfully.",
    address: domain.address,
  });
}

// ✅ Remove a domain (admin)
async function removeAdmin(req, res) {
  const id = req.params.id;
  const links = req.query.links;

  const domain = await query.domain.find({ id });
  if (!domain) throw new CustomError("Domain not found.", 400);

  if (links) {
    await query.link.batchRemove({ domain_id: id });
  }

  await query.domain.remove(domain);

  return res.status(200).json({
    message: "Domain deleted successfully by admin.",
    address: domain.address,
  });
}

// ✅ Get all domains (admin)
async function getAdmin(req, res) {
  const { limit, skip } = req.context;
  const search = req.query.search;
  const user = req.query.user;
  const banned = utils.parseBooleanQuery(req.query.banned);
  const owner = utils.parseBooleanQuery(req.query.owner);
  const links = utils.parseBooleanQuery(req.query.links);

  const match = {
    ...(banned !== undefined && { banned }),
    ...(owner !== undefined && {
      user_id: [owner ? "is not" : "is", null],
    }),
  };

  const [data, total] = await Promise.all([
    query.domain.getAdmin(match, { limit, search, user, links, skip }),
    query.domain.totalAdmin(match, { search, user, links }),
  ]);

  const domains = data.map(utils.sanitize.domain_admin);

  return res.status(200).json({
    total,
    limit,
    skip,
    data: domains,
  });
}

// ✅ Ban domain (admin)
async function ban(req, res) {
  const { id } = req.params;

  const update = {
    banned_by_id: req.user.id,
    banned: true,
  };

  const domain = await query.domain.find({ id });
  if (!domain) throw new CustomError("Domain not found.", 400);
  if (domain.banned) throw new CustomError("Domain already banned.", 400);

  const tasks = [];

  // Ban domain
  tasks.push(query.domain.update({ id }, update));

  // Ban user
  if (req.body.user && domain.user_id) {
    tasks.push(query.user.update({ id: domain.user_id }, update));
  }

  // Ban links
  if (req.body.links) {
    tasks.push(query.link.update({ domain_id: id }, update));
  }

  await Promise.all(tasks).catch(() => {
    throw new CustomError("Couldn't ban domain entries.");
  });

  return res.status(200).json({
    message: "Domain banned successfully.",
    address: domain.address,
  });
}

module.exports = {
  add,
  addAdmin,
  ban,
  getAdmin,
  remove,
  removeAdmin,
};
