import { createServer, type Server as HttpServer } from "node:http";
import { AddressInfo } from "node:net";
import { Effect } from "effect";
import { describe, expect, it } from "@effect/vitest";
import { afterAll, beforeAll, vi } from "vitest";
import { Server } from "socket.io";
import { io as createClient, type Socket as ClientSocket } from "socket.io-client";

let suggestionFetchCount = 0;
let httpServer: HttpServer;
let ioServer: Server;
let baseUrl: string;

const sockets: ClientSocket[] = [];

const connectSocket = () =>
  Effect.promise(
    () =>
      new Promise<ClientSocket>((resolve, reject) => {
        const socket = createClient(baseUrl, { transports: ["websocket"], forceNew: true });
        sockets.push(socket);
        socket.once("connect", () => resolve(socket));
        socket.once("connect_error", reject);
      }),
  );

const emitAck = <T>(socket: ClientSocket, event: string, data: unknown) =>
  Effect.promise(
    () =>
      new Promise<T>((resolve, reject) => {
        socket.timeout(1_000).emit(event, data, (error: Error | null, response: T) => {
          if (error) reject(error);
          else resolve(response);
        });
      }),
  );

beforeAll(async () => {
  globalThis.fetch = vi.fn(async () => {
    suggestionFetchCount += 1;
    return new Response(JSON.stringify(["daft", ["daft punk", "daft punk one more time", "daft punk around the world"]]));
  }) as unknown as typeof fetch;

  const { handleParticipantEvents } = await import("../server/src/socket/participantHandler");

  httpServer = createServer();
  ioServer = new Server(httpServer, { cors: { origin: "*" } });
  ioServer.on("connection", (socket) => handleParticipantEvents(ioServer, socket));

  await new Promise<void>((resolve) => httpServer.listen(0, resolve));
  const address = httpServer.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  for (const socket of sockets.splice(0)) socket.disconnect();
  await ioServer.close();
  await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  const { redis } = await import("../server/src/lib/redis");
  await redis.quit();
  vi.restoreAllMocks();
});

describe("search socket e2e", () => {
  it.effect("rejects too-short searches without external lookup", () =>
    Effect.gen(function* () {
      const socket = yield* connectSocket();
      const response = yield* emitAck<{ success: boolean; results: unknown[] }>(socket, "search_songs", { query: "a" });

      expect(response).toEqual({ success: true, results: [] });
    }),
  );

  it.effect("uses cached suggestions and rate-limits uncached spam", () =>
    Effect.gen(function* () {
      const socket = yield* connectSocket();

      const first = yield* emitAck<{ success: boolean; suggestions: string[] }>(socket, "get_search_suggestions", {
        query: "Daft",
      });
      const cached = yield* emitAck<{ success: boolean; suggestions: string[] }>(socket, "get_search_suggestions", {
        query: " daft ",
      });
      const limited = yield* emitAck<{ success: boolean; suggestions: string[] }>(socket, "get_search_suggestions", {
        query: "Justice",
      });

      expect(first.suggestions).toEqual(["daft punk", "daft punk one more time", "daft punk around the world"]);
      expect(cached.suggestions).toEqual(first.suggestions);
      expect(limited).toEqual({ success: true, suggestions: [] });
      expect(suggestionFetchCount).toBe(1);
    }),
  );
});
