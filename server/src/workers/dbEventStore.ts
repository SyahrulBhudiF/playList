import { Effect } from "effect";
import { sql } from "../db/client";
import type { DbEvent } from "./types";

export const beginEvent = (event: DbEvent) =>
  Effect.promise(async () => {
    const rows = await sql`
      INSERT INTO db_event_log (event_id, type, room_id, status, error)
      VALUES (${event.eventId}, ${event.type}, ${event.roomId}, 'processing', NULL)
      ON CONFLICT (event_id) DO UPDATE
      SET status = 'processing', error = NULL
      WHERE db_event_log.status != 'done'
      RETURNING event_id
    `;
    return rows.length > 0;
  });

export const finishEvent = (event: DbEvent) =>
  Effect.promise(async () => {
    await sql`
      UPDATE db_event_log
      SET status = 'done', processed_at = NOW(), error = NULL
      WHERE event_id = ${event.eventId}
    `;
  });

export const failEvent = (event: DbEvent, error: unknown) =>
  Effect.promise(async () => {
    await sql`
      UPDATE db_event_log
      SET status = 'failed', error = ${String(error)}
      WHERE event_id = ${event.eventId}
    `;
  });
