# Critical 02 — Full Queue Rebroadcasts After Tiny Mutations

## Severity

Critical

## Current Problem

Files:

- `server/src/socket/adminHandler.ts`
- `server/src/socket/eoHandler.ts`
- `server/src/socket/connectionHandler.ts`

Current pattern:

```txt
one song changes
server refetches all pending/approved songs
server emits queue_updated with entire queue to every role
clients replace full queue
```

This gets expensive with many songs/users.

## Target

Use queue windows + delta events.

Initial join sends limited snapshots:

```txt
admin: pending first 20 + approved first 20
participant: approved first 10
EO: approved first 10 + upNext
```

Mutations emit deltas:

```txt
song_added
song_removed
song_updated
song_approved
track_transitioned
```

Pagination event:

```txt
get_queue_page({ roomId, status, cursor, limit })
```

## Required Design

- Redis queue window read helpers.
- Cursor-based page API.
- Role-specific snapshot payloads.
- Keep deprecated `queue_updated` only temporarily during migration, then remove. No compatibility wrapper long-term.

## Done Criteria

- Normal approve/delete/track-ended does not emit full queue.
- Client can load more via page event.
- Admin still sees pending + approved.
- Participant/EO never receive pending songs.
- Large queue mutation emits small payload.
