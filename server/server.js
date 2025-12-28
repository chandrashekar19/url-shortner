const env = require("./env");
const express = require("express");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const cors = require("cors");
const helmet = require("helmet");
const path = require("node:path");

// --- Utilities ---
const { errorHandler } = require("./utils/errors");

// --- Modules ---
const authRoutes = require("./modules/auth/auth.routes");
const linkRoutes = require("./modules/links/links.routes");

// Initialize passport strategy
require("./passport");

// Initialize cron jobs (only once)
if (env.NODE_APP_INSTANCE === 0) {
  require("./cron");
}

const app = express();

// --- Middleware Stack ---
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

// --- Routes ---

// Health Check
app.get("/health", (req, res) => res.status(200).send("OK"));

// Feature Modules
app.use("/api/auth", authRoutes);
app.use("/api/links", linkRoutes);

// Static assets (for React production build)
const clientDist = path.join(__dirname, "../client/dist");
app.use(express.static(clientDist));

// Catch-all for React Routing
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) res.status(404).json({ error: "Not found" });
  });
});

// --- Global Error Handler ---
app.use(errorHandler);

// --- Boot ---
const PORT = env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Kutt Core v2 Running: http://localhost:${PORT}`);
  console.log(`📁 Database: ${env.DB_FILENAME}`);
});
