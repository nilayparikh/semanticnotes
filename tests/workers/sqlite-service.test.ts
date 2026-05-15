import { describe, it, expect, beforeEach, vi, Mocked } from "vitest";
import { DbService } from "@/hooks/useDbService";
import {
  NOTES_TABLE_SQL,
  EMBEDDINGS_TABLE_SQL,
  INDEXES_SQL,
} from "@/types/database";

// ── Mock Worker Factory ──────────────────────────────────────────────────

function createMockWorker(): Mocked<Worker> {
  const handlers: Array<{
    event: string;
    callback: (e: MessageEvent) => void;
  }> = [];

  const mockWorker = {
    postMessage: vi.fn(),
    terminate: vi.fn(),
    onmessage: null,
    onerror: null,
    addEventListener: vi.fn(
      (event: string, callback: (e: MessageEvent) => void) => {
        handlers.push({ event, callback });
      },
    ),
    removeEventListener: vi.fn(
      (event: string, callback: (e: MessageEvent) => void) => {
        const idx = handlers.findIndex(
          (h) => h.event === event && h.callback === callback,
        );
        if (idx !== -1) handlers.splice(idx, 1);
      },
    ),
    _handlers: handlers,
    _triggerMessage: (data: any) => {
      const msgEvent = { data } as MessageEvent;
      handlers.forEach((h) => h.callback(msgEvent));
    },
  } as unknown as Mocked<Worker> & { _triggerMessage: (data: any) => void };
  return mockWorker;
}

// ── Tests ────────────────────────────────────────────────────────────────

describe("DbService", () => {
  let mockWorker: Mocked<Worker> & { _triggerMessage: (data: any) => void };
  let dbService: DbService;

  beforeEach(() => {
    mockWorker = createMockWorker();
    dbService = new DbService(mockWorker as unknown as DedicatedWorker);
  });

  it("should initialize and mount OPFS database", () => {
    dbService.initialize();

    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      type: "MOUNT",
      path: "semanticnotes.db",
    });
  });

  it("should create notes table with correct schema", async () => {
    dbService.initialize();
    mockWorker._triggerMessage({ type: "MOUNTED" });

    await dbService.ready;

    const mountCall = mockWorker.postMessage.mock.calls.find(
      (call) => call[0].type === "MOUNT",
    );
    expect(mountCall).toBeDefined();
  });

  it("should create note_embeddings table with correct schema", async () => {
    dbService.initialize();
    mockWorker._triggerMessage({ type: "MOUNTED" });

    await dbService.ready;

    expect(mockWorker.postMessage).toHaveBeenCalled();
  });

  it("should query notes by updated_at DESC", async () => {
    dbService.initialize();
    mockWorker._triggerMessage({ type: "MOUNTED" });
    await dbService.ready;

    const mockRows = [
      {
        id: 1,
        title: "Test Note",
        content: "Test Content",
        note_version: 1,
        created_at: "2026-05-12",
        updated_at: "2026-05-12",
        updated_ts: 1715472000,
      },
    ];

    // Capture the query id from postMessage and respond with matching id
    let capturedId: number | undefined;
    mockWorker.postMessage.mockImplementation((data: any) => {
      if (data.type === "QUERY") {
        capturedId = data.id;
      }
    });

    mockWorker.addEventListener.mockImplementation(
      (_event, callback) => {
        setTimeout(() => {
          callback({
            data: { id: capturedId, type: "RESULT", row: mockRows },
          } as any);
        }, 0);
      },
    );

    const results = await dbService.query(
      "SELECT * FROM notes ORDER BY updated_at DESC",
    );

    expect(results).toEqual(mockRows);
  });

  it("should handle MOUNTED and MOUNT_ERROR messages", async () => {
    dbService.initialize();

    // Test MOUNTED
    mockWorker._triggerMessage({ type: "MOUNTED" });
    await expect(dbService.ready).resolves.toBeUndefined();
  });

  it("should reject on MOUNT_ERROR", async () => {
    dbService.initialize();

    mockWorker._triggerMessage({
      type: "MOUNT_ERROR",
      error: new Error("OPFS not available"),
    });

    await expect(dbService.ready).rejects.toThrow("OPFS not available");
  });
});
