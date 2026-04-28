import { spawn } from "bun";

console.log("\n\x1b[36m%s\x1b[0m", "🎵 Starting PlayMusic Development Stack...");
console.log("\x1b[2m%s\x1b[0m", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

// Spawn Server
const server = spawn(["bun", "run", "dev"], {
  cwd: "./server",
  stdout: "inherit",
  stderr: "inherit",
});

// Spawn Client
const client = spawn(["bun", "run", "dev"], {
  cwd: "./client",
  stdout: "inherit",
  stderr: "inherit",
});

// Handle cleanup on exit
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down...");
  server.kill();
  client.kill();
  process.exit();
});

// Keep the process alive
await Promise.all([server.exited, client.exited]);
