import { sql } from "./client";

export async function setupDatabase() {
  console.log("🛠️  Setting up database schema...");

  try {
    // Rooms table
    console.log("  - Ensuring 'rooms' table exists...");
    await sql`
      CREATE TABLE IF NOT EXISTS rooms (
        id VARCHAR(50) PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Songs table
    console.log("  - Ensuring 'songs' table exists...");
    await sql`
      CREATE TABLE IF NOT EXISTS songs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id VARCHAR(50) REFERENCES rooms(id) ON DELETE CASCADE,
        youtube_id VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255),
        status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, approved, playing, done
        submitted_by VARCHAR(255) NOT NULL, -- userId from localstorage
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        approved_at TIMESTAMP WITH TIME ZONE
      );
    `;

    // Migration: Add author if it doesn't exist (for existing databases)
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='songs' AND column_name='author') THEN
          ALTER TABLE songs ADD COLUMN author VARCHAR(255);
        END IF;
      END $$;
    `;

    // Create an index for faster queue pulling (orderBy approved_at ASC)
    console.log("  - Ensuring 'songs_queue_idx' exists...");
    await sql`
      CREATE INDEX IF NOT EXISTS songs_queue_idx ON songs(room_id, status, approved_at);
    `;


    console.log("✅ Database schema ready.");
  } catch (error: any) {
    console.error("❌ Failed to setup database schema:", error.message || error);
    
    if (error.code === 'ECONNREFUSED') {
      console.error("💡 Hint: Connection refused. Is your database running and accessible?");
    } else if (error.code === 'ETIMEDOUT') {
      console.error("💡 Hint: Connection timed out. This is often a firewall or IP whitelist issue.");
    }
    
    throw error;
  }
}

