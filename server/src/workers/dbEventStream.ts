import { Effect } from "effect";
import { redis } from "../lib/redis";
import {
  DB_EVENT_BATCH_SIZE,
  DB_EVENT_BLOCK_MS,
  DB_EVENT_CONSUMER,
  DB_EVENT_DLQ_STREAM,
  DB_EVENT_GROUP,
  DB_EVENT_PENDING_IDLE_MS,
  DB_EVENT_STREAM,
  type DbEvent,
  type StreamMessage,
} from "./types";

const parseFields = (fields: string[]): Record<string, string> => {
  const record: Record<string, string> = {};

  for (let index = 0; index < fields.length; index += 2) {
    const key = fields[index];
    const value = fields[index + 1];
    if (key && value !== undefined) record[key] = value;
  }

  return record;
};

const parseMessage = (messageId: string, fields: string[]): StreamMessage => {
  const record = parseFields(fields);
  if (!record.event) throw new Error(`Missing event payload for ${messageId}`);
  return { messageId, event: JSON.parse(record.event) as DbEvent };
};

export const enqueueDbEvent = (event: DbEvent) =>
  redis.xadd(DB_EVENT_STREAM, "*", "event", JSON.stringify(event));

export const ensureGroup = Effect.promise(async () => {
  try {
    await redis.xgroup("CREATE", DB_EVENT_STREAM, DB_EVENT_GROUP, "0", "MKSTREAM");
  } catch (error) {
    if (!String(error).includes("BUSYGROUP")) throw error;
  }
});

export const ackMessage = (messageId: string) =>
  Effect.promise(() => redis.xack(DB_EVENT_STREAM, DB_EVENT_GROUP, messageId).then(() => undefined));

export const sendToDlq = (messageId: string, event: DbEvent, error: unknown) =>
  Effect.promise(async () => {
    await redis.xadd(
      DB_EVENT_DLQ_STREAM,
      "*",
      "event",
      JSON.stringify(event),
      "failedMessageId",
      messageId,
      "error",
      String(error),
    );
    await redis.xack(DB_EVENT_STREAM, DB_EVENT_GROUP, messageId);
  });

export const requeueMessage = (messageId: string, event: DbEvent) =>
  Effect.promise(async () => {
    await redis.xadd(DB_EVENT_STREAM, "*", "event", JSON.stringify(event));
    await redis.xack(DB_EVENT_STREAM, DB_EVENT_GROUP, messageId);
  });

export const readNewMessages = Effect.promise(async () => {
  const response = (await redis.xreadgroup(
    "GROUP",
    DB_EVENT_GROUP,
    DB_EVENT_CONSUMER,
    "COUNT",
    DB_EVENT_BATCH_SIZE,
    "BLOCK",
    DB_EVENT_BLOCK_MS,
    "STREAMS",
    DB_EVENT_STREAM,
    ">",
  )) as any[] | null;

  const stream = response?.[0] as [string, Array<[string, string[]]>] | undefined;
  return (stream?.[1] ?? []).map(([messageId, fields]) => parseMessage(messageId, fields));
});

export const readPendingMessages = Effect.promise(async () => {
  const response = (await (redis as any).xautoclaim(
    DB_EVENT_STREAM,
    DB_EVENT_GROUP,
    DB_EVENT_CONSUMER,
    DB_EVENT_PENDING_IDLE_MS,
    "0-0",
    "COUNT",
    DB_EVENT_BATCH_SIZE,
  )) as any[] | null;

  const messages = response?.[1] as Array<[string, string[]]> | undefined;
  return (messages ?? []).map(([messageId, fields]) => parseMessage(messageId, fields));
});
