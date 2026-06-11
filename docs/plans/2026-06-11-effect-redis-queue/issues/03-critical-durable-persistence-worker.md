# Critical 03 — Durable Async DB Persistence Worker

## Severity

Critical

## Current Problem

If socket callbacks stop waiting for Postgres, DB writes need durable async processing.

Bad solution:

```ts
void sql`UPDATE ...`
callback({ success: true })
```

Problems:

- crash loses write
- DB down loses write
- no retry
- no ordering
- no observability

Effect `Queue` alone is also not enough because docs define it as in-memory.

## Target

Use Effect v4 beta for worker runtime and Redis-backed durable storage.

Preferred:

```txt
effect@4.0.0-beta.79 DurableQueue/PersistedQueue Redis
```

Fallback:

```txt
Redis Streams wrapped in Effect.Service
```

## Required Design

- Add `effect@4.0.0-beta.79` to server.
- Spike actual imports/API first.
- Worker pool with global concurrency 8.
- Per-room ordering = 1.
- Retry/backoff/timeout.
- DLQ after max attempts.
- Idempotent Postgres writes.
- Structured logs via `Effect.log`.

## Event Shape

```ts
type DbEvent = {
  eventId: string
  type: "room_created" | "song_submitted" | "song_approved" | "song_deleted" | "song_updated" | "track_transitioned" | "track_previous"
  roomId: string
  songId?: string
  payload: unknown
  createdAt: number
}
```

## Done Criteria

- Worker resumes pending jobs after process restart.
- DB down does not break live queue.
- Jobs retry and eventually persist.
- Poison job lands in DLQ with reason.
- Same event processed twice is safe.
