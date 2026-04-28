import { Server, Socket } from "socket.io";
import { sql } from "../db/client";
import { roomManager } from "../state/roomManager";

export function handleEOEvents(io: Server, socket: Socket) {
  
  // EO asks for the next track right away or when a track finishes
  socket.on("eo_track_ended", async (data: { roomId: string }, callback) => {
    const { roomId } = data;

    if (!roomId) {
      if (callback) callback({ success: false, error: "Missing roomId" });
      return;
    }

    try {
      console.log(`EO for room ${roomId} requested next track...`);
      // 1. Check if EO is legitimately the EO
      const activeEO = roomManager.getPlaybackController(roomId);
      if (activeEO && activeEO !== socket.id) {
        if (callback) callback({ success: false, error: "Unauthorized. You are not the active playback controller." });
        return;
      }

      // Mark the currently playing one as 'done'
      const currentlyPlaying = roomManager.getNowPlaying(roomId);
      if (currentlyPlaying) {
        console.log(`Marking song ${currentlyPlaying.id} as done.`);
        await sql`
          UPDATE songs 
          SET status = 'done' 
          WHERE id = ${currentlyPlaying.id}
        `;
        roomManager.setNowPlaying(roomId, null);
      }

      // 2. Find the next approved song (ORDER BY approved_at ASC LIMIT 1)
      const nextSongs = await sql`
        SELECT id, youtube_id as "youtubeId", title, author 
        FROM songs
        WHERE room_id = ${roomId} AND status = 'approved'
        ORDER BY approved_at ASC, created_at ASC
        LIMIT 1
      `;

      if (nextSongs.length === 0) {
        console.log(`No approved songs found for room ${roomId}.`);
        io.to(roomId).emit("now_playing_updated", null); 
        if (callback) callback({ success: true, message: "Queue is empty", nextTrack: null });
        return;
      }

      const nextTrack = nextSongs[0];
      if (!nextTrack) return; // Should be handled by length check, but satisfies TS

      console.log(`Found next track: ${nextTrack.title} (${nextTrack.youtubeId})`);

      // 3. Mark the next one as playing
      await sql`
        UPDATE songs 
        SET status = 'playing' 
        WHERE id = ${nextTrack.id}
      `;

      // 4. Update memory state
      roomManager.setNowPlaying(roomId, {
        id: nextTrack.id,
        youtubeId: nextTrack.youtubeId,
        title: nextTrack.title,
        author: nextTrack.author
      });

      // --- PRELOAD LOGIC ---
      // 5. Look ahead for the track that follows this one
      const upcoming = await sql`
        SELECT id, youtube_id as "youtubeId", title, author 
        FROM songs
        WHERE room_id = ${roomId} AND status = 'approved' AND id != ${nextTrack.id}
        ORDER BY approved_at ASC, created_at ASC
        LIMIT 1
      `;
      const upNext = upcoming[0] || null;

      // 6. Broadcast to room what is now playing
      io.to(roomId).emit("now_playing_updated", nextTrack);

      // Return both for EO
      if (callback) callback({ success: true, nextTrack, upNext });

    } catch (err) {
      console.error(err);
      if (callback) callback({ success: false, error: "Database error" });
    }
  });

}
