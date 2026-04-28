import "dotenv/config";
import { Server } from "socket.io";
import postgres from "postgres";
import { setupDatabase } from "./src/db/schema";
import { handleConnection } from "./src/socket/connectionHandler";
import { handleParticipantEvents } from "./src/socket/participantHandler";
import { handleAdminEvents } from "./src/socket/adminHandler";
import { handleEOEvents } from "./src/socket/eoHandler";

// Verify environment before starting
if (!process.env.DATABASE_URL) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const io = new Server({
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  // 1. Connection & room joining logic
  handleConnection(io, socket);

  // 2. Role-specific logic
  handleParticipantEvents(io, socket);
  handleAdminEvents(io, socket);
  handleEOEvents(io, socket);

});

const PORT = 3001;

// Setup database then start server
setupDatabase()
  .then(() => {
    io.listen(PORT);
    console.log(`🎵 Music Queue Server running on http://localhost:${PORT}`);
  })
  .catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
  });