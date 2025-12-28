const { db } = require("../../db/drizzle");
const { links } = require("./links.schema");
const { eq, sql } = require("drizzle-orm");
const { nanoid } = require("nanoid");
const { CustomError } = require("../../utils");

/**
 * 🕹️ Links Controller (Senior Architect Pattern)
 * Consolidates all logic for URL shortening.
 */

// 1. Create a new short link
exports.createLink = async (req, res) => {
    const { target, address, description, password, expire_in } = req.body;

    // Auto-generate alias if none provided
    const alias = address || nanoid(6);
    const uuid = nanoid(10);

    const [newLink] = await db.insert(links).values({
        uuid,
        address: alias,
        target,
        description,
        password, // Hash this in a real app
        expire_in,
        user_id: req.user?.id || null,
    }).returning();

    return res.status(201).json({
        message: "Link shortened successfully",
        ...newLink,
    });
};

// 2. Get all links for current user
exports.getUserLinks = async (req, res) => {
    const userLinks = await db.select()
        .from(links)
        .where(eq(links.user_id, req.user.id))
        .orderBy(sql`${links.created_at} DESC`);

    return res.json(userLinks);
};

// 3. Delete a link
exports.deleteLink = async (req, res) => {
    const { id } = req.params;

    await db.delete(links)
        .where(eq(links.id, parseInt(id)));

    return res.json({ message: "Link deleted" });
};
