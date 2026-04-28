import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:3001";
const ROOM_ID = "test-hackathon-room";

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  console.log("Starting test flow...\n");

  // Create sockets
  const eo = io(SERVER_URL);
  const admin = io(SERVER_URL);
  const p1 = io(SERVER_URL);
  const p2 = io(SERVER_URL);

  // 1. Join logic
  eo.emit("join_room", { roomId: ROOM_ID, role: "eo" });
  admin.emit("join_room", { roomId: ROOM_ID, role: "admin" });
  p1.emit("join_room", { roomId: ROOM_ID, role: "participant" });
  p2.emit("join_room", { roomId: ROOM_ID, role: "participant" });

  admin.on("new_pending_song", (song) => {
    console.log("[Admin] Received pending song:", song.title, `(${song.id})`);
    
    // Automatically approve it after 500ms
    setTimeout(() => {
      admin.emit("approve_song", { roomId: ROOM_ID, songId: song.id }, (res: any) => {
        console.log("[Admin] Approved song:", res);
      });
    }, 500);
  });

  admin.on("song_approved", (song) => {
    console.log("[Event] Song approved broadcasted:", song.title);
  });

  eo.on("now_playing_updated", (track) => {
    console.log("[EO/All] Now playing updated:", track ? track.title : "None (Queue Empty)");
  });

  await sleep(1000); // give time to connect

  console.log("--- SUBMITTING SONGS ---");
  // Participant 1 submits
  console.log("P1 submitting song 1...");
  p1.emit("submit_song", { roomId: ROOM_ID, youtubeId: "dQw4w9WgXcQ", title: "Never Gonna Give You Up", userId: "user_p1" }, (res: any) => {
    console.log("[P1] Submit Result:", res);
  });

  // Participant 1 tries submitting AGAIN right away (should fail because one is pending)
  console.log("P1 submitting song 2 rapidly...");
  p1.emit("submit_song", { roomId: ROOM_ID, youtubeId: "abc", title: "Should Fail", userId: "user_p1" }, (res: any) => {
    console.log("[P1] Spam Result:", res);
  });

  // Participant 2 submits
  console.log("P2 submitting song 3...");
  p2.emit("submit_song", { roomId: ROOM_ID, youtubeId: "L_jWHffIx5E", title: "All Star", userId: "user_p2" }, (res: any) => {
    console.log("[P2] Submit Result:", res);
  });

  
  await sleep(2000); // give time for admin to auto-approve above
  
  console.log("\n--- EO REQUESTS NEXT TRACK ---");
  eo.emit("eo_track_ended", { roomId: ROOM_ID }, (res: any) => {
    console.log("[EO] Next track response:", res.nextTrack ? res.nextTrack.title : "None");
  });

  await sleep(1000);

  console.log("\n--- EO REQUESTS NEXT TRACK AGAIN ---");
  eo.emit("eo_track_ended", { roomId: ROOM_ID }, (res: any) => {
    console.log("[EO] Next track response:", res.nextTrack ? res.nextTrack.title : "None");
  });

  await sleep(1000);

  console.log("\n--- EO REQUESTS NEXT TRACK (EMPTY QUEUE) ---");
  eo.emit("eo_track_ended", { roomId: ROOM_ID }, (res: any) => {
    console.log("[EO] Next track response:", res.nextTrack ? res.nextTrack.title : "None");
  });

  await sleep(1000);

  console.log("\n✅ Test flow finished.");
  process.exit(0);
}

runTest();
