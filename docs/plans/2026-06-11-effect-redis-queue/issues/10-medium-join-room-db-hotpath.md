# Medium 10 — Join Room DB Hot Path

## Severity

Medium

## Current Problem

File: `server/src/socket/connectionHandler.ts`

`join_room` always queries Postgres and rewrites Redis passkey cache. Then it queries Postgres again for nowPlaying and full queue.

## Target

Normal join should use Redis hot state.

## Plan

- Resolve room passkey from Redis first.
- Only fallback to Postgres if missing.
- Read nowPlaying/playback/queue windows from Redis.
- Lazy rebuild room Redis state from Postgres if missing.
- Avoid full queue send.

## Done Criteria

- Existing room join usually performs zero Postgres queue reads.
- Queue payload limited by role.
- Missing Redis state recovers from Postgres.
