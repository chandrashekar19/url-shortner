
const { differenceInSeconds } = require("date-fns");
const promisify = require("node:util").promisify;
const bcrypt = require("bcryptjs");
const { isbot } = require("isbot");
const URL = require("node:url");
const dns = require("node:dns");

const validators = require("./validators.handler");
const map = require("../utils/map.json");
const transporter = require("../mail");
const query = require("../queries");
const queue = require("../queues");
const utils = require("../utils");
const env = require("../env");

const CustomError = utils.CustomError;
const dnsLookup = promisify(dns.lookup);

// ✅ Get user’s links
async function get(req, res) {
  const { limit, skip } = req.context;
  const search = req.query.search;
  const userId = req.user.id;

  const match = { user_id: userId };
  const [data, total] = await Promise.all([
    query.link.get(match, { limit, search, skip }),
    query.link.total(match, { search }),
  ]);

  return res.status(200).json({
    total,
    limit,
    skip,
    data: data.map(utils.sanitize.link),
  });
}

// ✅ Get all links (admin)
async function getAdmin(req, res) {
  const { limit, skip } = req.context;
  const search = req.query.search;
  const user = req.query.user;
  let domain = req.query.domain;
  const banned = utils.parseBooleanQuery(req.query.banned);
  const anonymous = utils.parseBooleanQuery(req.query.anonymous);
  const has_domain = utils.parseBooleanQuery(req.query.has_domain);

  const match = {
    ...(banned !== undefined && { banned }),
    ...(anonymous !== undefined && {
      user_id: [anonymous ? "is" : "is not", null],
    }),
    ...(has_domain !== undefined && {
      domain_id: [has_domain ? "is not" : "is", null],
    }),
  };

  if (domain === env.DEFAULT_DOMAIN) {
    domain = undefined;
    match.domain_id = null;
  }

  const [data, total] = await Promise.all([
    query.link.getAdmin(match, { limit, search, user, domain, skip }),
    query.link.totalAdmin(match, { search, user, domain }),
  ]);

  const links = data.map(utils.sanitize.link_admin);
  return res.status(200).json({ total, limit, skip, data: links });
}

// ✅ Create a new short link
async function create(req, res) {
  const { reuse, password, customurl, description, target, fetched_domain, expire_in } =
    req.body;

  const domain_id = fetched_domain ? fetched_domain.id : null;
  const targetDomain = utils.removeWww(URL.parse(target).hostname);

  const tasks = await Promise.all([
    reuse &&
      query.link.find({
        target,
        user_id: req.user.id,
        domain_id,
      }),
    customurl &&
      query.link.find({
        address: customurl,
        domain_id,
      }),
    !customurl && utils.generateId(query, domain_id),
    validators.bannedDomain(targetDomain),
    validators.bannedHost(targetDomain),
  ]);

  if (tasks[0]) {
    return res.status(200).json(utils.sanitize.link(tasks[0]));
  }

  if (tasks[1]) {
    throw new CustomError("Custom URL is already in use.", 400);
  }

  const address = customurl || tasks[2];
  const link = await query.link.create({
    password,
    address,
    domain_id,
    description,
    target,
    expire_in,
    user_id: req.user.id,
  });

  link.domain = fetched_domain?.address;
  return res.status(201).json({
    message: "Short link created successfully.",
    ...utils.sanitize.link(link),
  });
}

// ✅ Edit link (user)
async function edit(req, res) {
  const link = await query.link.find({
    uuid: req.params.id,
    ...(!req.user.admin && { user_id: req.user.id }),
  });

  if (!link) throw new CustomError("Link not found.");

  const updatableFields = ["address", "target", "description", "expire_in", "password"];
  let isChanged = false;

  updatableFields.forEach((field) => {
    const newVal = req.body[field];
    if (newVal && newVal !== link[field]) isChanged = true;
  });

  if (!isChanged) throw new CustomError("Nothing to update.", 400);

  const targetDomain =
    req.body.target && utils.removeWww(URL.parse(req.body.target).hostname);
  const domain_id = link.domain_id || null;

  if (req.body.address) {
    const existing = await query.link.find({
      address: req.body.address,
      domain_id,
    });
    if (existing) throw new CustomError("Custom URL already exists.", 400);
  }

  await query.link.update({ id: link.id }, req.body);

  return res.status(200).json({
    message: "Link updated successfully.",
  });
}

// ✅ Edit link (admin)
async function editAdmin(req, res) {
  const link = await query.link.find({
    uuid: req.params.id,
  });

  if (!link) throw new CustomError("Link not found.");

  await query.link.update({ id: link.id }, req.body);

  return res.status(200).json({
    message: "Link updated successfully by admin.",
  });
}

// ✅ Delete a link
async function remove(req, res) {
  const { error, isRemoved } = await query.link.remove({
    uuid: req.params.id,
    ...(!req.user.admin && { user_id: req.user.id }),
  });

  if (!isRemoved) {
    throw new CustomError(error || "Could not delete the link.", 400);
  }

  return res.status(200).json({
    message: "Link deleted successfully.",
  });
}

// ✅ Report a link
async function report(req, res) {
  const { link } = req.body;
  await transporter.sendReportEmail(link).catch(console.error);
  return res.status(200).json({
    message: "Report received. Our team will review it shortly.",
  });
}

// ✅ Ban a link
async function ban(req, res) {
  const { id } = req.params;
  const update = {
    banned_by_id: req.user.id,
    banned: true,
  };

  const link = await query.link.find({ uuid: id });
  if (!link) throw new CustomError("No link found.", 400);
  if (link.banned) throw new CustomError("Link already banned.", 400);

  const tasks = [query.link.update({ uuid: id }, update)];
  const domain = utils.removeWww(URL.parse(link.target).hostname);

  if (req.body.domain) tasks.push(query.domain.add({ ...update, address: domain }));

  if (req.body.host) {
    const dnsRes = await dnsLookup(domain).catch(() => {
      throw new CustomError("Couldn't fetch DNS info.");
    });
    const host = dnsRes?.address;
    tasks.push(query.host.add({ ...update, address: host }));
  }

  if (req.body.user && link.user_id)
    tasks.push(query.user.update({ id: link.user_id }, update));

  if (req.body.userLinks && link.user_id)
    tasks.push(query.link.update({ user_id: link.user_id }, update));

  await Promise.all(tasks);
  return res.status(200).json({ message: "Link banned successfully." });
}

// ✅ Redirect short URL → Target
async function redirect(req, res, next) {
  const host = utils.removeWww(req.headers.host);
  const domain =
    host !== env.DEFAULT_DOMAIN
      ? await query.domain.find({ address: host })
      : null;

  const address = req.params.id.replace("+", "");
  const link = await query.link.find({
    address,
    domain_id: domain ? domain.id : null,
  });

  if (!link) return res.redirect(domain?.homepage || "/404");
  if (link.banned) return res.redirect("/banned");

  // + = info request
  const isRequestingInfo = /.*\+$/gi.test(req.params.id);
  if (isRequestingInfo && !link.password) {
    return res.status(200).json({
      target: link.target,
      info: utils.getShortURL(link.address, link.domain),
    });
  }

  // Password-protected link
  if (link.password) {
    if ("authorization" in req.headers) {
      const auth = req.headers.authorization;
      const [method, payload] = auth.split(" ");
      if (method === "Basic") {
        const decoded = Buffer.from(payload, "base64").toString("utf8");
        const password = decoded.split(":")[1];
        const matches = await bcrypt.compare(password, link.password);
        if (matches) return res.redirect(link.target);
      }
    }
    return res.status(401).json({ message: "Password required to access this link." });
  }

  // Log visit (async)
  const isBot = isbot(req.headers["user-agent"]);
  if (link.user_id && !isBot) {
    queue.visit.add({
      userAgent: req.headers["user-agent"],
      ip: req.ip,
      country: req.get("cf-ipcountry"),
      referrer: req.get("Referrer"),
      link,
    });
  }

  return res.redirect(link.target);
}

// ✅ Protected redirect (verify password)
async function redirectProtected(req, res) {
  const uuid = req.params.id;
  const link = await query.link.find({ uuid });

  if (!link || !link.password) throw new CustomError("Link not found.", 400);

  const matches = await bcrypt.compare(req.body.password, link.password);
  if (!matches) throw new CustomError("Incorrect password.", 401);

  if (link.user_id) {
    queue.visit.add({
      userAgent: req.headers["user-agent"],
      ip: req.ip,
      country: req.get("cf-ipcountry"),
      referrer: req.get("Referrer"),
      link,
    });
  }

  return res.status(200).json({ target: link.target });
}

// ✅ Redirect custom domain homepage
async function redirectCustomDomainHomepage(req, res, next) {
  const host = utils.removeWww(req.headers.host);
  if (host === env.DEFAULT_DOMAIN) return next();

  const path = req.path;
  const pathName = path.replace("/", "").split("/")[0];
  if (path === "/" || utils.preservedURLs.includes(pathName)) {
    const domain = await query.domain.find({ address: host });
    if (domain?.homepage) {
      return res.redirect(302, domain.homepage);
    }
  }

  next();
}

// ✅ Link stats
async function stats(req, res) {
  const { user } = req;
  const uuid = req.params.id;

  const link = await query.link.find({
    ...(!user.admin && { user_id: user.id }),
    uuid,
  });

  if (!link) throw new CustomError("Link not found.");

  const stats = await query.visit.find({ link_id: link.id }, link.visit_count);
  if (!stats) throw new CustomError("Could not get link stats.");

  return res.status(200).json({
    ...stats,
    ...utils.sanitize.link(link),
  });
}

module.exports = {
  ban,
  create,
  edit,
  editAdmin,
  get,
  getAdmin,
  remove,
  report,
  stats,
  redirect,
  redirectProtected,
  redirectCustomDomainHomepage,
};
