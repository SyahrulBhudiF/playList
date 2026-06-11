# Low 12 — Resize State Updates Too Frequent

> **Status:** Done — resize updates are requestAnimationFrame-throttled and React state only changes when breakpoint/scale actually changes.

## Severity

Low

## Current Problem

File: `client/src/main.tsx`

Resize listener may update React state too often.

## Target

Reduce render churn.

## Plan

- Use CSS media queries where possible.
- If JS needed, throttle/debounce resize.
- Only update state when breakpoint changes.

## Done Criteria

- Resize does not trigger excessive renders.
- Behavior unchanged visually.
