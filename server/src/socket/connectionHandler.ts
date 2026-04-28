import { Server, Socket } from "socket.io";
import { roomManager } from "../state/roomManager";
import { sql } from "../db/client";

export function handleConnection(io: Server, socket: Socket) {
  
  // Custom tracking for this socket
  let currentRoom: string | null = null;
  let currentRole: "participant" | "admin" | "eo" | null = null;

  socket.on("join_room", async ({ roomId, role }: { roomId: string; role: "participant" | "admin" | "eo" }) => {
    // 1. Verify DB Room exists
    try {
      const dbRooms = await sql`SELECT id FROM rooms WHERE id = ${roomId}`;
      if (dbRooms.length === 0) {
        socket.emit("error", { message: "Room not found" });
        return;
      }
    } catch (e) {
      console.error(e);
      socket.emit("error", { message: "Internal server error" });
      return;
    }

    // 2. Role logic enforcement
    if (role === "eo" || role === "admin") {
      console.log(`[AUTH] Socket ${socket.id} attempting to claim EO role for room ${roomId}`);
      const registered = roomManager.registerPlaybackController(roomId, socket.id);
      if (!registered) {
        if (role === "eo") {
          console.warn(`[AUTH] EO registration REJECTED for ${socket.id} (Room ${roomId} already controlled)`);
          socket.emit("error", { message: "Room already has an active playback controller." });
          socket.disconnect();
          return;
        } else {
          console.log(`[AUTH] Admin ${socket.id} joined, but EO role already taken for room ${roomId}`);
        }
      } else {
        console.log(`[AUTH] EO registration SUCCESS for ${socket.id} (Role: ${role})`);
        socket.emit("eo_registered", { success: true });
      }
    }

    // Join Socket.IO room
    socket.join(roomId);
    currentRoom = roomId;
    currentRole = role;

    // Optional scoping by role: we can also join a role-specific room for easy admin broadcasting
    socket.join(`${roomId}:${role}`);

    // 3. Push initial state to all roles
    const nowPlaying = roomManager.getNowPlaying(roomId);
    if (nowPlaying) {
      socket.emit("now_playing_updated", nowPlaying);
    }

    try {
      if (role === "admin") {
        const queue = await sql`
          SELECT id, youtube_id as "youtubeId", title, author, status, submitted_by as "submittedBy", created_at as "createdAt"
          FROM songs 
          WHERE room_id = ${roomId} AND status IN ('pending', 'approved')
          ORDER BY approved_at ASC NULLS LAST, created_at ASC
        `;
        socket.emit("queue_updated", queue);
      } else {
        const queue = await sql`
          SELECT id, youtube_id as "youtubeId", title, author, status, submitted_by as "submittedBy", created_at as "createdAt"
          FROM songs 
          WHERE room_id = ${roomId} AND status = 'approved'
          ORDER BY approved_at ASC, created_at ASC
        `;
        socket.emit("queue_updated", queue);
      }
    } catch (err) {
      console.error(err);
    }

    console.log(`Socket ${socket.id} joined room ${roomId} as ${role}`);
  });

  socket.on("get_now_playing", ({ roomId }: { roomId: string }, callback) => {
    const nowPlaying = roomManager.getNowPlaying(roomId);
    callback({ nowPlaying });
  });

  socket.on("disconnect", () => {
    // Cleanup EO if this socket was an EO
    const eoCleanupRoomId = roomManager.unregisterControllerIfAny(socket.id);
    if (eoCleanupRoomId) {
      console.warn(`EO disconnected from room ${eoCleanupRoomId}`);
    }
  });
}
