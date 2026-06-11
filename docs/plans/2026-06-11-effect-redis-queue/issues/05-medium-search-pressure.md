# Medium 05 — Participant Search Too Aggressive

> **Status:** Done — client debounce/min length/stale response guard + server cache-before-rate-limit and per-socket throttling implemented.

## Severity

Medium

## Current Problem

Files:

- `client/src/features/participant/hooks/useParticipant.ts`
- `server/src/socket/participantHandler.ts`

Participant search can trigger heavy YouTube searches too often.

## Target

Reduce external/API/CPU pressure.

## Plan

- Client debounce search input.
- Minimum query length.
- Cancel/ignore stale responses.
- Server-side rate limit per socket/room/IP-ish token.
- Return cached result when possible.

## Done Criteria

- Typing fast does not create one server search per keypress.
- Stale response cannot overwrite newer results.
- Abuse cannot spam unlimited searches.
