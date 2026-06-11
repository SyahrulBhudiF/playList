# Low 13 — React Cache / Version Hygiene

> **Status:** Done — `client/package.json` pins exact matching `react`/`react-dom` versions (`19.2.7`). Recovery path remains documented here.

## Severity

Low

## Current Problem

Past issue:

```txt
react: 19.2.5
react-dom: 19.2.7
```

Fixed by exact pins, but stale Vite/Bun caches can reappear.

## Target

Avoid React mismatch confusion.

## Plan

- Keep exact React and React DOM versions.
- If mismatch appears, kill old dev servers and clear optimizer caches.
- Avoid caret ranges for React pair.

## Done Criteria

- `client/package.json` keeps exact matching versions.
- Documented recovery path remains known.
