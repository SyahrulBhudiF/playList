import { sql } from "./src/db/client";
import { redis } from "./src/lib/redis";

async function clean() {
  console.log("\n" + "=".repeat(50));
  console.log("🧹 DATABASE CLEANUP INITIATED");
  console.log("=".repeat(50));
  
  try {
    // 1. Truncate Postgres tables (Reset everything except admins)
    console.log("📡 Connecting to Postgres...");
    console.log("🗑️  Truncating tables: songs, rooms...");
    
    // Using CASCADE to ensure references are handled, though rooms is the parent.
    await sql`TRUNCATE TABLE songs, rooms CASCADE`;
    
    console.log("✅ Postgres tables cleared.");

    // 2. Clear Redis (Remove all room resolutions and cache)
    console.log("\n📡 Connecting to Redis...");
    console.log("🔥 Flushing all Redis keys...");
    
    await redis.flushall();
    
    console.log("✅ Redis cache cleared.");
    
    console.log("\n" + "=".repeat(50));
    console.log("✨ CLEANUP COMPLETE");
    console.log("=".repeat(50) + "\n");

  } catch (err: any) {
    console.error("\n❌ Cleanup failed!");
    console.error(err.message || err);
  } finally {
    // Gracefully shut down connections
    await redis.quit();
    await sql.end();
    process.exit(0);
  }
}

clean();
