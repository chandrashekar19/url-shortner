const { Strategy: LocalAPIKeyStrategy } = require("passport-localapikey-update");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const { Strategy: LocalStrategy } = require("passport-local");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { db } = require("./db/drizzle");
const { users } = require("./modules/users/users.schema");
const { eq } = require("drizzle-orm");
const env = require("./env");

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    (req) => req.cookies?.token,
    ExtractJwt.fromAuthHeaderAsBearerToken(),
  ]),
  secretOrKey: env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      if (typeof payload.sub === "string" || !payload.sub) {
        return done(null, false);
      }
      const [user] = await db.select().from(users).where(eq(users.id, payload.sub));
      if (!user) return done(null, false);
      return done(null, user, payload);
    } catch (err) {
      return done(err);
    }
  })
);

const localOptions = {
  usernameField: "email"
};

passport.use(
  new LocalStrategy(localOptions, async (email, password, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      if (!user) {
        return done(null, false);
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false);
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

const localAPIKeyOptions = {
  apiKeyField: "apikey",
  apiKeyHeader: "x-api-key"
};

passport.use(
  new LocalAPIKeyStrategy(localAPIKeyOptions, async (apikey, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.apikey, apikey));
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);
