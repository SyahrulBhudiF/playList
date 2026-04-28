import { Server, Socket } from "socket.io";
import { sql } from "../db/client";

export function handleAdminEvents(io: Server, socket: Socket) {
  
  // Approve song request
  socket.on("approve_song", async (data: { roomId: string; songId: string }, callback) => {
    const { roomId, songId } = data;

    if (!roomId || !songId) {
      if (callback) callback({ success: false, error: "Missing fields" });
      return;
    }

    try {
      // 1. Update DB
      const result = await sql`
        UPDATE songs 
        SET status = 'approved', approved_at = NOW()
        WHERE id = ${songId} AND room_id = ${roomId} AND status = 'pending'
        RETURNING id, youtube_id as "youtubeId", title, author, status, submitted_by as "submittedBy", created_at as "createdAt"
      `;

      if (result.length === 0) {
        if (callback) callback({ success: false, error: "Song not found or already processed" });
        return;
      }

      const updatedSong = result[0];

      // 2. Broadcast updated queue to everyone in the room except regular participants? 
      // Actually, EO needs to know a new song was approved so it can fetch it if its queue was empty!
      // But we can trigger EO directly or just let EO listen to `queue_added`.
      io.to(roomId).emit("song_approved", updatedSong); // EO and Admins can listen to this

      if (callback) callback({ success: true, message: "Song approved" });
    } catch (err) {
      console.error(err);
      if (callback) callback({ success: false, error: "Database error" });
    }
  });

  // Delete/Reject song request (Silently rejected from user's perspective, deleted entirely)
  socket.on("delete_song", async (data: { roomId: string; songId: string }, callback) => {
    const { roomId, songId } = data;

    if (!roomId || !songId) {
      if (callback) callback({ success: false, error: "Missing fields" });
      return;
    }

    try {
      const result = await sql`
        DELETE FROM songs 
        WHERE id = ${songId} AND room_id = ${roomId}
        RETURNING id
      `;

      if (result.length > 0) {
        // Emit deletion event to admins so that they can remove it from their UI locally
        io.to(`${roomId}:admin`).emit("song_deleted", { songId });
      }

      if (callback) callback({ success: true, message: "Song deleted" });
    } catch (err) {
      console.error(err);
      if (callback) callback({ success: false, error: "Database error" });
    }
  });

  // Edit song title
  socket.on("edit_song", async (data: { roomId: string; songId: string; newTitle: string }, callback) => {
    const { roomId, songId, newTitle } = data;

    if (!roomId || !songId || !newTitle) {
      if (callback) callback({ success: false, error: "Missing fields" });
      return;
    }

    try {
      const result = await sql`
        UPDATE songs 
        SET title = ${newTitle}
        WHERE id = ${songId} AND room_id = ${roomId}
        RETURNING id, title
      `;

      if (result.length === 0) {
        if (callback) callback({ success: false, error: "Song not found" });
        return;
      }

      const updated = result[0];
      // Broadcast update to all admins and the EO
      io.to(roomId).emit("song_updated", updated);

      if (callback) callback({ success: true, song: updated });
    } catch (err) {
      console.error(err);
      if (callback) callback({ success: false, error: "Database error" });
    }
  });

}
