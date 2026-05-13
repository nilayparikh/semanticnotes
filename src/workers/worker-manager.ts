import {
  WorkerMessage,
  WorkerMessageId,
  nextWorkerMessageId,
  DEFAULT_WORKER_MESSAGE_VERSION,
} from "@/types/worker-messages";

type WorkerState = "idle" | "busy" | "terminating";

interface WorkerEntry {
  name: string;
  worker: Worker;
  state: WorkerState;
}

type MessageHandler = (event: MessageEvent) => void;

type WorkerConstructor = new () => Worker;

/**
 * Manages the lifecycle and message routing of Web Workers.
 *
 * Supports registration, message sending, event routing,
 * health checks (ping/pong), and cleanup.
 */
export class WorkerManager {
  private workers = new Map<string, WorkerEntry>();
  private handlers = new Map<string, MessageHandler>();

  /** Register a worker by name. */
  register(name: string, Constructor: WorkerConstructor): Worker {
    const worker = new Constructor();
    const entry: WorkerEntry = { name, worker, state: "idle" };
    this.workers.set(name, entry);

    // Wire up message handler if one is registered
    const handler = this.handlers.get(name);
    if (handler) {
      worker.onmessage = handler;
    }

    return worker;
  }

  /** Attach a message handler for a named worker. */
  onMessage(name: string, handler: MessageHandler): void {
    this.handlers.set(name, handler);
    const entry = this.workers.get(name);
    if (entry) {
      entry.worker.onmessage = handler;
    }
  }

  /** Send a message to a named worker. */
  sendMessage(name: string, message: WorkerMessage): void {
    const entry = this.workers.get(name);
    if (!entry) {
      throw new Error(`Worker '${name}' not found`);
    }
    entry.state = "busy";
    entry.worker.postMessage(message);
  }

  /** Send a ping and resolve on pong using addEventListener to avoid clobbering onmessage. */
  ping(name: string): Promise<number> {
    const entry = this.workers.get(name);
    if (!entry) {
      return Promise.reject(new Error(`Worker '${name}' not found`));
    }

    const id = nextWorkerMessageId();
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        entry.worker.removeEventListener("message", handler);
        reject(new Error(`Ping timeout for worker '${name}'`));
      }, 5000);

      const handler = (event: MessageEvent) => {
        const data = event.data;
        if (data?.type === "worker:pong" && data.id === id) {
          clearTimeout(timeout);
          entry.worker.removeEventListener("message", handler);
          resolve(data.timestamp);
        }
      };

      entry.worker.addEventListener("message", handler);
      entry.worker.postMessage({
        type: "worker:ping",
        id,
        version: DEFAULT_WORKER_MESSAGE_VERSION,
      });
    });
  }

  /** Terminate all registered workers. */
  terminateAll(): void {
    for (const [name, entry] of this.workers) {
      entry.state = "terminating";
      entry.worker.terminate();
    }
    this.workers.clear();
  }

  /** Get the state of a worker. */
  getWorkerState(name: string): WorkerState | undefined {
    const entry = this.workers.get(name);
    return entry?.state;
  }

  /** Get the names of all registered workers. */
  getWorkerNames(): string[] {
    return Array.from(this.workers.keys());
  }
}
