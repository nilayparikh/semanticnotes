import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEmbeddingPipeline } from "../../src/hooks/useEmbeddingPipeline";

// Helper to flush all pending promises and timers
async function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 50));
}

describe("useEmbeddingPipeline", () => {
  it("returns initial state with undefined lastResult", () => {
    const { result } = renderHook(() => useEmbeddingPipeline());

    expect(result.current.isEmbedding).toBe(false);
    expect(result.current.lastResult).toBeUndefined();
    expect(result.current.isModelReady).toBe(false);
    expect(result.current.isModelLoading).toBe(true);
  });

  it("provides embedNote function", () => {
    const { result } = renderHook(() => useEmbeddingPipeline());

    expect(typeof result.current.embedNote).toBe("function");
  });

  it("accepts options with onEmbeddingComplete callback", () => {
    const onEmbeddingComplete = vi.fn();

    const { result } = renderHook(() =>
      useEmbeddingPipeline({ onEmbeddingComplete, debounceMs: 100 }),
    );

    expect(result.current.embedNote).toBeDefined();
  });

  it("accepts debounceMs option", () => {
    const { result } = renderHook(() =>
      useEmbeddingPipeline({ debounceMs: 500 }),
    );

    expect(result.current.embedNote).toBeDefined();
  });

  it("transitions to model ready after worker responds", async () => {
    const { result } = renderHook(() => useEmbeddingPipeline());

    // Worker mock responds with MODEL_READY after setTimeout(..., 0)
    await flushPromises();

    expect(result.current.isModelReady).toBe(true);
    expect(result.current.isModelLoading).toBe(false);
  });

  it("calls onEmbeddingComplete after debounce and embed", async () => {
    const onEmbeddingComplete = vi.fn();
    const mockDbService = {
      query: vi.fn(() => Promise.resolve()),
      ready: Promise.resolve(),
      initialize: vi.fn(),
    };

    const { result } = renderHook(() =>
      useEmbeddingPipeline({
        dbService: mockDbService as any,
        onEmbeddingComplete,
        debounceMs: 50,
      }),
    );

    // Wait for model ready
    await flushPromises();
    expect(result.current.isModelReady).toBe(true);

    // Call embedNote
    act(() => {
      result.current.embedNote("note-1", "This is some test content for embedding.");
    });

    // Should not call immediately
    expect(onEmbeddingComplete).not.toHaveBeenCalled();

    // Wait for debounce + worker response
    await flushPromises();
    await flushPromises();

    expect(onEmbeddingComplete).toHaveBeenCalledTimes(1);
    const callArg = onEmbeddingComplete.mock.calls[0][0];
    expect(callArg.noteId).toBe("note-1");
    expect(callArg.modelVersion).toBe("all-MiniLM-L6-v2");
  });

  it("stores embedding in DB via dbService.query", async () => {
    const mockDbService = {
      query: vi.fn(() => Promise.resolve()),
      ready: Promise.resolve(),
      initialize: vi.fn(),
    };

    const { result } = renderHook(() =>
      useEmbeddingPipeline({
        dbService: mockDbService as any,
        debounceMs: 50,
      }),
    );

    // Wait for model ready
    await flushPromises();
    expect(result.current.isModelReady).toBe(true);

    act(() => {
      result.current.embedNote("note-1", "Test content for DB storage.");
    });

    // Wait for debounce + worker response + DB query
    await flushPromises();
    await flushPromises();

    const dbCall = mockDbService.query.mock.calls.find(
      (call) =>
        typeof call[0] === "string" &&
        call[0].includes("INSERT OR REPLACE INTO note_embeddings"),
    );
    expect(dbCall).toBeDefined();
    expect(dbCall[0]).toContain("INSERT OR REPLACE INTO note_embeddings");
  });

  it("clears stale embeddings for a note before storing refreshed chunks", async () => {
    const mockDbService = {
      query: vi.fn(() => Promise.resolve()),
      ready: Promise.resolve(),
      initialize: vi.fn(),
    };

    const { result } = renderHook(() =>
      useEmbeddingPipeline({
        dbService: mockDbService as any,
        debounceMs: 50,
      }),
    );

    await flushPromises();

    act(() => {
      result.current.embedNote("note-1", "Fresh content for semantic indexing.");
    });

    await flushPromises();
    await flushPromises();

    expect(mockDbService.query).toHaveBeenCalledWith(
      "DELETE FROM note_embeddings WHERE note_id = ?",
      ["note-1"],
    );
  });

  it("stores chunk text alongside each persisted embedding", async () => {
    const mockDbService = {
      query: vi.fn(() => Promise.resolve()),
      ready: Promise.resolve(),
      initialize: vi.fn(),
    };

    const { result } = renderHook(() =>
      useEmbeddingPipeline({
        dbService: mockDbService as any,
        debounceMs: 50,
      }),
    );

    await flushPromises();

    act(() => {
      result.current.embedNote("note-1", "Persist this chunk text.");
    });

    await flushPromises();
    await flushPromises();

    const insertCall = mockDbService.query.mock.calls.find(
      (call) => typeof call[0] === "string" && call[0].includes("INSERT OR REPLACE INTO note_embeddings"),
    );

    expect(insertCall).toBeDefined();
    expect(insertCall[1][2]).toBe("Persist this chunk text.");
  });

  it("does not embed when model is not ready", async () => {
    const onEmbeddingComplete = vi.fn();

    const { result } = renderHook(() =>
      useEmbeddingPipeline({ onEmbeddingComplete, debounceMs: 50 }),
    );

    // Do NOT flush promises — model stays not-ready
    expect(result.current.isModelReady).toBe(false);

    act(() => {
      result.current.embedNote("note-1", "Some content");
    });

    await flushPromises();
    await flushPromises();

    expect(onEmbeddingComplete).not.toHaveBeenCalled();
  });

  it("stores chunk_text in DB, not empty strings", async () => {
    const mockDbService = {
      query: vi.fn(() => Promise.resolve()),
      ready: Promise.resolve(),
      initialize: vi.fn(),
    };

    const { result } = renderHook(() =>
      useEmbeddingPipeline({
        dbService: mockDbService as any,
        debounceMs: 50,
      }),
    );

    // Wait for model ready
    await flushPromises();
    expect(result.current.isModelReady).toBe(true);

    act(() => {
      result.current.embedNote("note-1", "This is test content for chunk text verification.");
    });

    await flushPromises();
    await flushPromises();

    const dbCall = mockDbService.query.mock.calls.find(
      (call) =>
        typeof call[0] === "string" &&
        call[0].includes("INSERT OR REPLACE INTO note_embeddings"),
    );
    expect(dbCall).toBeDefined();
    // chunk_text is the 3rd param (index 2 in params array)
    const chunkText = dbCall[1][2];
    expect(typeof chunkText).toBe("string");
    expect(chunkText.length).toBeGreaterThan(0);
  });

  it("cleans up stale chunk rows before re-embedding the same note", async () => {
    const mockDbService = {
      query: vi.fn(() => Promise.resolve()),
      ready: Promise.resolve(),
      initialize: vi.fn(),
    };

    const { result } = renderHook(() =>
      useEmbeddingPipeline({
        dbService: mockDbService as any,
        debounceMs: 50,
      }),
    );

    // Wait for model ready
    await flushPromises();

    // First embed
    act(() => {
      result.current.embedNote("note-1", "First version of content.");
    });

    await flushPromises();
    await flushPromises();

    // Second embed (should clean up stale chunks first)
    act(() => {
      result.current.embedNote("note-1", "Second version of content with different text.");
    });

    await flushPromises();
    await flushPromises();

    // Verify DELETE FROM note_embeddings was called for the note
    const deleteCall = mockDbService.query.mock.calls.find(
      (call) =>
        typeof call[0] === "string" &&
        call[0].includes("DELETE FROM note_embeddings"),
    );
    expect(deleteCall).toBeDefined();
    expect(deleteCall[1][0]).toBe("note-1");
  });
});
