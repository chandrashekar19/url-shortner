const bcrypt = require("bcryptjs");

const query = require("../queries");
const utils = require("../utils");
const mail = require("../mail");
const env = require("../env");
const { CustomError } = require("../utils");

/**
 * ✅ Get user profile and domains
 */
async function get(req, res) {
  const domains = await query.domain.get({ user_id: req.user.id });

  const data = {
    apikey: req.user.apikey,
    email: req.user.email,
    domains: domains.map(utils.sanitize.domain),
  };

  return res.status(200).json({
    message: "User profile fetched successfully.",
    user: data,
  });
}

/**
 * ✅ Delete own account
 */
async function remove(req, res) {
  await query.user.remove(req.user);
  utils.deleteCurrentToken(res);

  return res.status(200).json({
    message: "Account deleted successfully. Logged out.",
  });
}

/**
 * ✅ Admin deletes a user
 */
async function removeByAdmin(req, res) {
  const user = await query.user.find({ id: req.params.id });

  if (!user) {
    throw new CustomError("User not found.", 404);
  }

  await query.user.remove(user);

  return res.status(200).json({
    message: "User deleted successfully.",
    email: user.email,
  });
}

/**
 * ✅ Get all users (admin)
 */
async function getAdmin(req, res) {
  const { limit, skip } = req.context;
  const { role, search } = req.query;
  const verified = utils.parseBooleanQuery(req.query.verified);
  const banned = utils.parseBooleanQuery(req.query.banned);
  const domains = utils.parseBooleanQuery(req.query.domains);
  const links = utils.parseBooleanQuery(req.query.links);

  const match = {
    ...(role && { role }),
    ...(verified !== undefined && { verified }),
    ...(banned !== undefined && { banned }),
  };

  const [data, total] = await Promise.all([
    query.user.getAdmin(match, { limit, search, domains, links, skip }),
    query.user.totalAdmin(match, { search, domains, links }),
  ]);

  const users = data.map(utils.sanitize.user_admin);

  return res.status(200).json({
    total,
    limit,
    skip,
    data: users,
  });
}

/**
 * ✅ Ban user and optionally ban their links/domains
 */
async function ban(req, res) {
  const { id } = req.params;

  const update = {
    banned_by_id: req.user.id,
    banned: true,
  };

  const user = await query.user.find({ id });
  if (!user) throw new CustomError("User not found.", 404);
  if (user.banned) throw new CustomError("User is already banned.", 400);

  const tasks = [];

  // Ban user
  tasks.push(query.user.update({ id }, update));

  // Ban user links
  if (req.body.links) {
    tasks.push(query.link.update({ user_id: id }, update));
  }

  // Ban user domains
  if (req.body.domains) {
    tasks.push(query.domain.update({ user_id: id }, update));
  }

  await Promise.all(tasks).catch(() => {
    throw new CustomError("Couldn't ban user or related entries.", 500);
  });

  return res.status(200).json({
    message: "User banned successfully.",
    email: user.email,
  });
}

/**
 * ✅ Create a new user (admin only)
 */
async function create(req, res) {
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = await query.user.create({
    ...req.body,
    password: hashedPassword,
  });

  // Optional: send verification email
  if (req.body.verification_email && !user.banned && !user.verified) {
    await mail.verification(user).catch((err) =>
      console.error("Verification email failed:", err)
    );
  }

  return res.status(201).json({
    message: "User created successfully.",
    user: {
      email: user.email,
      verified: user.verified,
      role: user.role,
    },
  });
}

module.exports = {
  ban,
  create,
  get,
  getAdmin,
  remove,
  removeByAdmin,
};
