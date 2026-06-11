# Critical 01 — `eo_track_ended` DB-bound, non-atomic, race-prone

## Severity

Critical

## Current Problem

File: `server/src/socket/eoHandler.ts`

Current `eo_track_ended` flow does many awaited DB operations inside the socket callback:

1. select current playing songs
2. update playing songs to done
3. select next approved song
4. if empty, refetch whole queue
5. update next song to playing
6. select upcoming song
7. refetch whole queue
8. broadcast full queue

This is slow and race-prone. Two EO calls close together can observe overlapping state and claim/update wrong songs.

## Target

Use Redis as live queue state. `eo_track_ended` should perform one atomic Redis transition and return immediately.

```txt
oldNowPlaying = GET nowPlaying
next = LPOP approved queue
SET nowPlaying next
mark old done in Redis song payload
mark next playing in Redis song payload
enqueue DB event track_transitioned
return { nextTrack, upNext }
```

## Required Design

- Redis Lua script or equivalent atomic command sequence.
- Effect worker persists result to Postgres later.
- No Postgres call in hot `eo_track_ended` callback except recovery fallback when Redis missing.
- Idempotency key required for duplicate EO events.
- Per-room lock/order in worker.

## Socket Events

Emit:

```txt
track_transitioned { oldTrackId, nextTrack, upNext, queueVersion }
song_removed_from_queue { songId: nextTrack.id }
now_playing_updated nextTrack
```

Avoid full `queue_updated`.

## Done Criteria

- Double-click / duplicate EO end cannot play same song twice.
- Callback does not wait on Postgres.
- If queue empty, Redis sets nowPlaying null and emits empty state.
- DB eventually reflects old done + next playing.
- Server check passes.
