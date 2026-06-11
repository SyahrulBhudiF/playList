import { Effect } from "effect";
import { persistEvent } from "./dbEventHandlers";
import { failEvent } from "./dbEventStore";
import {
  ackMessage,
  ensureGroup,
  enqueueDbEvent,
  readNewMessages,
  readPendingMessages,
  requeueMessage,
  sendToDlq,
} from "./dbEventStream";
import {
  DB_EVENT_CONSUMER,
  DB_EVENT_GROUP,
  DB_EVENT_MAX_ATTEMPTS,
  DB_EVENT_STREAM,
  makeDbEvent,
  type DbEvent,
  type StreamMessage,
} from "./types";

export { enqueueDbEvent, makeDbEvent };
export type { DbEvent };

const requeueOrDlq = (messageId: string, event: DbEvent, error: unknown) =>
  Effect.gen(function* () {
    const attempts = (event.attempts ?? 0) + 1;
    const retryEvent = { ...event, attempts } satisfies DbEvent;

    if (attempts >= DB_EVENT_MAX_ATTEMPTS) {
      yield* failEvent(retryEvent, error);
      yield* sendToDlq(messageId, retryEvent, error);
      yield* Effect.logError("DB event moved to DLQ", {
        eventId: event.eventId,
        type: event.type,
        error: String(error),
      });
      return;
    }

    yield* requeueMessage(messageId, retryEvent);
    yield* Effect.logWarning("DB event requeued", {
      eventId: event.eventId,
      attempts,
      error: String(error),
    });
  });

const processBatch = (messages: StreamMessage[]) => {
  const byRoom = new Map<string, StreamMessage[]>();

  for (const message of messages) {
    const roomMessages = byRoom.get(message.event.roomId) ?? [];
    roomMessages.push(message);
    byRoom.set(message.event.roomId, roomMessages);
  }

  return Effect.forEach(
    [...byRoom.values()],
    (roomMessages) =>
      Effect.gen(function* () {
        for (const { messageId, event } of roomMessages) {
          yield* persistEvent(event).pipe(
            Effect.flatMap(() => ackMessage(messageId)),
            Effect.catchCause((cause) => requeueOrDlq(messageId, event, cause)),
          );
        }
      }),
    { concurrency: 8, discard: true },
  );
};

const workerLoop = Effect.gen(function* () {
  yield* ensureGroup;
  yield* Effect.log("DB persistence worker started", {
    stream: DB_EVENT_STREAM,
    group: DB_EVENT_GROUP,
    consumer: DB_EVENT_CONSUMER,
  });

  while (true) {
    const pending = yield* readPendingMessages;
    if (pending.length > 0) {
      yield* processBatch(pending);
      continue;
    }

    const fresh = yield* readNewMessages;
    if (fresh.length > 0) yield* processBatch(fresh);
  }
});

export function startDbPersistenceWorker() {
  return Effect.runFork(workerLoop);
}
