const { drizzle } = require("drizzle-orm/better-sqlite3");
const Database = require("better-sqlite3");
const path = require("node:path");
const env = require("../env");

/**
 * 🗄️ Database Connection (Senior Architect Pattern)
 * 
 * We use better-sqlite3 for local development.
 * This setup automatically connects to the database file defined in your .env
 */

const sqlitePath = path.resolve(process.cwd(), env.DB_FILENAME);
const sqlite = new Database(sqlitePath);

// Create drizzle database instance
const db = drizzle(sqlite);

console.log(`📡 Database connected via Drizzle: ${env.DB_FILENAME}`);

module.exports = { db, sqlite };
