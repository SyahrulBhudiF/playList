# Medium 06 — Unbounded Search Cache

> **Status:** Done — search cache uses TTL + max-size LRU with normalized keys and periodic expired-entry cleanup.

## Severity

Medium

## Current Problem

File: `server/src/socket/participantHandler.ts`

`searchCache` Map can grow forever.

## Target

Bound memory.

## Plan

- Replace plain Map with TTL + max-size LRU.
- Normalize query keys.
- Delete expired entries on access and periodically.
- Consider Redis cache if multiple server processes.

## Done Criteria

- Cache has max size.
- Entries expire.
- Memory cannot grow unbounded from unique queries.
