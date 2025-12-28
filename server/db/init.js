const Database = require("better-sqlite3");
const path = require("node:path");

/**
 * 🗄️ Database Initialization Script
 * Creates all required tables for Kutt Core v2
 */

const dbPath = path.resolve(__dirname, "../../db/data.sqlite");
const db = new Database(dbPath);

console.log(`📡 Initializing database: ${dbPath}`);

// Create Users Table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    apikey TEXT,
    role TEXT NOT NULL DEFAULT 'USER',
    verified INTEGER NOT NULL DEFAULT 0,
    banned INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// Create Links Table
db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL,
    address TEXT NOT NULL,
    target TEXT NOT NULL,
    description TEXT,
    password TEXT,
    expire_in TEXT,
    visit_count INTEGER DEFAULT 0,
    user_id INTEGER,
    domain_id INTEGER,
    banned INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Create Domains Table (optional for custom domains)
db.exec(`
  CREATE TABLE IF NOT EXISTS domains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL UNIQUE,
    homepage TEXT,
    user_id INTEGER,
    banned INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

console.log("✅ Database tables created successfully!");
console.log("Tables: users, links, domains");

db.close();
