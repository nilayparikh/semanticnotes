import { describe, it, expect, beforeEach, vi, Mocked } from "vitest";
import { WorkerManager } from "@/workers/worker-manager";

// ── Mock Worker Factory ──────────────────────────────────────────────────

function createMockWorker(): Mocked<Worker> {
  const handlers: Array<{ event: string; callback: (e: MessageEvent) => void }> = [];
  
  const mockWorker = {
    postMessage: vi.fn(),
    terminate: vi.fn(),
    onmessage: null as ((event: MessageEvent) => void) | null,
    onerror: null as ((event: ErrorEvent) => void) | null,
    addEventListener: vi.fn((event: string, callback: (e: MessageEvent) => void) => {
      handlers.push({ event, callback });
    }),
    removeEventListener: vi.fn((event: string, callback: (e: MessageEvent) => void) => {
      const idx = handlers.findIndex(h => h.event === event && h.callback === callback);
      if (idx !== -1) handlers.splice(idx, 1);
    }),
    _handlers: handlers,
  } as unknown as Mocked<Worker>;
  return mockWorker;
}

function createMockConstructor(): { new (): Worker } {
  return vi.fn(() => createMockWorker()) as any;
}

// ── Tests ────────────────────────────────────────────────────────────────

describe("WorkerManager", () => {
  let manager: WorkerManager;

  beforeEach(() => {
    manager = new WorkerManager();
    vi.useFakeTimers();
  });

  it("registers workers by name", () => {
    const Constructor = createMockConstructor();
    const worker = manager.register("embedding", Constructor);

    expect(worker).toBeDefined();
    expect(manager.getWorkerNames()).toContain("embedding");
  });

  it("throws when sending to an unregistered worker", () => {
    expect(() => {
      manager.sendMessage("unknown", {
        type: "note:embed",
        id: 1,
        version: 1,
        payload: { text: "hello", noteId: "n1" },
      });
    }).toThrow("Worker 'unknown' not found");
  });

  it("sends messages to the correct worker via postMessage", () => {
    const mockWorker = createMockWorker();
    const Constructor = vi.fn(() => mockWorker) as any;
    manager.register("sqlite", Constructor);

    const message = {
      type: "note:embed",
      id: 1,
      version: 1,
      payload: { text: "hello", noteId: "n1" },
    } as any;

    manager.sendMessage("sqlite", message);

    expect(mockWorker.postMessage).toHaveBeenCalledWith(message);
  });

  it("attaches onMessage handler to existing worker", () => {
    const mockWorker = createMockWorker();
    const Constructor = vi.fn(() => mockWorker) as any;
    manager.register("llm", Constructor);

    const handler = vi.fn();
    manager.onMessage("llm", handler);

    expect(mockWorker.onmessage).toBe(handler);
  });

  it("attaches onMessage handler before registration", () => {
    const mockWorker = createMockWorker();
    const Constructor = vi.fn(() => mockWorker) as any;

    const handler = vi.fn();
    manager.onMessage("embedding", handler);
    manager.register("embedding", Constructor);

    expect(mockWorker.onmessage).toBe(handler);
  });

  it("ping rejects when worker is not found", async () => {
    await expect(manager.ping("unknown")).rejects.toThrow(
      "Worker 'unknown' not found",
    );
  });

  it("ping resolves on worker:pong", async () => {
    const mockWorker = createMockWorker();
    const Constructor = vi.fn(() => mockWorker) as any;
    manager.register("embedding", Constructor);

    // The ping method uses addEventListener, so we need to:
    // 1. Start the ping (which registers a listener)
    // 2. Manually trigger the stored handler with the pong message
    const pingPromise = manager.ping("embedding");

    // Find and trigger the message handler that was registered via addEventListener
    const addEventCall = (mockWorker.addEventListener as any).mock.calls[0];
    if (addEventCall && addEventCall[1]) {
      const handler = addEventCall[1];
      handler({
        data: {
          type: "worker:pong",
          id: (addEventCall[0] as any)?.id ?? 1,
          timestamp: Date.now(),
        },
      } as MessageEvent);
    }

    const timestamp = await pingPromise;
    expect(timestamp).toBeDefined();
  });

  it("terminateAll calls terminate on all workers", () => {
    const mockWorker1 = createMockWorker();
    const mockWorker2 = createMockWorker();

    manager.register("embedding", vi.fn(() => mockWorker1) as any);
    manager.register("sqlite", vi.fn(() => mockWorker2) as any);

    manager.terminateAll();

    expect(mockWorker1.terminate).toHaveBeenCalled();
    expect(mockWorker2.terminate).toHaveBeenCalled();
  });

  it("worker states transition correctly", () => {
    const mockWorker = createMockWorker();
    const Constructor = vi.fn(() => mockWorker) as any;
    manager.register("embedding", Constructor);

    expect(manager.getWorkerState("embedding")).toBe("idle");

    manager.sendMessage("embedding", {
      type: "note:embed",
      id: 1,
      version: 1,
      payload: { text: "hello", noteId: "n1" },
    } as any);

    expect(manager.getWorkerState("embedding")).toBe("busy");
  });

  it("worker state transitions to terminating on terminateAll", () => {
    const mockWorker = createMockWorker();
    manager.register("embedding", vi.fn(() => mockWorker) as any);

    manager.terminateAll();

    expect(manager.getWorkerNames()).not.toContain("embedding");
  });
});
