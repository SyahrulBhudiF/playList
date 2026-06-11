import { Effect } from "effect";
import { describe, expect, it } from "@effect/vitest";
import { createActor } from "xstate";
import { useAdminQueueStore } from "../client/src/stores/adminQueueStore";
import { useRoomStore } from "../client/src/stores/roomStore";
import { participantFlowMachine } from "../client/src/machines/participantFlowMachine";
import { playbackMachine } from "../client/src/machines/playbackMachine";

const track = (id: string, title = id) => ({ id, youtubeId: `yt-${id}`, title, author: "artist" });
const pending = (id: string, title = id) => ({ ...track(id, title), status: "pending", submittedBy: "u1", createdAt: "now" });

describe("frontend state stores", () => {
  it.effect("room store applies queue deltas idempotently", () =>
    Effect.sync(() => {
      useRoomStore.getState().resetRoom();
      useRoomStore.getState().applyQueueSnapshot([pending("p1"), { ...pending("a1"), status: "approved" }]);
      useRoomStore.getState().applySongApproved(track("a2"));
      useRoomStore.getState().applySongApproved(track("a2"));
      useRoomStore.getState().applySongRemoved("a1");

      expect(useRoomStore.getState().queue.map((song) => song.id)).toEqual(["a2"]);
    }),
  );

  it.effect("room store applies playback sync", () =>
    Effect.sync(() => {
      useRoomStore.getState().resetRoom();
      useRoomStore.getState().applyPlaybackSync({ currentTime: 12, duration: 60, isPlaying: true });

      expect(useRoomStore.getState()).toMatchObject({ currentTime: 12, duration: 60, isPlaying: true });
    }),
  );

  it.effect("admin queue store approves deletes and updates songs", () =>
    Effect.sync(() => {
      useAdminQueueStore.getState().resetAdminQueue();
      useAdminQueueStore.getState().applyInitialQueues([pending("p1")], [track("a1")]);
      useAdminQueueStore.getState().applySongApproved(track("p1"));
      useAdminQueueStore.getState().applySongUpdated({ id: "p1", title: "renamed" });
      useAdminQueueStore.getState().applySongDeleted("a1");

      expect(useAdminQueueStore.getState().pendingQueue).toEqual([]);
      expect(useAdminQueueStore.getState().fullQueue).toEqual([{ ...track("p1"), title: "renamed" }]);
    }),
  );
});

describe("frontend state machines", () => {
  it.effect("participant flow ignores stale search responses", () =>
    Effect.sync(() => {
      const actor = createActor(participantFlowMachine).start();

      actor.send({ type: "JOIN_OK" });
      actor.send({ type: "QUERY_CHANGED", value: "daft" });
      actor.send({ type: "SEARCH_REQUESTED", query: "daft" });
      const staleId = actor.getSnapshot().context.searchRequestId;
      actor.send({ type: "QUERY_CHANGED", value: "justice" });
      actor.send({ type: "SEARCH_REQUESTED", query: "justice" });
      actor.send({ type: "SEARCH_RECEIVED", requestId: staleId, query: "daft", results: [track("stale")] });

      expect(actor.getSnapshot().context.results).toEqual([]);
      actor.stop();
    }),
  );

  it.effect("participant flow enters cooldown after submit success", () =>
    Effect.sync(() => {
      const actor = createActor(participantFlowMachine).start();

      actor.send({ type: "JOIN_OK" });
      actor.send({ type: "SELECT_SONG", youtubeId: "yt-1" });
      actor.send({ type: "SUBMIT_OK" });

      expect(actor.getSnapshot().value).toBe("cooldown");
      expect(actor.getSnapshot().context.cooldownSeconds).toBe(3);
      actor.stop();
    }),
  );

  it.effect("playback machine ignores duplicate track ended while transitioning", () =>
    Effect.sync(() => {
      const actor = createActor(playbackMachine).start();

      actor.send({ type: "TRACK_LOADED" });
      actor.send({ type: "PLAY" });
      actor.send({ type: "TRACK_ENDED" });
      actor.send({ type: "TRACK_ENDED" });

      expect(actor.getSnapshot().value).toBe("transitioning");
      actor.send({ type: "NEXT_RESOLVED", activePlayer: "B" });
      expect(actor.getSnapshot().value).toBe("playing");
      expect(actor.getSnapshot().context.activePlayer).toBe("B");
      actor.stop();
    }),
  );
});
