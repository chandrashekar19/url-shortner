const { sqliteTable, text, integer } = require("drizzle-orm/sqlite-core");
const { z } = require("zod");
const { ROLES } = require("../../consts");

/**
 * 👤 Users Schema (Drizzle ORM)
 */
const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    apikey: text("apikey"),
    role: text("role").default(ROLES.USER).notNull(),
    verified: integer("verified", { mode: "boolean" }).default(false),
    banned: integer("banned", { mode: "boolean" }).default(false),
    created_at: text("created_at").default(new Date().toISOString()),
    updated_at: text("updated_at").default(new Date().toISOString()),
});

/**
 * ✅ Auth Validations (Zod)
 */
const LoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

const SignupSchema = LoginSchema.extend({
    // Add other signup fields here if needed
});

module.exports = { users, LoginSchema, SignupSchema };
