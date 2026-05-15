import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRagPipeline } from "../../src/hooks/useRagPipeline";

// --- Helpers ---

function makeEmbedding(seed: number): Float32Array {
  const arr = new Float32Array(384);
  for (let i = 0; i < 384; i++) {
    arr[i] = Math.sin(seed + i) * 0.5;
  }
  return arr;
}

function makeNotes(
  count: number,
  opts?: { sameEmbedding?: boolean },
) {
  const base = opts?.sameEmbedding ? makeEmbedding(42) : null;
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    title: `Note ${i + 1}`,
    content: `Content for note ${i + 1}. `.repeat(10),
    embedding: base ?? makeEmbedding(i * 37),
  }));
}

describe("useRagPipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return initial state with null lastResult", () => {
    const { result } = renderHook(() => useRagPipeline());

    expect(result.current.isProcessing).toBe(false);
    expect(result.current.lastResult).toBeNull();
  });

  it("should provide execute function", () => {
    const { result } = renderHook(() => useRagPipeline());

    expect(typeof result.current.execute).toBe("function");
  });

  it("should return empty context for empty query", async () => {
    const { result } = renderHook(() => useRagPipeline());
    let resolve: () => void;
    let reject: (e: Error) => void;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    await act(async () => {
      const ragResult = await result.current.execute({
        query: "   ",
        notes: makeNotes(3),
      });
      resolve(ragResult);
    });

    const ragResult = await promise as any;
    expect(ragResult.context).toEqual([]);
    expect(ragResult.usedTokens).toBe(0);
    expect(ragResult.totalNotes).toBe(0);
  });

  it("should return empty context for empty notes", async () => {
    const { result } = renderHook(() => useRagPipeline());
    let resolve: any;
    const promise = new Promise((res) => {
      resolve = res;
    });

    await act(async () => {
      const ragResult = await result.current.execute({
        query: "test query",
        notes: [],
      });
      resolve(ragResult);
    });

    const ragResult = await promise as any;
    expect(ragResult.context).toEqual([]);
    expect(ragResult.usedTokens).toBe(0);
    expect(ragResult.totalNotes).toBe(0);
  });

  it("should select top-N notes by cosine similarity", async () => {
    const { result } = renderHook(() => useRagPipeline());
    let resolve: any;
    const promise = new Promise((res) => {
      resolve = res;
    });

    const notes = makeNotes(20);

    await act(async () => {
      const ragResult = await result.current.execute({
        query: "test query",
        notes,
        topN: 5,
      });
      resolve(ragResult);
    });

    const ragResult = await promise as any;
    expect(ragResult.context.length).toBeLessThanOrEqual(5);
    expect(ragResult.totalNotes).toBe(20);
  });

  it("should limit context to maxTokens budget", async () => {
    const { result } = renderHook(() => useRagPipeline());
    let resolve: any;
    const promise = new Promise((res) => {
      resolve = res;
    });

    const notes = makeNotes(10);

    await act(async () => {
      const ragResult = await result.current.execute({
        query: "test query",
        notes,
        maxTokens: 50,
      });
      resolve(ragResult);
    });

    const ragResult = await promise as any;
    expect(ragResult.usedTokens).toBeLessThanOrEqual(50);
  });

  it("should deduplicate notes by ID", async () => {
    const { result } = renderHook(() => useRagPipeline());
    let resolve: any;
    const promise = new Promise((res) => {
      resolve = res;
    });

    const note = {
      id: "1",
      title: "Duplicate Note",
      content: "Same note repeated. ",
      embedding: makeEmbedding(42),
    };
    const duplicateNotes = [note, { ...note }, { ...note }];

    await act(async () => {
      const ragResult = await result.current.execute({
        query: "test query",
        notes: duplicateNotes,
        topN: 10,
      });
      resolve(ragResult);
    });

    const ragResult = await promise as any;
    const ids = ragResult.context.map((n: any) => n.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should reset isProcessing to false after execution completes", async () => {
    const { result } = renderHook(() => useRagPipeline());

    expect(result.current.isProcessing).toBe(false);

    await act(async () => {
      await result.current.execute({
        query: "test",
        notes: makeNotes(3),
      });
    });

    // isProcessing should be false after the async work settles
    expect(result.current.isProcessing).toBe(false);
  });

  it("should update lastResult after execution", async () => {
    const { result } = renderHook(() => useRagPipeline());
    let resolve: any;
    const promise = new Promise((res) => {
      resolve = res;
    });

    const notes = makeNotes(5);

    await act(async () => {
      const ragResult = await result.current.execute({
        query: "test query",
        notes,
      });
      resolve(ragResult);
    });

    const ragResult = await promise as any;
    expect(result.current.lastResult).not.toBeNull();
    expect(result.current.lastResult?.usedTokens).toBe(ragResult.usedTokens);
    expect(result.current.lastResult?.totalNotes).toBe(ragResult.totalNotes);
  });
});
