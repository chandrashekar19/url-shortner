const { db } = require("../../db/drizzle");
const { links } = require("./links.schema");
const { eq, sql } = require("drizzle-orm");
const { nanoid } = require("nanoid");

const env = require("../../env");

/**
 * 🕹️ Links Controller
 * Helper to format link for frontend
 */
const formatLink = (link) => ({
    id: link.uuid,
    address: link.address,
    target: link.target,
    description: link.description || "",
    link: `http://localhost:3000/${link.address}`,
    banned: !!link.banned,
    created_at: link.created_at,
    updated_at: link.updated_at,
    visit_count: link.visit_count || 0,
    password: !!link.password,
});

// 1. Create a new short link
exports.createLink = async (req, res) => {
    const { target, customurl, description, password, expire_in } = req.body;

    // Auto-generate alias if none provided
    const alias = customurl || nanoid(6);
    const uuid = nanoid(10);

    const [newLink] = await db.insert(links).values({
        uuid,
        address: alias,
        target,
        description,
        password,
        expire_in,
        user_id: req.user?.id || null,
    }).returning();

    return res.status(201).json({
        message: "Link shortened successfully",
        ...formatLink(newLink),
    });
};

// 2. Get all links for current user
exports.getUserLinks = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;

    const userLinks = await db.select()
        .from(links)
        .where(eq(links.user_id, req.user.id))
        .orderBy(sql`${links.created_at} DESC`)
        .limit(limit)
        .offset(skip);

    // Count total links for this user
    const [{ count }] = await db.select({ count: sql`count(*)` })
        .from(links)
        .where(eq(links.user_id, req.user.id));

    return res.json({
        total: parseInt(count),
        limit,
        skip,
        data: userLinks.map(formatLink),
    });
};

// 3. Delete a link
exports.deleteLink = async (req, res) => {
    const { id } = req.params;

    await db.delete(links)
        .where(eq(links.uuid, id));

    return res.json({ message: "Link deleted" });
};
