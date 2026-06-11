# Medium 07 — Suggestions No Cache/Rate Limit

> **Status:** Done — suggestions use normalized TTL/LRU cache, short per-socket rate limit, and bounded result count.

## Severity

Medium

## Current Problem

`get_search_suggestions` can be requested repeatedly without cache/rate limit.

## Target

Suggestions should be cheap and abuse-resistant.

## Plan

- Add short TTL cache keyed by normalized prefix/query.
- Add per-socket rate limit.
- Return empty or cached fallback when limited.
- Keep suggestion limit small.

## Done Criteria

- Repeated same suggestion query uses cache.
- Fast repeated requests get limited.
- Server remains responsive under spam.
