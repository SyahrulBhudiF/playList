import { Server, Socket } from "socket.io";
import { sql } from "../db/client";
import ytsort from "yt-search";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Simple in-memory cache for search results (5 minute TTL)
const searchCache = new Map<string, { results: any[], expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; 

export function handleParticipantEvents(io: Server, socket: Socket) {
  
  // Search for songs on YouTube
  socket.on("search_songs", async (data: { query: string }, callback) => {
    const { query } = data;
    if (!query) return;

    const normalizedQuery = query.toLowerCase().trim();

    // Check cache
    const cached = searchCache.get(normalizedQuery);
    if (cached && cached.expires > Date.now()) {
      console.log(`Cache Hit for: "${normalizedQuery}"`);
      return callback({ success: true, results: cached.results });
    }

    try {
      const refinedQuery = `${query} official audio`;
      console.log(`Searching YouTube via yt-search for: "${refinedQuery}"`);
      const r = await ytsort(refinedQuery);
      
      const tracks = r.videos.slice(0, 15).map((item: any) => ({
        id: item.videoId,
        youtubeId: item.videoId,
        title: item.title,
        thumbnail: item.thumbnail || item.image,
        duration: item.duration.timestamp,
        author: item.author?.name
      }));

      // Update cache
      searchCache.set(normalizedQuery, { 
        results: tracks, 
        expires: Date.now() + CACHE_TTL 
      });

      console.log(`Found ${tracks.length} videos via yt-search for "${query}"`);

      if (tracks.length === 0) {
        return callback({ success: false, error: "No results found on YouTube" });
      }

      callback({ success: true, results: tracks });
    } catch (err) {
      console.error("Search error details:", err);
      callback({ success: false, error: "YouTube search is currently unavailable" });
    }
  });

  // Get fast search suggestions (YouTube Autocomplete)
  socket.on("get_search_suggestions", async (data: { query: string }, callback) => {
    const { query } = data;
    if (!query || query.length < 2) return;

    try {
      const url = `http://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      const text = await response.text();
      
      // YouTube returns a weird JSON-ish format: window.google.ac.h(["query",[["suggestion1",0],["suggestion2",0],...]])
      // But with client=youtube it's usually: ["query",["suggestion1","suggestion2",...]]
      const json = JSON.parse(text.replace(/^[^(]*\(|\)[^)]*$/g, ''));
      const rawSuggestions = json[1] || [];
      const suggestions = rawSuggestions.map((item: any) => Array.isArray(item) ? item[0] : item);
      
      callback({ success: true, suggestions });
    } catch (err) {
      callback({ success: false, suggestions: [] });
    }
  });

  // Submit song request
  socket.on("submit_song", async (data: { roomId: string; youtubeId: string; title: string; author: string; userId: string }, callback) => {
    const { roomId, youtubeId, title, author, userId } = data;

    if (!roomId || !youtubeId || !title || !userId) {
      if (callback) callback({ success: false, error: "Missing fields" });
      return;
    }

    try {
      // 2. Insert into DB
      const result = await sql`
        INSERT INTO songs (room_id, youtube_id, title, author, submitted_by, status)
        VALUES (${roomId}, ${youtubeId}, ${title}, ${author || ""}, ${userId}, 'pending')
        RETURNING id, youtube_id as "youtubeId", title, author, status, submitted_by as "submittedBy", created_at as "createdAt"
      `;

      const newSong = result[0];
      console.log(`[QUEUE] New song submitted for room ${roomId}: ${newSong.title}`);

      // 3. Emit only to Admins in this room
      io.to(`${roomId}:admin`).emit("new_pending_song", newSong);

      // 4. Acknowledge success to the user
      if (callback) callback({ success: true, message: "Request submitted" });
      
    } catch (err) {
      console.error(err);
      if (callback) callback({ success: false, error: "Database error" });
    }
  });

}
