# Medium 09 — Duplicate Next-Track Triggers

## Severity

Medium

## Current Problem

File: `client/src/features/admin/hooks/useAdminDashboard.ts`

Possible duplicate calls to next track / track ended can happen from UI/player events.

## Target

Client should avoid duplicate emits, server must still be idempotent.

## Plan

- Client in-flight guard for next-track/track-ended.
- Include idempotency key per track-ended action.
- Redis atomic transition ignores duplicate key within TTL.
- Server remains source of safety.

## Done Criteria

- Double click does not emit duplicate active transition.
- Duplicate network delivery does not advance two songs.
