import { sql } from "./client.js";

async function checkConnection() {
  console.log("🔍 Testing database connectivity...");
  
  const startTime = Date.now();
  
  try {
    // Try a simple query
    const result = await sql`SELECT 1 as connected`;
    const duration = Date.now() - startTime;
    
    if (result && result[0].connected === 1) {
      console.log(`✅ SUCCESS! Database is reachable.`);
      console.log(`⏱️  Latency: ${duration}ms`);
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`\n❌ CONNECTION FAILED after ${duration}ms`);
    console.error(`----------------------------------------`);
    console.error(`Error Code: ${error.code}`);
    console.error(`Message:    ${error.message}`);
    
    console.log(`\n💡 DIAGNOSIS:`);
    if (error.code === 'ETIMEDOUT') {
      console.log("  - Your network is taking too long to respond.");
      console.log("  - Possible cause: Firewall is dropping packets to port 5432.");
      console.log("  - Possible cause: Your IP address is not whitelisted in Neon.");
    } else if (error.code === 'ECONNREFUSED') {
      console.log("  - The host actively refused the connection.");
      console.log("  - Possible cause: The database server is down or misconfigured.");
    } else {
      console.log("  - An unknown error occurred. Check your DATABASE_URL.");
    }
    
    console.log(`\n🚀 RECOMMENDED SOLUTIONS:`);
    console.log("  1. If using Neon: Add your IP to the 'Allowed IP Addresses' in Neon console.");
    console.log("  2. If port 5432 is blocked: Use a local database (see .env instructions).");
    console.log("  3. Check if your DATABASE_URL contains trailing spaces or typos.");
  } finally {
    process.exit(0);
  }
}

checkConnection();
