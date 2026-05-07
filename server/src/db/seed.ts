import { sql } from "./client";

export async function seedAdmins() {
  console.log("🌱 Seeding admin accounts...");
  
  const password = "12345678";
  const passwordHash = await Bun.password.hash(password);
  
  const admins = [
    { username: "admin1", email: "admin1@playit.com", role: "super_admin", status: "active" },
    { username: "admin2", email: "admin2@playit.com", role: "admin", status: "active" },
    { username: "admin3", email: "admin3@playit.com", role: "admin", status: "active" },
    { username: "admin4", email: "admin4@playit.com", role: "admin", status: "active" },
    { username: "admin5", email: "admin5@playit.com", role: "admin", status: "active" }
  ];

  for (const admin of admins) {
    try {
      await sql`
        INSERT INTO admins (username, email, password_hash, role, status)
        VALUES (${admin.username}, ${admin.email}, ${passwordHash}, ${admin.role}, ${admin.status})
        ON CONFLICT (username) DO UPDATE 
        SET email = EXCLUDED.email, 
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role, 
            status = EXCLUDED.status
      `;
      console.log(`  - ${admin.username} (${admin.email}) synchronized.`);
    } catch (err) {
      console.error(`  - Failed to seed ${admin.username}:`, err);
    }
  }
  
  console.log("✅ Seeding complete.");
  
  // LOG BOOTSTRAP INFO
  console.log("\n" + "=".repeat(50));
  console.log("🔐 ADMIN BOOTSTRAP INFO");
  console.log("  To register custom accounts, use this Invite Code:");
  console.log(`  >> ${process.env.ADMIN_INVITE_CODE || "PLAY-ADMIN-2026"} <<`);
  console.log("  (Visible only in these server logs)");
  console.log("=".repeat(50) + "\n");
}
