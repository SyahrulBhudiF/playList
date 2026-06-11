# Critical 04 — Live State Source Split

## Severity

Critical

## Current Problem

Current code reads live room/queue state from multiple places:

- Postgres in `join_room`
- Postgres in `eo_track_ended`
- memory `roomManager`
- Redis for passkeys/admin sessions only

After Redis live queue migration, mixed reads cause stale UI.

Example bad state:

```txt
approve uses Redis fast path
join_room reads Postgres before worker persisted approval
new user sees old queue
```

## Target

All live room state reads use Redis.

```txt
Queue / nowPlaying / playback = Redis
History / recovery / reports = Postgres
roomManager = optional local cache only, not authority
```

## Required Design

- Redis projection for room queue + nowPlaying.
- `join_room` reads Redis first.
- Lazy rebuild from Postgres if Redis room state missing.
- Postgres recovery command/path.
- Clear naming in code: `LiveQueueService`, `PersistenceWorker`, `RecoveryService`.

## Done Criteria

- No hot queue path reads Postgres during normal operation.
- Joining user sees live Redis state even if Postgres worker is behind.
- If Redis state missing, server rebuilds from Postgres.
- `roomManager` cannot override Redis canonical live state.
