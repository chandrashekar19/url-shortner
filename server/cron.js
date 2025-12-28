const { db } = require("./db/drizzle");
const { links } = require("./modules/links/links.schema");
const { sql, lt } = require("drizzle-orm");

/**
 * ⏰ Cron Jobs (Modernized)
 * Automatically cleans up expired links every 30 seconds.
 */

setInterval(async function () {
  try {
    const now = new Date().toISOString();

    const result = await db.delete(links)
      .where(lt(links.expire_in, now));

    if (result.changes > 0) {
      console.log(`🧹 Cron: Cleaned up ${result.changes} expired links.`);
    }
  } catch (err) {
    console.error("❌ Cron error:", err.message);
  }
}, 30_000);
