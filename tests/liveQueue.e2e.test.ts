import { Effect } from "effect";
import { describe, expect, it } from "@effect/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";

type RedisClient = typeof import("../server/src/lib/redis")["redis"];
type LiveQueue = typeof import("../server/src/services/liveQueue/index");

let redis: RedisClient;
let approveSong: LiveQueue["approveSong"];
let previousTrack: LiveQueue["previousTrack"];
let submitSong: LiveQueue["submitSong"];
let transitionToNextTrack: LiveQueue["transitionToNextTrack"];

const touchedRooms = new Set<string>();
const touchedSongs = new Set<string>();

const roomKeys = (roomId: string) => [
  `room:${roomId}:queue:pending`,
  `room:${roomId}:queue:approved`,
  `room:${roomId}:queue:done`,
  `room:${roomId}:nowPlaying`,
  `room:${roomId}:version`,
  `room:${roomId}:transition:first-ended`,
  `room:${roomId}:transition:duplicate-ended`,
  `room:${roomId}:transition:empty-ended`,
];

const remember = (roomId: string, ...songIds: string[]) => {
  touchedRooms.add(roomId);
  songIds.forEach((id) => touchedSongs.add(id));
};

const seedHotRoom = (roomId: string) =>
  Effect.promise(async () => {
    touchedRooms.add(roomId);
    await redis.set(`room:${roomId}:version`, "1");
  });

beforeAll(async () => {
  process.env.REDIS_URL ??= "redis://:REDIS@localhost:6104";
  process.env.DATABASE_URL ??= "postgres://unused";

  ({ redis } = await import("../server/src/lib/redis"));
  ({ approveSong, previousTrack, submitSong, transitionToNextTrack } = await import("../server/src/services/liveQueue/index"));
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

describe("live queue e2e", () => {
  it.effect("runs submit -> approve -> transition -> duplicate transition idempotency", () =>
    Effect.gen(function* () {
      const roomId = `e2e-${crypto.randomUUID()}`;
      const firstId = crypto.randomUUID();
      const secondId = crypto.randomUUID();
      remember(roomId, firstId, secondId);
      yield* seedHotRoom(roomId);

      yield* Effect.promise(() =>
        submitSong(roomId, {
          id: firstId,
          youtubeId: "yt-first",
          title: "First",
          author: "Artist A",
          submittedBy: "user-a",
          createdAt: new Date().toISOString(),
        }),
      );
      yield* Effect.promise(() =>
        submitSong(roomId, {
          id: secondId,
          youtubeId: "yt-second",
          title: "Second",
          author: "Artist B",
          submittedBy: "user-b",
          createdAt: new Date().toISOString(),
        }),
      );

      expect(yield* Effect.promise(() => redis.lrange(`room:${roomId}:queue:pending`, 0, -1))).toEqual([
        firstId,
        secondId,
      ]);

      expect(yield* Effect.promise(() => approveSong(roomId, firstId))).toMatchObject({ ok: true });
      expect(yield* Effect.promise(() => approveSong(roomId, secondId))).toMatchObject({ ok: true });
      expect(yield* Effect.promise(() => redis.lrange(`room:${roomId}:queue:approved`, 0, -1))).toEqual([
        firstId,
        secondId,
      ]);

      const firstTransition = yield* Effect.promise(() => transitionToNextTrack(roomId, "first-ended"));
      expect(firstTransition.nextTrack?.id).toBe(firstId);
      expect(firstTransition.upNext?.id).toBe(secondId);
      expect(yield* Effect.promise(() => redis.get(`room:${roomId}:nowPlaying`))).toBe(firstId);

      const duplicateTransition = yield* Effect.promise(() => transitionToNextTrack(roomId, "first-ended"));
      expect(duplicateTransition).toEqual(firstTransition);
      expect(yield* Effect.promise(() => redis.get(`room:${roomId}:nowPlaying`))).toBe(firstId);
      expect(yield* Effect.promise(() => redis.lrange(`room:${roomId}:queue:approved`, 0, -1))).toEqual([secondId]);

      const secondTransition = yield* Effect.promise(() => transitionToNextTrack(roomId, "duplicate-ended"));
      expect(secondTransition.oldTrackId).toBe(firstId);
      expect(secondTransition.nextTrack?.id).toBe(secondId);
      expect(secondTransition.upNext).toBeNull();
      expect(yield* Effect.promise(() => redis.get(`room:${roomId}:nowPlaying`))).toBe(secondId);

      const previous = yield* Effect.promise(() => previousTrack(roomId));
      expect(previous.ok).toBe(true);
      if (previous.ok) {
        expect(previous.previousTrack.id).toBe(firstId);
        expect(previous.returnedTrack?.id).toBe(secondId);
      }
      expect(yield* Effect.promise(() => redis.get(`room:${roomId}:nowPlaying`))).toBe(firstId);
      expect(yield* Effect.promise(() => redis.lrange(`room:${roomId}:queue:approved`, 0, -1))).toEqual([secondId]);
    }),
  );

  it.effect("keeps restored current tracks at the front when walking backward", () =>
    Effect.gen(function* () {
      const roomId = `e2e-${crypto.randomUUID()}`;
      const ids = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()];
      remember(roomId, ...ids);
      yield* seedHotRoom(roomId);

      yield* Effect.promise(() =>
        redis.mset(
          ...ids.flatMap((id, index) => [
            `song:${id}`,
            JSON.stringify({ id, youtubeId: `yt-${index + 1}`, title: `Song ${index + 1}`, status: "approved" }),
          ]),
        ),
      );
      yield* Effect.promise(() => redis.rpush(`room:${roomId}:queue:approved`, ...ids));

      for (const index of ids.keys()) {
        const next = yield* Effect.promise(() => transitionToNextTrack(roomId, `next-${index}`));
        expect(next.nextTrack?.id).toBe(ids[index]);
      }

      for (let index = ids.length - 2; index >= 0; index--) {
        const previous = yield* Effect.promise(() => previousTrack(roomId));
        expect(previous.ok).toBe(true);
        if (previous.ok) expect(previous.previousTrack.id).toBe(ids[index]);
      }

      expect(yield* Effect.promise(() => redis.get(`room:${roomId}:nowPlaying`))).toBe(ids[0]);
      expect(yield* Effect.promise(() => redis.lrange(`room:${roomId}:queue:approved`, 0, -1))).toEqual(ids.slice(1));
    }),
  );

  it.effect("handles empty approved queue without selecting a track", () =>
    Effect.gen(function* () {
      const roomId = `e2e-${crypto.randomUUID()}`;
      const currentId = crypto.randomUUID();
      remember(roomId, currentId);
      yield* seedHotRoom(roomId);

      yield* Effect.promise(() =>
        redis.set(
          `song:${currentId}`,
          JSON.stringify({ id: currentId, youtubeId: "yt-current", title: "Current", status: "playing" }),
        ),
      );
      yield* Effect.promise(() => redis.set(`room:${roomId}:nowPlaying`, currentId));

      const result = yield* Effect.promise(() => transitionToNextTrack(roomId, "empty-ended"));

      expect(result.oldTrackId).toBe(currentId);
      expect(result.nextTrack).toBeNull();
      expect(result.upNext).toBeNull();
      expect(yield* Effect.promise(() => redis.get(`room:${roomId}:nowPlaying`))).toBeNull();
      expect(JSON.parse((yield* Effect.promise(() => redis.get(`song:${currentId}`)))!).status).toBe("done");
    }),
  );
});
