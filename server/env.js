require("dotenv").config(); // <-- load your custom env file
const { cleanEnv, num, str, bool } = require("envalid");
const { readFileSync } = require("node:fs");

const supportedDBClients = [
  "pg",
  "pg-native",
  "sqlite3",
  "better-sqlite3",
  "mysql",
  "mysql2"
];

// 🧩 Safety: make sure optional fields are not empty
if (process.env.LINK_CUSTOM_ALPHABET === "") {
  delete process.env.LINK_CUSTOM_ALPHABET;
}
if (process.env.JWT_SECRET === "") {
  delete process.env.JWT_SECRET;
}

// 🏭 Force production mode if started with --production
if (process.argv.includes("--production")) {
  process.env.NODE_ENV = "production";
}

const spec = {
  PORT: num({ default: 3000 }),
  SITE_NAME: str({ example: "Kutt", default: "Kutt" }),
  DEFAULT_DOMAIN: str({ example: "kutt.it", default: "localhost:3000" }),
  LINK_LENGTH: num({ default: 6 }),
  LINK_CUSTOM_ALPHABET: str({
    default: "abcdefghkmnpqrstuvwxyzABCDEFGHKLMNPQRSTUVWXYZ23456789",
  }),
  TRUST_PROXY: bool({ default: true }),

  // 🗄️ Database
  DB_CLIENT: str({ choices: supportedDBClients, default: "better-sqlite3" }),
  DB_FILENAME: str({ default: "db/data.sqlite" }),
  DB_HOST: str({ default: "localhost" }),
  DB_PORT: num({ default: 5432 }),
  DB_NAME: str({ default: "kutt" }),
  DB_USER: str({ default: "postgres" }),
  DB_PASSWORD: str({ default: "" }),
  DB_SSL: bool({ default: false }),
  DB_POOL_MIN: num({ default: 0 }),
  DB_POOL_MAX: num({ default: 10 }),

  // ⚡ Redis
  REDIS_ENABLED: bool({ default: false }),
  REDIS_HOST: str({ default: "127.0.0.1" }),
  REDIS_PORT: num({ default: 6379 }),
  REDIS_PASSWORD: str({ default: "" }),
  REDIS_DB: num({ default: 0 }),

  // 🚫 Restrictions
  DISALLOW_ANONYMOUS_LINKS: bool({ default: true }),
  DISALLOW_REGISTRATION: bool({ default: true }),

  // 🌐 Server details
  SERVER_IP_ADDRESS: str({ default: "" }),
  SERVER_CNAME_ADDRESS: str({ default: "" }),
  CUSTOM_DOMAIN_USE_HTTPS: bool({ default: false }),

  // 🔐 Security
  JWT_SECRET: str({ devDefault: "securekey" }),

  // 📧 Email
  MAIL_ENABLED: bool({ default: false }),
  MAIL_HOST: str({ default: "" }),
  MAIL_PORT: num({ default: 587 }),
  MAIL_SECURE: bool({ default: false }),
  MAIL_USER: str({ default: "" }),
  MAIL_FROM: str({ default: "", example: "Kutt <support@kutt.it>" }),
  MAIL_PASSWORD: str({ default: "" }),

  // 🚦 Rate limiting
  ENABLE_RATE_LIMIT: bool({ default: true }),

  // 📬 Communication
  REPORT_EMAIL: str({ default: "" }),
  CONTACT_EMAIL: str({ default: "" }),

  // 🧠 Clustering (for pm2)
  NODE_APP_INSTANCE: num({ default: 0 }),

  // 🧭 NEW: React frontend URL for CORS
  CLIENT_URL: str({
    default: "http://localhost:5173",
    example: "https://yourfrontend.com",
    desc: "Allowed frontend origin for CORS requests",
  }),
};

// 🔑 Support *_FILE style environment vars (Docker secrets, etc.)
for (const key in spec) {
  const file_key = key + "_FILE";
  if (!(file_key in process.env)) continue;
  try {
    process.env[key] = readFileSync(process.env[file_key], "utf8").trim();
  } catch {
    // ignore errors
  }
}

const env = cleanEnv(process.env, spec);

module.exports = env;
