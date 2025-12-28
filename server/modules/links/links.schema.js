const { sqliteTable, text, integer } = require("drizzle-orm/sqlite-core");
const { z } = require("zod");

/**
 * 📊 Links Schema (Drizzle ORM)
 * This defines how a "Link" looks in our database.
 */
const links = sqliteTable("links", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull(),
    address: text("address").notNull(),
    target: text("target").notNull(),
    description: text("description"),
    password: text("password"),
    expire_in: text("expire_in"), // Store as ISO string
    visit_count: integer("visit_count").default(0),
    user_id: integer("user_id"),
    domain_id: integer("domain_id"),
    banned: integer("banned", { mode: "boolean" }).default(false),
    created_at: text("created_at").default(new Date().toISOString()),
    updated_at: text("updated_at").default(new Date().toISOString()),
});

/**
 * ✅ Links Validation (Zod)
 * This ensures the data sent from the UI is clean and safe.
 */
const LinkCreateSchema = z.object({
    target: z.string().url("Please provide a valid URL"),
    address: z.string().min(1).max(20).optional(),
    description: z.string().max(255).optional(),
    password: z.string().min(6).optional(),
    expire_in: z.string().optional(),
});

module.exports = { links, LinkCreateSchema };
