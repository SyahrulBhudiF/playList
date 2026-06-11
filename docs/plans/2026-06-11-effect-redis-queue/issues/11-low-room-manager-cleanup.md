# Low 11 — roomManager Cleanup

> **Status:** Done — roomManager is non-authoritative for queues and now prunes inactive rooms on TTL.

## Severity

Low

## Current Problem

File: `server/src/state/roomManager.ts`

In-memory room state can live forever.

## Target

Bound memory and make `roomManager` non-authoritative.

## Plan

- Add TTL/last-access cleanup.
- Remove old rooms with no sockets/controllers.
- Prefer Redis as live authority.

## Done Criteria

- Old inactive rooms are cleaned.
- Memory cannot grow forever from room IDs.
