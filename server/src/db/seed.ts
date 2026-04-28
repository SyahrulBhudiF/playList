import { sql } from "./client";
import { setupDatabase } from "./schema";

const TEST_ROOM_ID = "test-hackathon-room";

async function seed() {
  try {
    await setupDatabase();
    
    console.log("Cleaning existing database...");
    await sql`DELETE FROM songs`;
    await sql`DELETE FROM rooms`;

    console.log("Inserting test room...");
    await sql`
      INSERT INTO rooms (id) VALUES (${TEST_ROOM_ID})
    `;

    console.log(`✅ Seed complete. Test room created with ID: ${TEST_ROOM_ID}`);
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    process.exit(0);
  }
}

seed();
