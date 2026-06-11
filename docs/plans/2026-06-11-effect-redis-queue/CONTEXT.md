# Effect Redis Live Queue Migration — Context

## Problem

Live queue/playback socket events used Postgres as part of the realtime path. The worst path was `eo_track_ended`: it read and updated songs in Postgres during the socket callback, then rebuilt/broadcast queues. Under concurrency or slow DB, this caused latency, duplicate/incorrect track advancement risk, and large full-queue broadcasts for tiny state changes.

The app also had split live state:

- Redis for room/passkey cache.
- `roomManager` in memory for some playback/queue state.
- Postgres for queue reads/writes.

That made join/refresh behavior stale-prone and made multi-server correctness weak.

## Fix

Redis is now the live queue authority. Postgres is async persistence/history/recovery. Socket hot paths mutate/read Redis and enqueue durable DB events to Redis Streams. An Effect worker consumes those events and writes Postgres with idempotency.

## Architecture Now

```txt
Socket event
  ↓
Redis command / Lua script
  - mutate live queue atomically
  - enqueue DB event to Redis Stream
  ↓
Socket callback + delta event
  ↓
Effect worker
  - read stream
  - per-room ordered processing
  - retry / DLQ
  - idempotent Postgres write
```

## Key Files

### Live Redis queue

- `server/src/services/liveQueue/index.ts`
- `server/src/services/liveQueue/scripts/approve.lua`
- `server/src/services/liveQueue/scripts/delete.lua`
- `server/src/services/liveQueue/scripts/previous.lua`
- `server/src/services/liveQueue/scripts/transition.lua`
- `server/src/services/liveQueue/scripts/update.lua`

Redis keys:

```txt
room:{roomId}:queue:pending
room:{roomId}:queue:approved
room:{roomId}:queue:done
room:{roomId}:nowPlaying
room:{roomId}:version
room:{roomId}:transition:{idempotencyKey}
song:{songId}
db-events
db-events:dlq
```

### Durable persistence worker

- `server/src/workers/types.ts`
- `server/src/workers/dbEvents.ts`
- `server/src/workers/dbEventStream.ts`
- `server/src/workers/dbEventHandlers.ts`
- `server/src/workers/dbEventStore.ts`
- `server/index.ts` starts `startDbPersistenceWorker()`.

DB idempotency:

- `server/src/db/schema.ts`
- table: `db_event_log`

### Socket migration

- `server/src/socket/eoHandler.ts`
  - `eo_track_ended` uses Redis atomic transition.
  - `previous_track` uses Redis atomic previous-track script.
- `server/src/socket/adminHandler.ts`
  - approve/delete/edit/admin-add use Redis live queue + stream events.
- `server/src/socket/participantHandler.ts`
  - submit uses Redis live queue + stream event.
  - pending-count limits read Redis.
- `server/src/socket/connectionHandler.ts`
  - `join_room` reads Redis passkey first.
  - initial queue state uses Redis windows.
  - `get_queue_page` added.

### Client changes

- `client/src/features/admin/hooks/useAdminDashboard.ts`
  - handles deltas.
  - sends client idempotency keys for `eo_track_ended`.
- `client/src/features/participant/hooks/useParticipant.ts`
- `client/src/features/participant/hooks/useMusicRoom.ts`
- `client/src/shared/lib/socket.ts`

## Important Behavior Changes

### No Postgres wait on hot queue callbacks

These now return after Redis work, not after Postgres persistence:

- participant submit
- admin approve
- admin add
- admin delete
- admin edit
- EO next track
- EO previous track

### Atomic Redis mutations

Multi-key queue mutations use Lua where race-prone:

- approve pending → approved
- delete from all live lists
- update song payload + event
- transition current → done and approved → playing
- previous done → playing and current → approved

### Queue deltas instead of full rebroadcasts

Normal mutation paths emit small delta events:

- `new_pending_song`
- `song_approved`
- `song_deleted`
- `song_updated`
- `song_removed_from_queue`
- `track_transitioned`
- `now_playing_updated`

`queue_updated` remains for initial window/snapshot compatibility, not mutation rebroadcasts.

### Pagination

Socket event:

```ts
get_queue_page({ roomId, status, cursor, limit })
```

Response:

```ts
{ success: true, items, nextCursor, total }
```

## Tests

Tests use Vitest + `@effect/vitest` and real Redis.

- `tests/liveQueue.unit.test.ts`
  - approve positive/negative
  - delete positive/negative
  - previous negative
  - pagination
  - atomic transition
- `tests/liveQueue.e2e.test.ts`
  - submit → approve → transition → duplicate idempotency → previous
  - empty approved queue
- `tests/socketLiveQueue.e2e.test.ts`
  - real Socket.IO server/client flow
  - Redis-backed join
  - wrong passkey negative
  - submit/approve/transition duplicate suppression
  - second EO rejection

Run:

```bash
bun --env-file=.env run test
```

## Validation Done

```bash
vp run --filter server check
vp run --filter client build
bun --env-file=.env run test
```

Result:

- server typecheck passed
- client build passed
- 3 test files passed
- 12 tests passed

## Known Notes

- Effect v4 beta Redis DurableQueue/PersistedQueue APIs were not available/importable in the installed package, so durable persistence uses Redis Streams wrapped in Effect.
- Redis Lua scripts intentionally live as `.lua` files, not inline TS strings.
- Root `.env` remains the env source. Server scripts use `bun --env-file=../.env`.
- `queue_updated` still exists for initial compatibility/window snapshot. Normal mutations use delta events.
- Postgres remains recovery/history. Redis is live authority once room state is hot.
