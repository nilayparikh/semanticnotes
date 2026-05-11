---
name: Worker Isolation & Threading Model
status: proposed
date: 2026-05-11
context: Embedding Worker + LLM Worker architecture with UI thread communication via OPFS + WebGPU
decision: Enforce strict message type discrimination with Transferable objects for zero-copy data transfers
consequences: Reduced GC pressure, deterministic message routing, predictable worker lifecycle
---

# ADR-005: Worker Isolation & Threading Model

## Problem

The architecture specifies "strict background worker isolation," but two critical gaps exist:

1. **Worker-to-Worker Message Collision (Medium)** — The Embedding Worker and LLM Worker both post messages to the UI thread. Without a type discriminator, messages can interleave, causing race conditions (e.g., an embedding result is consumed as an LLM token).

2. **Strict Worker Isolation Enforcement (Medium)** — No Transferable objects are defined. Data is _copied_ (via the Structured Cloning Algorithm) rather than _moved_, causing GC pressure on the UI thread, especially for `Float32Array` embedding vectors.

## Options Considered

### 1. Message Discrimination Patterns

**Option A — Type discriminator with a sealed union (Recommended)**

```typescript
// worker-messages.ts — Shared message contract
type WorkerMessageType =
  | "embedding:result"
  | "llm:token"
  | "llm:done"
  | "sqlite:ready";

interface WorkerMessage<T extends WorkerMessageType> {
  type: T;
  payload: Extract<WorkerPayload, { type: T }>;
  timestamp: number;
}

type WorkerPayload =
  | {
      type: "embedding:result";
      payload: { id: string; vector: Float32Array; score: number };
    }
  | { type: "llm:token"; payload: { token: string; confidence: number } }
  | { type: "llm:done"; payload: { text: string; duration: number } }
  | { type: "sqlite:ready"; payload: { size: string; path: string } };

// Embedding Worker
self.onmessage = (e: MessageEvent) => {
  self.postMessage({
    type: "embedding:result",
    payload: { id: "note-42", vector: vector, score: 0.87 },
    timestamp: Date.now(),
  } as WorkerMessage<"embedding:result">);
};

// UI Thread — Discriminated handler
worker.onmessage = (e: MessageEvent<WorkerMessage<WorkerMessageType>>) => {
  switch (e.data.type) {
    case "embedding:result":
      handleEmbedding(e.data.payload);
      break;
    case "llm:token":
      handleToken(e.data.payload);
      break;
    case "llm:done":
      handleDone(e.data.payload);
      break;
    case "sqlite:ready":
      handleSqliteReady(e.data.payload);
      break;
  }
};
```

**Option B — Dedicated MessageChannel per worker**

```typescript
const embeddingChannel = new MessageChannel();
embeddingWorker.postMessage("init", [embeddingChannel.port2]);
embeddingChannel.port1.onmessage = (e) => handleEmbedding(e.data);

const llmChannel = new MessageChannel();
llmWorker.postMessage("init", [llmChannel.port2]);
llmChannel.port1.onmessage = (e) => handleLLM(e.data);
```

**Option C — EventSource-style custom events on a shared bus**

```typescript
const workerBus = new EventTarget();

// Workers post to a shared port
workerBus.dispatchEvent(
  new CustomEvent("embedding:result", { detail: payload }),
);
```

### 2. Transferable Objects for Zero-Copy

**Option A — Transferable `Float32Array` with `ArrayBuffer` (Recommended)**

```typescript
// In Embedding Worker — Transfer the ArrayBuffer, not the Float32Array
const vector = new Float32Array(768); // Qwen2.5-Coder-0.5B embedding dimension
// ... populate vector ...

self.postMessage(
  { type: "embedding:result", payload: { id, score: 0.87, vector } },
  [vector.buffer], // ← Transferable: moves ownership, zeroes out GC on sender
);

// In UI Thread — Receive with transfer
worker.onmessage = (e) => {
  const { vector } = e.data.payload;
  // vector is now a "transferred" Float32Array — zero-copy!
  embeddings.set(id, vector);
};
```

**Option B — SharedArrayBuffer with Atomics**

```typescript
const shared = new SharedArrayBuffer(768 * 4); // 768 floats * 4 bytes
const embeddingView = new Float32Array(shared);

// Worker writes directly
embeddingView.set(computeEmbedding(text));
Atomics.notify(embeddingView, 0);

// UI thread reads without copying
Atomics.wait(embeddingView, 0, 0);
```

**Option C — IndexedDB as a transfer medium (OPFS-backed)**

Store the `Float32Array` in OPFS and pass a key reference instead of the raw buffer.

## Recommended Approach

### 1. Sealed Message Union with Type Discriminator

Use **Option A** (type discriminator) as the primary pattern, backed by a shared TypeScript interface. This gives compile-time exhaustiveness checking and runtime switch-based routing.

### 2. Transferable Objects for Zero-Copy Transfers

Use **Option A** (Transferable `Float32Array`) for embedding vectors. For larger payloads (e.g., the full LLM output buffer), use `ArrayBuffer` transfers.

### Integrated Implementation

```typescript
// worker-manager.ts — Centralized worker lifecycle
export class WorkerManager {
  private embeddingWorker: Worker;
  private llmWorker: Worker;
  private handlers = new Map<string, (payload: any) => void>();

  constructor() {
    this.embeddingWorker = new Worker("/workers/embedding.worker.js", {
      type: "module",
    });
    this.llmWorker = new Worker("/workers/llm.worker.js", { type: "module" });

    this.embeddingWorker.onmessage = this.routeMessage.bind(this);
    this.llmWorker.onmessage = this.routeMessage.bind(this);
  }

  private routeMessage(e: MessageEvent<WorkerMessage<WorkerMessageType>>) {
    const { type, payload } = e.data;
    const handler = this.handlers.get(type);
    if (handler) {
      handler(payload);
    } else {
      console.warn(`Unrouted worker message: ${type}`);
    }
  }

  on<T extends WorkerMessageType>(
    type: T,
    handler: (
      payload: WorkerPayload extends { type: T }
        ? WorkerPayload["payload"]
        : never,
    ) => void,
  ) {
    this.handlers.set(type, handler as any);
  }

  sendToEmbedding(
    message: WorkerMessage<"embedding:query">,
    transfers?: Transferable[],
  ) {
    this.embeddingWorker.postMessage(message, transfers);
  }

  sendToLLM(message: WorkerMessage<"llm:query">, transfers?: Transferable[]) {
    this.llmWorker.postMessage(message, transfers);
  }

  terminate() {
    this.embeddingWorker.terminate();
    this.llmWorker.terminate();
  }
}
```

### Transfer Pattern for Embedding Vectors

```typescript
// embedding.worker.ts
self.onmessage = async (e) => {
  const { id, text } = e.data;
  const vector = await pipeline(
    "embedding",
    "Qwen2.5-Coder-0.5B-Instruct",
    text,
  );

  // Transfer the underlying ArrayBuffer for zero-copy
  self.postMessage(
    { type: "embedding:result", payload: { id, vector, score: 0.87 } },
    [vector], // Transferable — moves ownership from Worker to UI thread
  );
};
```

## Trade-offs

| Trade-off                                                    | Impact                                                      |
| ------------------------------------------------------------ | ----------------------------------------------------------- |
| Type discriminator adds ~100 bytes per message               | Negligible compared to 768 × 4 bytes for the vector         |
| Transferable objects "move" data — the sender loses it       | Worker must regenerate if it needs the vector post-transfer |
| SharedArrayBuffer requires `'SharedWorker'` or `name` option | Requires `'SameSite'` cookie or `StructuralClone` for OPFS  |
| WorkerManager centralization introduces a singleton          | Easier to debug but couples lifecycle to the manager        |

## Open Questions

1. Should we use `SharedArrayBuffer` for the hot path (embedding → UI) to avoid transfers entirely, at the cost of requiring `'SharedWorker'`?

[Nilay - 2026-05-11] - Yes use `SharedArrayBuffer` for embedding vectors to achieve zero-copy without the overhead of Transferable objects. We can implement a fallback to `Float32Array` with Transferable for browsers that do not support `SharedArrayBuffer`. This will maximize performance while maintaining compatibility.

2. Do we need a worker health-check mechanism (e.g., `ping/pong` every 500ms) to detect frozen workers?

[Nilay - 2026-05-11] - Implement a health-check mechanism where the UI thread sends a `ping` message to each worker every 30 seconds. If a worker fails to respond with a `pong` within 5 seconds, we can assume it is frozen and attempt to restart it. This will improve robustness without adding significant overhead.

3. Should the message contract be versioned (e.g., `v1:embedding:result`) to allow backward-compatible schema evolution?

[Nilay - 2026-05-11] - Yes, versioning the message contract (e.g., `v1:embedding:result`) is a good practice to allow for backward-compatible schema evolution. This will enable us to introduce new message types or modify existing ones in the future without breaking compatibility with older versions of the workers or UI.

4. Is a `MessageChannel` per worker cleaner than a single `onmessage` handler with type discrimination, given the current 2-worker count?

[Nilay - 2026-05-11] - Given the current architecture with only two workers, using a single `onmessage` handler with type discrimination is sufficient and keeps the implementation simpler.

# Status

## 11/05/2026

- All recommendations are accepted.
- Open questions are answered.
