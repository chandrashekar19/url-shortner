const { addDays } = require("date-fns");
const { customAlphabet } = require("nanoid");
const JWT = require("jsonwebtoken");
const env = require("../env");
const { ROLES } = require("../consts");

/**
 * 🛠️ Utils (Modernized & Lean)
 */

const nanoid = customAlphabet(env.LINK_CUSTOM_ALPHABET, env.LINK_LENGTH);

function isAdmin(user) {
  return user.role === ROLES.ADMIN;
}

function signToken(user) {
  return JWT.sign(
    {
      iss: "ApiAuth",
      sub: user.id,
      iat: parseInt((new Date().getTime() / 1000).toFixed(0)),
      exp: parseInt((addDays(new Date(), 7).getTime() / 1000).toFixed(0))
    },
    env.JWT_SECRET
  )
}

function deleteCurrentToken(res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: env.isProd || false,
    sameSite: env.isProd ? "strict" : "lax",
    path: "/",
  });
}

function removeWww(host) {
  return host ? host.replace("www.", "") : "";
};

module.exports = {
  isAdmin,
  signToken,
  deleteCurrentToken,
  removeWww,
  nanoid,
};