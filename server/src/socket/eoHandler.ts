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

      // Mark any currently playing songs as 'done' to prevent stale playback state
      const playingRows = await sql`
        SELECT id
        FROM songs
        WHERE room_id = ${roomId} AND status = 'playing'
      `;
      if (playingRows.length > 0) {
        const playingIds = playingRows.map((row: any) => row.id);
        console.log(`Marking ${playingIds.length} playing song(s) as done.`);
        await sql`
          UPDATE songs
          SET status = 'done', done_at = NOW()
          WHERE room_id = ${roomId} AND status = 'playing'
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

        const queueRows = await sql`
          SELECT id, youtube_id as "youtubeId", title, author, status, submitted_by as "submittedBy", created_at as "createdAt"
          FROM songs
          WHERE room_id = ${roomId} AND status IN ('pending', 'approved')
          ORDER BY approved_at ASC NULLS LAST, created_at ASC
        `;
        const updatedQueue = [...queueRows];
        roomManager.setQueue(roomId, updatedQueue);

        io.to(`${roomId}:admin`).emit("queue_updated", updatedQueue);
        io.to(`${roomId}:participant`).emit("queue_updated", updatedQueue.filter(q => q.status === 'approved'));
        io.to(`${roomId}:eo`).emit("queue_updated", updatedQueue.filter(q => q.status === 'approved'));

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

      // 6. Refresh queue cache/broadcast after status transitions
      const queueRows = await sql`
        SELECT id, youtube_id as "youtubeId", title, author, status, submitted_by as "submittedBy", created_at as "createdAt"
        FROM songs
        WHERE room_id = ${roomId} AND status IN ('pending', 'approved')
        ORDER BY approved_at ASC NULLS LAST, created_at ASC
      `;
      const updatedQueue = [...queueRows];
      roomManager.setQueue(roomId, updatedQueue);

      io.to(`${roomId}:admin`).emit("queue_updated", updatedQueue);
      io.to(`${roomId}:participant`).emit("queue_updated", updatedQueue.filter(q => q.status === 'approved'));
      io.to(`${roomId}:eo`).emit("queue_updated", updatedQueue.filter(q => q.status === 'approved'));

      // Broadcast to room what is now playing
      io.to(roomId).emit("now_playing_updated", nextTrack);

      // Return both for EO
      if (callback) callback({ success: true, nextTrack, upNext });

    } catch (err) {
      console.error(err);
      if (callback) callback({ success: false, error: "Database error" });
    }
  });

  // Admin syncs playback progress to all participants
  socket.on("sync_playback", (data: { roomId: string; currentTime: number; duration: number; isPlaying: boolean }) => {
    const { roomId, currentTime, duration, isPlaying } = data;
    if (!roomId) return;
    // Broadcast to everyone in the room (including sender for consistency)
    io.to(roomId).emit("playback_sync", { currentTime, duration, isPlaying });
  });

  // EO requests previous track
  socket.on("previous_track", async (data: { roomId: string }, callback) => {
    const { roomId } = data;

    if (!roomId) {
      if (callback) callback({ success: false, error: "Missing roomId" });
      return;
    }

    try {
      const activeEO = roomManager.getPlaybackController(roomId);
      if (activeEO && activeEO !== socket.id) {
        if (callback) callback({ success: false, error: "Unauthorized" });
        return;
      }

      // Find the most recently completed track
      const prevSongs = await sql`
        SELECT id, youtube_id as "youtubeId", title, author
        FROM songs
        WHERE room_id = ${roomId} AND status = 'done'
        ORDER BY done_at DESC
        LIMIT 1
      `;

      const prevTrack = prevSongs[0];
      if (!prevTrack) {
        if (callback) callback({ success: false, error: "No previous track" });
        return;
      }
      const pt: any = prevTrack;

      // Mark current playing track back to approved so it replays later
      const currentPlaying = await sql`
        SELECT id
        FROM songs
        WHERE room_id = ${roomId} AND status = 'playing'
        LIMIT 1
      `;

      if (currentPlaying.length > 0) {
        await sql`
          UPDATE songs
          SET status = 'approved', approved_at = NOW()
          WHERE id = ${(currentPlaying[0] as any).id}
        `;
      }

      // Mark the previous track as playing again
      await sql`
        UPDATE songs
        SET status = 'playing', done_at = NULL
        WHERE id = ${pt.id}
      `;

      roomManager.setNowPlaying(roomId, {
        id: pt.id,
        youtubeId: pt.youtubeId,
        title: pt.title,
        author: pt.author,
      });

      // Refresh and broadcast queue
      const queueRows = await sql`
        SELECT id, youtube_id as "youtubeId", title, author, status, submitted_by as "submittedBy", created_at as "createdAt"
        FROM songs
        WHERE room_id = ${roomId} AND status IN ('pending', 'approved')
        ORDER BY approved_at ASC NULLS LAST, created_at ASC
      `;
      const updatedQueue = [...queueRows];
      roomManager.setQueue(roomId, updatedQueue);

      io.to(`${roomId}:admin`).emit("queue_updated", updatedQueue);
      io.to(`${roomId}:participant`).emit("queue_updated", updatedQueue.filter(q => q.status === 'approved'));
      io.to(`${roomId}:eo`).emit("queue_updated", updatedQueue.filter(q => q.status === 'approved'));

      io.to(roomId).emit("now_playing_updated", pt);

      if (callback) callback({ success: true, previousTrack: pt });
    } catch (err) {
      console.error(err);
      if (callback) callback({ success: false, error: "Database error" });
    }
  });

  // EO toggles playback (Play/Pause)
  socket.on("toggle_playback", (data: { roomId: string, isPlaying: boolean }) => {
    const { roomId, isPlaying } = data;
    if (!roomId) return;

    // Check if authorized
    const activeEO = roomManager.getPlaybackController(roomId);
    if (activeEO && activeEO !== socket.id) return;

    roomManager.setIsPlaying(roomId, isPlaying);
    io.to(roomId).emit("playback_updated", { isPlaying });
    console.log(`Playback for room ${roomId} set to: ${isPlaying}`);
  });
}
