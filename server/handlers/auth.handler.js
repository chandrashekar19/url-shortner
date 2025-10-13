const { differenceInDays, addMinutes } = require("date-fns");
const { nanoid } = require("nanoid");
const passport = require("passport");
const { randomUUID } = require("node:crypto");
const bcrypt = require("bcryptjs");

const { ROLES } = require("../consts");
const query = require("../queries");
const utils = require("../utils");
const redis = require("../redis");
const mail = require("../mail");
const env = require("../env");

const CustomError = utils.CustomError;

function authenticate(type, error, isStrict, redirect) {
  return function auth(req, res, next) {
    if (req.user) return next();

    passport.authenticate(type, (err, user, info) => {
      if (err) return next(err);

      if (!user && isStrict) throw new CustomError(error, 401);

      if (user && user.banned)
        throw new CustomError("You're banned from using this service.", 403);

      if (user && isStrict && !user.verified)
        throw new CustomError("Your email address is not verified.", 400);

      if (user) {
        res.locals.isAdmin = utils.isAdmin(user);
        req.user = { ...user, admin: utils.isAdmin(user) };

        if (info?.exp && req.isHTML && redirect === "page") {
          const diff = Math.abs(
            differenceInDays(new Date(info.exp * 1000), new Date())
          );
          if (diff < 6) {
            const token = utils.signToken(user);
            utils.deleteCurrentToken(res);
            utils.setToken(res, token);
          }
        }
      }

      return next();
    })(req, res, next);
  };
}

const local = authenticate("local", "Login credentials are wrong.", true, null);
const jwt = authenticate("jwt", "Unauthorized.", true, "header");
const jwtPage = authenticate("jwt", "Unauthorized.", true, "page");
const jwtLoose = authenticate("jwt", "Unauthorized.", false, "header");
const jwtLoosePage = authenticate("jwt", "Unauthorized.", false, "page");
const apikey = authenticate("localapikey", "API key is not correct.", false, null);

function admin(req, res, next) {
  if (req.user.admin) return next();
  throw new CustomError("Unauthorized", 401);
}

// ✅ SIGNUP
async function signup(req, res) {
  const salt = await bcrypt.genSalt(12);
  const password = await bcrypt.hash(req.body.password, salt);

  const user = await query.user.add({ email: req.body.email, password }, req.user);

  // Optional email verification (async)
  await mail.verification(user).catch(err =>
    console.error("Verification email error:", err)
  );

  return res.status(201).json({
    message: "Account created successfully. Please verify your email.",
    email: user.email,
  });
}

// ✅ CREATE ADMIN USER
async function createAdminUser(req, res) {
  const existing = await query.user.findAny();
  if (existing)
    throw new CustomError("Admin already exists. Cannot create another.", 400);

  const salt = await bcrypt.genSalt(12);
  const password = await bcrypt.hash(req.body.password, salt);

  const user = await query.user.add({
    email: req.body.email,
    password,
    role: ROLES.ADMIN,
    verified: true,
  });

  const token = utils.signToken(user);
  return res.status(201).json({
    message: "Admin created successfully.",
    token,
    email: user.email,
  });
}

// ✅ LOGIN
function login(req, res) {
  const token = utils.signToken(req.user);

  return res.status(200).json({
    message: "Login successful.",
    token,
    email: req.user.email,
  });
}

// ✅ VERIFY EMAIL TOKEN
async function verify(req, res, next) {
  if (!req.params.verificationToken) return next();

  const user = await query.user.update(
    {
      verification_token: req.params.verificationToken,
      verification_expires: [">", utils.dateToUTC(new Date())],
    },
    {
      verified: true,
      verification_token: null,
      verification_expires: null,
    }
  );

  if (user) {
    const token = utils.signToken(user);
    utils.deleteCurrentToken(res);
    utils.setToken(res, token);
    res.locals.token_verified = true;
    req.cookies.token = token;
  }

  return res.status(200).json({
    message: "Email verified successfully.",
  });
}

// ✅ CHANGE PASSWORD
async function changePassword(req, res) {
  const isMatch = await bcrypt.compare(req.body.currentpassword, req.user.password);
  if (!isMatch) throw new CustomError("Current password is incorrect.", 401);

  const salt = await bcrypt.genSalt(12);
  const newpassword = await bcrypt.hash(req.body.newpassword, salt);
  const user = await query.user.update({ id: req.user.id }, { password: newpassword });

  if (!user)
    throw new CustomError("Couldn't change password. Please try again later.", 400);

  return res.status(200).json({ message: "Password changed successfully." });
}

// ✅ GENERATE API KEY
async function generateApiKey(req, res) {
  const apikey = nanoid(40);

  if (env.REDIS_ENABLED) redis.remove.user(req.user);

  const user = await query.user.update({ id: req.user.id }, { apikey });
  if (!user)
    throw new CustomError("Couldn't generate API key. Try again later.", 400);

  return res.status(201).json({
    message: "API key generated successfully.",
    apikey,
  });
}

// ✅ RESET PASSWORD (Request)
async function resetPassword(req, res) {
  const user = await query.user.update(
    { email: req.body.email },
    {
      reset_password_token: randomUUID(),
      reset_password_expires: utils.dateToUTC(addMinutes(new Date(), 30)),
    }
  );

  if (user) {
    mail.resetPasswordToken(user).catch(error =>
      console.error("Reset email error:\n", error)
    );
  }

  return res.status(200).json({
    message: "If the email exists, a reset link has been sent.",
  });
}

// ✅ SET NEW PASSWORD
async function newPassword(req, res) {
  const { new_password, reset_password_token } = req.body;

  const salt = await bcrypt.genSalt(12);
  const password = await bcrypt.hash(new_password, salt);

  const user = await query.user.update(
    {
      reset_password_token,
      reset_password_expires: [">", utils.dateToUTC(new Date())],
    },
    {
      reset_password_expires: null,
      reset_password_token: null,
      password,
    }
  );

  if (!user)
    throw new CustomError("Password reset failed. Please try again later.", 400);

  return res.status(200).json({
    message: "Password updated successfully.",
    email: user.email,
  });
}

// ✅ CHANGE EMAIL REQUEST
async function changeEmailRequest(req, res) {
  const { email, password } = req.body;

  const isMatch = await bcrypt.compare(password, req.user.password);
  if (!isMatch) throw new CustomError("Password is incorrect.", 401);

  const existing = await query.user.find({ email });
  if (existing) throw new CustomError("Email already in use.", 400);

  const updated = await query.user.update(
    { id: req.user.id },
    {
      change_email_address: email,
      change_email_token: randomUUID(),
      change_email_expires: utils.dateToUTC(addMinutes(new Date(), 30)),
    }
  );

  if (updated)
    await mail.changeEmail({ ...updated, email }).catch(console.error);

  return res.status(200).json({
    message: "Verification link sent to the new email address.",
  });
}

// ✅ CONFIRM EMAIL CHANGE
async function changeEmail(req, res, next) {
  const changeEmailToken = req.params.changeEmailToken;

  if (changeEmailToken) {
    const foundUser = await query.user.find({
      change_email_token: changeEmailToken,
      change_email_expires: [">", utils.dateToUTC(new Date())],
    });

    if (!foundUser) return next();

    const user = await query.user.update(
      { id: foundUser.id },
      {
        change_email_token: null,
        change_email_expires: null,
        change_email_address: null,
        email: foundUser.change_email_address,
      }
    );

    if (user) {
      const token = utils.signToken(user);
      utils.deleteCurrentToken(res);
      utils.setToken(res, token);
      res.locals.token_verified = true;
      req.cookies.token = token;
    }
  }

  return res.status(200).json({
    message: "Email changed successfully.",
  });
}

// ✅ FEATURE ACCESS CONTROL
function featureAccess(features, redirect) {
  return function (req, res, next) {
    for (let i = 0; i < features.length; ++i) {
      if (!features[i]) {
        throw new CustomError("Request not allowed.", 400);
      }
    }
    next();
  };
}

function featureAccessPage(features) {
  return featureAccess(features, true);
}

module.exports = {
  admin,
  apikey,
  changeEmail,
  changeEmailRequest,
  changePassword,
  createAdminUser,
  featureAccess,
  featureAccessPage,
  generateApiKey,
  jwt,
  jwtLoose,
  jwtLoosePage,
  jwtPage,
  local,
  login,
  newPassword,
  resetPassword,
  signup,
  verify,
};
