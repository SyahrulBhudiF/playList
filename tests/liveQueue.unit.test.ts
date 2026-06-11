import { Effect } from "effect";
import { describe, expect, it } from "@effect/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";

type RedisClient = typeof import("../server/src/lib/redis")["redis"];
type LiveQueue = typeof import("../server/src/services/liveQueue/index");

let redis: RedisClient;
let approveSong: LiveQueue["approveSong"];
let submitSong: LiveQueue["submitSong"];
let deleteSong: LiveQueue["deleteSong"];
let getQueuePage: LiveQueue["getQueuePage"];
let previousTrack: LiveQueue["previousTrack"];
let transitionToNextTrack: LiveQueue["transitionToNextTrack"];

const touchedRooms = new Set<string>();
const touchedSongs = new Set<string>();

const roomKeys = (roomId: string) => [
  `room:${roomId}:queue:pending`,
  `room:${roomId}:queue:approved`,
  `room:${roomId}:queue:done`,
  `room:${roomId}:nowPlaying`,
  `room:${roomId}:version`,
];

const touch = (roomId: string, ...songIds: string[]) => {
  touchedRooms.add(roomId);
  songIds.forEach((id) => touchedSongs.add(id));
};

const seedRoom = (roomId: string) =>
  Effect.promise(async () => {
    touchedRooms.add(roomId);
    await redis.set(`room:${roomId}:version`, "1");
  });

beforeAll(async () => {
  process.env.REDIS_URL ??= "redis://:REDIS@localhost:6104";
  process.env.DATABASE_URL ??= "postgres://unused";

  ({ redis } = await import("../server/src/lib/redis"));
  ({ approveSong, deleteSong, getQueuePage, previousTrack, submitSong, transitionToNextTrack } = await import("../server/src/services/liveQueue/index"));
  await redis.ping();
});

afterEach(async () => {
  const keys = [
    ...[...touchedRooms].flatMap(roomKeys),
    ...[...touchedSongs].map((id) => `song:${id}`),
  ];

  await redis.del("db-events:test", "db-events:test:dlq");
  if (keys.length > 0) await redis.del(...keys);
  touchedRooms.clear();
  touchedSongs.clear();
});

afterAll(async () => {
  await redis.quit();
});

describe("live queue unit", () => {
  it.effect("submits then approves a pending song in Redis", () =>
    Effect.gen(function* () {
      const roomId = `unit-${crypto.randomUUID()}`;
      const songId = crypto.randomUUID();
      touch(roomId, songId);
      yield* seedRoom(roomId);

      const submitted = yield* Effect.promise(() =>
        submitSong(roomId, {
          id: songId,
          youtubeId: "yt-1",
          title: "Song 1",
          author: "Artist",
          submittedBy: "user-1",
          createdAt: new Date().toISOString(),
        }),
      );

      expect(submitted.status).toBe("pending");
      expect(yield* Effect.promise(() => redis.lrange(`room:${roomId}:queue:pending`, 0, -1))).toEqual([songId]);

      const approved = yield* Effect.promise(() => approveSong(roomId, songId));

      expect(approved.ok).toBe(true);
      if (approved.ok) expect(approved.song.status).toBe("approved");
      expect(yield* Effect.promise(() => redis.lrange(`room:${roomId}:queue:pending`, 0, -1))).toEqual([]);
      expect(yield* Effect.promise(() => redis.lrange(`room:${roomId}:queue:approved`, 0, -1))).toEqual([songId]);
    }),
  );

  it.effect("rejects approving a missing song", () =>
    Effect.gen(function* () {
      const roomId = `unit-${crypto.randomUUID()}`;
      const songId = crypto.randomUUID();
      touch(roomId, songId);
      yield* seedRoom(roomId);

      const result = yield* Effect.promise(() => approveSong(roomId, songId));
      expect(result).toEqual({ ok: false, error: "missing_song" });
    }),
  );

  it.effect("rejects approving a non-pending song", () =>
    Effect.gen(function* () {
      const roomId = `unit-${crypto.randomUUID()}`;
      const songId = crypto.randomUUID();
      touch(roomId, songId);
      yield* seedRoom(roomId);

      yield* Effect.promise(() =>
        redis.set(
          `song:${songId}`,
          JSON.stringify({ id: songId, youtubeId: "yt-1", title: "Song 1", status: "approved" }),
        ),
      );

      const result = yield* Effect.promise(() => approveSong(roomId, songId));
      expect(result).toEqual({ ok: false, error: "not_pending" });
    }),
  );

  it.effect("rejects deleting a missing song", () =>
    Effect.gen(function* () {
      const roomId = `unit-${crypto.randomUUID()}`;
      const songId = crypto.randomUUID();
      touch(roomId, songId);
      yield* seedRoom(roomId);

      const result = yield* Effect.promise(() => deleteSong(roomId, songId));
      expect(result).toEqual({ ok: false, error: "missing_song" });
    }),
  );

  it.effect("rejects previous track when history is empty", () =>
    Effect.gen(function* () {
      const roomId = `unit-${crypto.randomUUID()}`;
      touchedRooms.add(roomId);
      yield* seedRoom(roomId);

      const result = yield* Effect.promise(() => previousTrack(roomId));
      expect(result).toEqual({ ok: false, error: "no_previous_track" });
    }),
  );

  it.effect("deletes a song from live queues", () =>
    Effect.gen(function* () {
      const roomId = `unit-${crypto.randomUUID()}`;
      const pendingId = crypto.randomUUID();
      const approvedId = crypto.randomUUID();
      touch(roomId, pendingId, approvedId);
      yield* seedRoom(roomId);

      yield* Effect.promise(() =>
        redis.mset(
          `song:${pendingId}`,
          JSON.stringify({ id: pendingId, youtubeId: "yt-pending", title: "Pending", status: "pending" }),
          `song:${approvedId}`,
          JSON.stringify({ id: approvedId, youtubeId: "yt-approved", title: "Approved", status: "approved" }),
        ),
      );
      yield* Effect.promise(() => redis.rpush(`room:${roomId}:queue:pending`, pendingId));
      yield* Effect.promise(() => redis.rpush(`room:${roomId}:queue:approved`, approvedId));

      const result = yield* Effect.promise(() => deleteSong(roomId, pendingId));

      expect(result.ok).toBe(true);
      expect(yield* Effect.promise(() => redis.get(`song:${pendingId}`))).toBeNull();
      expect(yield* Effect.promise(() => redis.lrange(`room:${roomId}:queue:pending`, 0, -1))).toEqual([]);
      expect(yield* Effect.promise(() => redis.lrange(`room:${roomId}:queue:approved`, 0, -1))).toEqual([approvedId]);
    }),
  );

  it.effect("pages approved queue without loading the full list", () =>
    Effect.gen(function* () {
      const roomId = `unit-${crypto.randomUUID()}`;
      const ids = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()];
      touch(roomId, ...ids);
      yield* seedRoom(roomId);

      yield* Effect.promise(() =>
        redis.mset(
          ...ids.flatMap((id, index) => [
            `song:${id}`,
            JSON.stringify({ id, youtubeId: `yt-${index}`, title: `Song ${index}`, status: "approved" }),
          ]),
        ),
      );
      yield* Effect.promise(() => redis.rpush(`room:${roomId}:queue:approved`, ...ids));

      const firstPage = yield* Effect.promise(() => getQueuePage(roomId, "approved", 0, 2));
      const secondPage = yield* Effect.promise(() => getQueuePage(roomId, "approved", firstPage.nextCursor ?? 0, 2));

      expect(firstPage.items.map((song) => song.id)).toEqual(ids.slice(0, 2));
      expect(firstPage.nextCursor).toBe(2);
      expect(firstPage.total).toBe(3);
      expect(secondPage.items.map((song) => song.id)).toEqual([ids[2]]);
      expect(secondPage.nextCursor).toBeNull();
    }),
  );

  it.effect("transitions to the next approved song atomically", () =>
    Effect.gen(function* () {
      const roomId = `unit-${crypto.randomUUID()}`;
      const currentId = crypto.randomUUID();
      const nextId = crypto.randomUUID();
      const upNextId = crypto.randomUUID();
      touch(roomId, currentId, nextId, upNextId);
      yield* seedRoom(roomId);

      yield* Effect.promise(() =>
        redis.mset(
          `song:${currentId}`,
          JSON.stringify({ id: currentId, youtubeId: "yt-current", title: "Current", status: "playing" }),
          `song:${nextId}`,
          JSON.stringify({ id: nextId, youtubeId: "yt-next", title: "Next", status: "approved" }),
          `song:${upNextId}`,
          JSON.stringify({ id: upNextId, youtubeId: "yt-up-next", title: "Up Next", status: "approved" }),
        ),
      );
      yield* Effect.promise(() => redis.set(`room:${roomId}:nowPlaying`, currentId));
      yield* Effect.promise(() => redis.rpush(`room:${roomId}:queue:approved`, nextId, upNextId));

      const result = yield* Effect.promise(() => transitionToNextTrack(roomId, "transition-1"));

      expect(result.oldTrackId).toBe(currentId);
      expect(result.nextTrack?.id).toBe(nextId);
      expect(result.upNext?.id).toBe(upNextId);
      expect(yield* Effect.promise(() => redis.get(`room:${roomId}:nowPlaying`))).toBe(nextId);
      expect(yield* Effect.promise(() => redis.lrange(`room:${roomId}:queue:approved`, 0, -1))).toEqual([upNextId]);

      const oldSong = JSON.parse((yield* Effect.promise(() => redis.get(`song:${currentId}`)))!);
      const nextSong = JSON.parse((yield* Effect.promise(() => redis.get(`song:${nextId}`)))!);
      expect(oldSong.status).toBe("done");
      expect(nextSong.status).toBe("playing");
    }),
  );
});
