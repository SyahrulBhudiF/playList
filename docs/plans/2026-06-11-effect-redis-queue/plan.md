# Effect Redis Live Queue Migration Plan

> **Status:** Implemented and validated on 2026-06-11. See [`CONTEXT.md`](./CONTEXT.md) for change summary, problem, fix, and validation notes.

> **IMPORTANT**: Use plan-execute skill to implement this plan task-by-task.

**Goal:** Move live queue/playback to Redis with Effect v4 beta workers so socket actions do not wait for Postgres, while fixing existing queue performance/concurrency issues.
**Architecture:** Redis is live runtime state + atomic queue mutation. Effect v4 beta is worker/runtime/concurrency/retry/shutdown layer. Postgres is async persistence/history/recovery target. Queue payloads become paginated/windowed + delta socket events, not full broadcasts.
**Tech Stack:** Bun, Socket.IO, Redis/ioredis, Postgres/postgres-js, Effect `effect@4.0.0-beta.79`, Vite+ monorepo.

---

## Must Not Forget

- Root `.env` only. No `server/.env`, no `client/.env`.
- Do not create `server/src/env.ts`.
- Server scripts load root env via `bun --env-file=../.env`.
- Canonical dev command: `vp run dev`.
- Verify server with: `vp run --filter server check`.
- Live reads after migration must use Redis, not Postgres, otherwise stale UI.
- Redis atomic mutation still required. Effect concurrency does not protect across multiple server processes.

---

## Issue Index

### Critical

1. [Critical 01 — `eo_track_ended` DB-bound, non-atomic, race-prone](./issues/01-critical-eo-track-ended.md)
2. [Critical 02 — full queue rebroadcasts after tiny mutations](./issues/02-critical-full-queue-broadcasts.md)
3. [Critical 03 — async DB persistence needs durable queue, not in-memory Effect queue](./issues/03-critical-durable-persistence-worker.md)
4. [Critical 04 — live reads split between Redis/memory/Postgres](./issues/04-critical-live-state-source.md)

### Medium

5. [Medium 05 — participant search too aggressive](./issues/05-medium-search-pressure.md)
6. [Medium 06 — unbounded search cache](./issues/06-medium-search-cache-ttl.md)
7. [Medium 07 — suggestions no cache/rate-limit](./issues/07-medium-suggestions-cache-rate-limit.md)
8. [Medium 08 — playback sync every second](./issues/08-medium-playback-sync.md)
9. [Medium 09 — duplicate next-track triggers](./issues/09-medium-duplicate-next-track.md)
10. [Medium 10 — room join always hits DB / rewrites Redis](./issues/10-medium-join-room-db-hotpath.md)

### Low

11. [Low 11 — roomManager never cleans old rooms](./issues/11-low-room-manager-cleanup.md)
12. [Low 12 — resize state updates too frequent](./issues/12-low-resize-state.md)
13. [Low 13 — React cache/version hygiene](./issues/13-low-react-cache-hygiene.md)

---

## Target Architecture

```txt
Socket event
  ↓
Redis Lua / atomic command
  - mutate live queue
  - enqueue durable DB persistence job
  ↓
Socket callback + delta event immediately
  ↓
Effect worker pool
  - read durable jobs
  - process with global concurrency
  - preserve per-room ordering
  - retry/backoff/timeout
  - write Postgres
  - ack / DLQ
```

### Source of Truth Split

```txt
Redis      = live queue, nowPlaying, playback, room hot state
Postgres   = history, recovery, audit, long-term records
Effect     = fibers, worker pool, retries, shutdown, concurrency limits
Socket.IO  = realtime deltas/windows
```

### Redis Keys

```txt
room:{roomId}:queue:pending       LIST/ZSET song IDs
room:{roomId}:queue:approved      LIST/ZSET song IDs
room:{roomId}:nowPlaying          song ID or JSON
room:{roomId}:playback            HASH currentTime/duration/isPlaying/updatedAt
song:{songId}                     HASH/JSON song payload
room:{roomId}:version             monotonic queue version
```

### Durable Queue Choice

Preferred:

```txt
Effect v4 DurableQueue/PersistedQueue Redis
```

Fallback if v4 unstable API blocks implementation:

```txt
Redis Streams wrapped in Effect.Service
```

Important: Effect `Queue` alone is in-memory and not acceptable for DB persistence jobs.

---

## Priority Order

1. [x] Install/spike Effect v4 beta durable queue API.
2. [x] Define event schema + idempotency model.
3. [x] Build Effect worker runtime with real concurrency.
4. [x] Move live queue mutations to Redis atomic operations.
5. [x] Convert `eo_track_ended` to Redis fast path.
6. [x] Replace full queue broadcasts with snapshots/pages/deltas.
7. [x] Convert join/initial reads to Redis queue windows.
8. [x] Add Postgres recovery/rebuild path.
9. [x] Fix medium performance issues in migrated queue/playback scope.
10. [x] Clean low-priority hygiene in migrated queue/playback scope.

---

## Worker Concurrency Model

Use real concurrency:

```txt
global worker concurrency: 8
per-room ordering: 1
batch size: 20
DB pool: 10
```

Rules:

- Events for same `roomId` must process sequentially.
- Events for different rooms can process concurrently.
- Every DB event has `eventId` and idempotent write behavior.
- Poison jobs move to DLQ after max retry.

---

## Event Types

```txt
room_created
song_submitted
song_approved
song_deleted
song_updated
track_transitioned
track_previous
playback_synced_optional
```

Base event shape:

```ts
type DbEvent = {
  eventId: string
  type: string
  roomId: string
  songId?: string
  payload: unknown
  createdAt: number
}
```

---

## Socket Payload Strategy

Initial join:

```txt
admin       -> nowPlaying + pending first 20 + approved first 20
participant -> nowPlaying + approved first 10
EO          -> nowPlaying + approved first 10 + upNext
```

Mutations:

```txt
song_added
song_removed
song_updated
song_approved
track_transitioned
queue_window_invalidated optional
```

Pagination:

```txt
get_queue_page({ roomId, status, cursor, limit })
```

Avoid default `queue_updated` with full queue.

---

## Validation Commands

```bash
vp run --filter server check
vp run --filter client build
vp run dev
```

Manual checks:

- Two EO `eo_track_ended` calls close together do not pick same song.
- Admin approve returns before Postgres write wait.
- Refresh/join shows Redis live state.
- Kill/restart worker: pending persistence jobs resume.
- Kill/restart server: Redis live state survives with AOF.
- Postgres down: live queue still works; worker retries; DLQ only after policy.

---

## Rollout Plan

### Phase 0 — dependency/API spike

- [x] Add `effect@4.0.0-beta.79` to `server`.
- [x] Verify imports for unstable DurableQueue/PersistedQueue Redis.
- [x] Decide implementation path: Redis Streams wrapper because DurableQueue/PersistedQueue Redis imports were unavailable.

### Phase 1 — durable persistence worker

- [x] Add event schema.
- [x] Add idempotency table/strategy.
- [x] Add Effect worker with per-room serialization and concurrent room processing.
- [x] Add retry/backoff/DLQ.

### Phase 2 — Redis live queue service

- [x] Add Redis key helpers.
- [x] Add atomic submit/approve/delete/track-transition functions.
- [x] Use Lua for multi-key mutations.
- [x] Emit durable DB events inside same Redis mutation where possible.

### Phase 3 — `eo_track_ended` fast path

- [x] Stop DB read/update chain during socket callback.
- [x] Use Redis atomic transition.
- [x] Return next/upNext from Redis.
- [x] Enqueue DB persistence event.

### Phase 4 — queue windows/deltas

- [x] Replace full `queue_updated` emits on normal mutation paths.
- [x] Add initial snapshots/windows by role.
- [x] Add `get_queue_page`.
- [x] Update client stores/hooks.

### Phase 5 — join/recovery

- [x] Make `join_room` use Redis hot state.
- [x] Add lazy Redis rebuild from Postgres if Redis keys missing.
- [x] Keep Postgres as recovery source only.

### Phase 6 — medium/low fixes

- [x] Search cache TTL and rate-limit safeguards exist in participant handler.
- [x] Suggestion endpoint has guarded short-query behavior.
- [x] Duplicate next-track triggers fixed with client idempotency keys + Redis cached transition result.
- [x] Join DB hot path fixed for Redis-hot rooms.
- [x] Full queue rebroadcasts removed from migrated queue mutations.

Non-queue UI hygiene items can be handled separately if desired:

- [ ] Optional deeper search cancellation/LRU.
- [ ] Optional playback sync throttle/delta refinement.
- [ ] Optional roomManager TTL cleanup.

---

## Done Criteria

- [x] Socket mutation callbacks no longer wait for Postgres writes in hot queue path.
- [x] `eo_track_ended` uses one Redis atomic transition.
- [x] DB persistence happens through Effect worker with durable Redis Stream backing.
- [x] Worker processes events with per-room ordering and parallel room batches.
- [x] Full queue broadcasts removed from normal mutation path.
- [x] Initial queue payloads are limited Redis windows.
- [x] Pagination exists for more queue data.
- [x] Server typecheck passes.
- [x] Client build passes.
- [x] Redis live queue unit/e2e tests pass.
- [x] Socket.IO e2e tests pass for join/submit/approve/transition/idempotency/EO rejection.

Manual operational scenarios to run in deployed/staging infra:

- [ ] Kill/restart worker: pending persistence jobs resume.
- [ ] Kill/restart server: Redis live state survives with configured Redis persistence.
- [ ] Postgres down: live queue still works; worker retries; DLQ only after policy.

---

1. [x] Read all issue files before coding.
2. [x] Execute Phase 0 spike first.
3. [x] Pick DurableQueue Redis if usable; else Redis Streams wrapped in Effect.
4. [x] Implement worker before changing socket mutations.
5. [x] Migrate `eo_track_ended` before other queue actions.
6. [x] Replace full queue broadcasts after live Redis model exists.
7. [x] Run validation commands and automated race/idempotency checks.
