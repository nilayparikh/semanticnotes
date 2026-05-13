/**
 * Worker Message Contract
 *
 * Discriminated union types for inter-worker communication.
 * All messages carry a `version` and `id` field for tracing.
 */

// ── Type Aliases ──────────────────────────────────────────────────────────

export type WorkerMessageVersion = number;
export type WorkerMessageId = number;

export const DEFAULT_WORKER_MESSAGE_VERSION: WorkerMessageVersion = 1;

let _nextId = 0;
export function nextWorkerMessageId(): WorkerMessageId {
  return ++_nextId;
}

// ── Payload Types ────────────────────────────────────────────────────────

export interface EmbeddingQueryPayload {
  text: string;
  noteId: string;
}

export interface EmbeddingResultPayload {
  noteId: string;
  vector: Float32Array;
  dimensions: number;
}

export interface SqliteQueryPayload {
  table: string;
  column: string;
  value: string;
}

export interface SqliteResultPayload {
  rows: any[];
  count: number;
}

export interface WorkerPingPayload {
  id: number;
}

export interface WorkerPongPayload {
  id: number;
  timestamp: number;
}

export interface WorkerErrorPayload {
  message: string;
  timestamp: number;
}

// ── Base Message ─────────────────────────────────────────────────────────

interface WorkerMessageBase {
  type: string;
  version: WorkerMessageVersion;
  id: WorkerMessageId;
}

// ── Discriminated Union ──────────────────────────────────────────────────

export type WorkerMessage =
  | (WorkerMessageBase & {
      type: "embedding:query";
      payload: EmbeddingQueryPayload;
    })
  | (WorkerMessageBase & {
      type: "embedding:result";
      payload: EmbeddingResultPayload;
    })
  | (WorkerMessageBase & { type: "sqlite:query"; payload: SqliteQueryPayload })
  | (WorkerMessageBase & {
      type: "sqlite:result";
      payload: SqliteResultPayload;
    })
  | (WorkerMessageBase & { type: "worker:ping"; payload: WorkerPingPayload })
  | (WorkerMessageBase & { type: "worker:pong"; payload: WorkerPongPayload })
  | (WorkerMessageBase & { type: "worker:error"; payload: WorkerErrorPayload });

// ── Helpers ──────────────────────────────────────────────────────────────

export function createWorkerMessage<
  T extends { type: WorkerMessage["type"]; payload: WorkerMessage["payload"] },
>(
  msg: Omit<T, "version" | "id"> & { version?: WorkerMessageVersion },
): WorkerMessage {
  return {
    version: msg.version ?? DEFAULT_WORKER_MESSAGE_VERSION,
    id: nextWorkerMessageId(),
    ...msg,
  } as unknown as WorkerMessage;
}

export function isWorkerMessage(msg: unknown): msg is WorkerMessage {
  return (
    typeof msg === "object" &&
    msg !== null &&
    "type" in msg &&
    "version" in msg &&
    "id" in msg
  );
}
