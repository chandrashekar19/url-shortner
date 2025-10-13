const env = require("./env");

const cookieParser = require("cookie-parser");
const passport = require("passport");
const express = require("express");
const helmet = require("helmet");
const path = require("node:path");
const cors = require("cors");

const helpers = require("./handlers/helpers.handler");
const asyncHandler = require("./utils/asyncHandler");
const links = require("./handlers/links.handler");
const routes = require("./routes");

// Initialize cron jobs (only once)
if (env.NODE_APP_INSTANCE === 0) {
  require("./cron");
}

//  Initialize passport
require("./passport");

// Create Express app
const app = express();

// Trust proxy if behind load balancer (e.g., Render, AWS, Nginx)
if (env.TRUST_PROXY) {
  app.set("trust proxy", true);
}

// Add secure CORS
app.use(
  cors({
    origin: env.CLIENT_URL || "http://localhost:5173", // React frontend URL
    credentials: true, // allow cookies / auth headers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  Serve optional static assets
app.use("/public", express.static(path.join(__dirname, "../public")));

//  Initialize passport
app.use(passport.initialize());

// Middleware helpers
const locals = require("./handlers/locals.handler");
app.use(locals.isHTML);
app.use(locals.config);

// Redirect if custom domain homepage is set
app.use(asyncHandler(links.redirectCustomDomainHomepage));

//  Handle API routes
app.use("/api/v2", routes);
app.use("/api", routes);

// Short link redirect
app.get("/:id", asyncHandler(links.redirect));

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

//  Error handler
app.use(helpers.error);

//  Start server
app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
