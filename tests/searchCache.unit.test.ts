import { Effect } from "effect";
import { describe, expect, it } from "@effect/vitest";
import { afterEach, vi } from "vitest";
import { normalizeSearchQuery, TtlLruCache } from "../server/src/socket/searchCache";

afterEach(() => {
  vi.useRealTimers();
});

describe("search cache unit", () => {
  it.effect("normalizes query keys", () =>
    Effect.sync(() => {
      expect(normalizeSearchQuery("  Daft   Punk  ")).toBe("daft punk");
    }),
  );

  it.effect("expires entries by ttl", () =>
    Effect.sync(() => {
      vi.useFakeTimers();
      const cache = new TtlLruCache<string>(1_000, 10);

      cache.set("a", "first");
      expect(cache.get("a")).toBe("first");

      vi.advanceTimersByTime(1_001);
      expect(cache.get("a")).toBeNull();
      expect(cache.size).toBe(0);
    }),
  );

  it.effect("evicts least recently used entries at max size", () =>
    Effect.sync(() => {
      const cache = new TtlLruCache<string>(60_000, 2);

      cache.set("a", "first");
      cache.set("b", "second");
      expect(cache.get("a")).toBe("first");
      cache.set("c", "third");

      expect(cache.get("b")).toBeNull();
      expect(cache.get("a")).toBe("first");
      expect(cache.get("c")).toBe("third");
      expect(cache.size).toBe(2);
    }),
  );
});
