import postgres from "postgres";

const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is missing!");
} else {
  try {
    const url = new URL(connectionString);
    console.log(`🐘 Initializing Postgres client for host: ${url.hostname}...`);
    console.log(`📡 Connection String Length: ${connectionString.length}`);
  } catch (e) {
    console.error("❌ Invalid DATABASE_URL format.");
  }
}

// We use neon postgres. Default options are fine.
export const sql = postgres(connectionString || "", {
  ssl: connectionString?.includes("localhost") || 
       connectionString?.includes("127.0.0.1") || 
       connectionString?.includes("@postgres") || 
       connectionString?.includes("sslmode=disable") ? false : "require",
  max: 10,
  connect_timeout: 45, // Increased timeout for Neon cold-starts (45s)
  idle_timeout: 20,    // Close idle connections after 20s
  onnotice: (notice) => console.log("Postgres Notice:", notice.message),
});

