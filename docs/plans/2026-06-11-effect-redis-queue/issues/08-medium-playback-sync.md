# Medium 08 — Playback Sync Every Second

> **Status:** Done — client keeps 1s local UI polling but only broadcasts on state/drift thresholds; server stores latest playback in Redis for joiners.

## Severity

Medium

## Current Problem

File: `client/src/features/admin/components/PlaybackController.tsx`

Playback sync every second can broadcast lots of events.

## Target

Reduce socket noise while keeping participant playback acceptable.

## Plan

- Emit only when playing state changes, seek occurs, or drift threshold passes.
- Store latest playback state in Redis hash.
- Joiners receive latest Redis playback state.
- Consider 3–5 second heartbeat instead of 1 second.

## Done Criteria

- Normal playback emits fewer sync events.
- New joiners sync correctly.
- Seek/pause/play still immediate.
