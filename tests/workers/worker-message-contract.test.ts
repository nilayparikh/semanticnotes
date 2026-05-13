import { describe, it, expect } from "vitest";
import {
  WorkerMessage,
  WorkerMessageVersion,
  WorkerMessageId,
  DEFAULT_WORKER_MESSAGE_VERSION,
  nextWorkerMessageId,
  createWorkerMessage,
  isWorkerMessage,
} from "../../src/types/worker-messages";

// ── Message Type Validation ──────────────────────────────────────────────

describe("WorkerMessage discriminated union", () => {
  const validTypes = [
    "embedding:query",
    "embedding:result",
    "sqlite:query",
    "sqlite:result",
    "worker:ping",
    "worker:pong",
    "worker:error",
  ] as const;

  it("accepts all defined message types", () => {
    const messages: WorkerMessage[] = [
      {
        type: "embedding:query",
        payload: { text: "hello", noteId: "n1" },
        version: 1,
        id: 1,
      },
      {
        type: "embedding:result",
        payload: {
          noteId: "n1",
          vector: new Float32Array([0.1, 0.2, 0.3]),
          dimensions: 3,
        },
        version: 1,
        id: 2,
      },
      {
        type: "sqlite:query",
        payload: { table: "notes", column: "title", value: "Draft" },
        version: 1,
        id: 3,
      },
      {
        type: "sqlite:result",
        payload: { rows: [{ id: 1 }], count: 1 },
        version: 1,
        id: 4,
      },
      { type: "worker:ping", payload: { id: 42 }, version: 1, id: 5 },
      {
        type: "worker:pong",
        payload: { id: 42, timestamp: Date.now() },
        version: 1,
        id: 6,
      },
      {
        type: "worker:error",
        payload: { message: "timeout", timestamp: Date.now() },
        version: 1,
        id: 7,
      },
    ];

    expect(messages).toHaveLength(validTypes.length);
    messages.forEach((msg, i) => {
      expect(msg.type).toBe(validTypes[i]);
    });
  });

  it("requires a `type` field on every message", () => {
    const msg: WorkerMessage = {
      type: "worker:ping",
      payload: { id: 1 },
      version: 1,
      id: 1,
    } as const;
    expect(msg.type).toBe("worker:ping");
  });

  it("requires a `version` field on every message", () => {
    const msg: WorkerMessage = {
      type: "sqlite:result",
      payload: { rows: [], count: 0 },
      version: 1,
      id: 1,
    };
    expect(msg.version).toBe(1);
  });

  it("requires an `id` field on every message", () => {
    const msg: WorkerMessage = {
      type: "worker:error",
      payload: { message: "err", timestamp: 0 },
      version: 1,
      id: 1,
    };
    expect(msg.id).toBe(1);
  });
});

// ── Embedding Result: Float32Array ───────────────────────────────────────

describe("embedding:result payload", () => {
  it("accepts Float32Array as the vector field", () => {
    const vector = new Float32Array([0.1, 0.2, 0.3]);
    const msg: WorkerMessage = {
      type: "embedding:result",
      payload: { noteId: "n1", vector, dimensions: 3 },
      version: 1,
      id: 1,
    };

    expect(msg.payload.vector).toBeInstanceOf(Float32Array);
    expect(msg.payload.vector).toBe(vector);
  });
});

// ── SQLite Result: Rows Array ────────────────────────────────────────────

describe("sqlite:result payload", () => {
  it("accepts a rows array", () => {
    const msg: WorkerMessage = {
      type: "sqlite:result",
      payload: { rows: [{ id: 1, title: "Note" }], count: 1 },
      version: 1,
      id: 1,
    };

    expect(Array.isArray(msg.payload.rows)).toBe(true);
    expect(msg.payload.count).toBe(1);
  });
});

// ── Ping / Pong: Matching IDs ────────────────────────────────────────────

describe("worker:ping and worker:pong", () => {
  it("has matching id fields between ping and pong", () => {
    const pingId = 42;
    const ping: WorkerMessage = {
      type: "worker:ping",
      payload: { id: pingId },
      version: 1,
      id: 1,
    };
    const pong: WorkerMessage = {
      type: "worker:pong",
      payload: { id: pingId, timestamp: Date.now() },
      version: 1,
      id: 2,
    };

    expect(ping.payload.id).toBe(pong.payload.id);
  });
});

// ── Version Field ────────────────────────────────────────────────────────

describe("version field", () => {
  it("is a number type alias", () => {
    const version: WorkerMessageVersion = 1;
    expect(typeof version).toBe("number");
  });

  it("defaults to DEFAULT_WORKER_MESSAGE_VERSION", () => {
    expect(DEFAULT_WORKER_MESSAGE_VERSION).toBe(1);
  });
});

// ── ID Generator ─────────────────────────────────────────────────────────

describe("nextWorkerMessageId", () => {
  it("returns incrementing numbers", () => {
    const a: WorkerMessageId = nextWorkerMessageId();
    const b: WorkerMessageId = nextWorkerMessageId();
    const c: WorkerMessageId = nextWorkerMessageId();

    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
  });
});

// ── createWorkerMessage Helper ───────────────────────────────────────────

describe("createWorkerMessage", () => {
  it("auto-fills version and id", () => {
    const msg = createWorkerMessage({
      type: "worker:ping",
      payload: { id: 1 },
    });

    expect(msg.version).toBeDefined();
    expect(msg.id).toBeDefined();
    expect(msg.type).toBe("worker:ping");
  });

  it("allows explicit version override", () => {
    const msg = createWorkerMessage({
      type: "worker:ping",
      payload: { id: 1 },
      version: 2,
    });

    expect(msg.version).toBe(2);
  });
});

// ── isWorkerMessage Guard ────────────────────────────────────────────────

describe("isWorkerMessage", () => {
  it("returns true for a valid message", () => {
    const msg: WorkerMessage = {
      type: "worker:ping",
      payload: { id: 1 },
      version: 1,
      id: 1,
    };
    expect(isWorkerMessage(msg)).toBe(true);
  });

  it("returns false for a random object", () => {
    expect(isWorkerMessage({ foo: "bar" })).toBe(false);
  });

  it("returns false for null", () => {
    expect(isWorkerMessage(null)).toBe(false);
  });
});

// ── Type-Safe Const Assertions ───────────────────────────────────────────

describe("type-safe const assertions", () => {
  it("accepts as const on a full message", () => {
    const msg = {
      type: "embedding:query" as const,
      payload: { text: "hello", noteId: "n1" } as const,
      version: 1,
      id: 1,
    };

    expect(msg.type).toBe("embedding:query");
  });
});
