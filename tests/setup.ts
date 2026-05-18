/**
 * Vitest Setup File
 *
 * Mocks global.Worker before any tests run so that all components
 * and hooks relying on `new SqliteWorker()` work in the jsdom environment.
 */

/* ------------------------------------------------------------------ */
/*  Mock DedicatedWorker                                               */
/* ------------------------------------------------------------------ */

interface WorkerMessage {
  type: string;
  id?: number;
  sql?: string;
  params?: any[];
  path?: string;
  [key: string]: unknown;
}

interface WorkerMessageHandler {
  (event: MessageEvent<{ type: string; [key: string]: unknown }>): void;
}

export class MockWorker {
  #handlers: WorkerMessageHandler[] = [];
  #onmessage: WorkerMessageHandler | null = null;

  constructor(_url?: string) {
    // Accept the worker module URL (e.g., "sqlite.worker?worker")
  }

  set onmessage(handler: WorkerMessageHandler | null) {
    this.#onmessage = handler;
  }

  get onmessage() {
    return this.#onmessage;
  }

  postMessage(data: WorkerMessage): void {
    // Simulate async worker response using setTimeout(..., 0)
    setTimeout(() => {
      const response = this.#getResponse(data);
      const event = new MessageEvent("message", { data: response });

      // Notify all registered handlers
      for (const handler of this.#handlers) {
        handler(event);
      }

      // Also notify onmessage if set
      if (this.#onmessage) {
        this.#onmessage(event);
      }
    }, 0);
  }

  addEventListener(type: string, handler: WorkerMessageHandler): void {
    if (type === "message") {
      this.#handlers.push(handler);
    }
  }

  removeEventListener(type: string, handler: WorkerMessageHandler): void {
    if (type === "message") {
      this.#handlers = this.#handlers.filter((h) => h !== handler);
    }
  }

  terminate(): void {
    this.#handlers = [];
    this.#onmessage = null;
  }

  #getResponse(data: WorkerMessage) {
    // Detect worker type from constructor context — embedding worker sends INIT_MODEL
    if (data.type === "INIT_MODEL") {
      return { type: "MODEL_READY" };
    }
    if (data.type === "EMBED") {
      const dummyEmbedding = new Float32Array(384);
      for (let i = 0; i < 384; i++) {
        dummyEmbedding[i] = (Math.sin(i * 0.1) + 1) * 0.05; // deterministic pseudo-random
      }
      return { type: "EMBEDDING_READY", id: data.id, embeddings: dummyEmbedding };
    }

    switch (data.type) {
      case "MOUNT":
        return { type: "MOUNTED" };
      case "QUERY":
        return { type: "RESULT", id: data.id, row: [] };
      case "COMMIT":
        return { type: "COMMITTED", id: data.id };
      default:
        return { type: "RESULT", id: data.id ?? 0, row: [] };
    }
  }
}

// Define global.Worker for jsdom — must be set before any module imports
globalThis.Worker = MockWorker as unknown as typeof Worker;

/* ------------------------------------------------------------------ */
/*  Mock navigator.gpu                                                 */
/* ------------------------------------------------------------------ */

Object.defineProperty(global.navigator, "gpu", {
  value: {
    requestAdapter: () => Promise.resolve({
      getExtensions: () => [],
      getFeatures: () => new Map(),
      getLimits: () => ({}),
    }),
  },
  configurable: true,
  writable: true,
});

/* ------------------------------------------------------------------ */
/*  Mock ResizeObserver (used by some components)                      */
/* ------------------------------------------------------------------ */

globalThis.ResizeObserver = class ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
};
