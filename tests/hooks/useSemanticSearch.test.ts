import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { DbServiceInterface } from "@/types/database";

// Mock dependencies before importing the hook
vi.mock("@/utils/cosine-similarity", () => ({
  searchVectors: vi.fn(),
}));

vi.mock("@/hooks/useBm25Fallback", () => ({
  searchNotesFts5: vi.fn(),
}));

import { useSemanticSearch } from "../../src/hooks/useSemanticSearch";
import { searchVectors } from "../../src/utils/cosine-similarity";
import { searchNotesFts5 } from "../../src/hooks/useBm25Fallback";

// ── Helpers ──────────────────────────────────────────────────────────────

function createMockDbService(rows: any[]): DbServiceInterface {
  return {
    query: vi.fn().mockResolvedValue(rows),
    ready: Promise.resolve(),
    initialize: vi.fn().mockResolvedValue(undefined),
  } as unknown as DbServiceInterface;
}

function makeEmbedding(values: number[]): Float32Array {
  return new Float32Array(values);
}

// ── Tests ────────────────────────────────────────────────────────────────

describe("useSemanticSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (searchVectors as any).mockReset();
    (searchNotesFts5 as any).mockReset().mockResolvedValue([]);
  });

  it("should initialize with empty results and not searching", () => {
    const mockDb = createMockDbService([]);

    const { result } = renderHook(() => useSemanticSearch(mockDb, 50));

    expect(result.current.isSearching).toBe(false);
    expect(result.current.results).toEqual([]);
  });

  it("should provide a search function", () => {
    const mockDb = createMockDbService([]);

    const { result } = renderHook(() => useSemanticSearch(mockDb, 50));

    expect(typeof result.current.search).toBe("function");
  });

  it("should use semantic search when webGpuScore >= 31", async () => {
    const mockDb = createMockDbService([
      {
        note_id: 1,
        chunk_index: 0,
        embedding: makeEmbedding([0.1, 0.2, 0.3]),
      },
    ]);

    const mockQueryEmbedding = makeEmbedding([0.1, 0.2, 0.3]);
    (searchVectors as any).mockReturnValue([
      { noteId: 1, score: 0.85, chunkIndex: 0 },
    ]);

    const { result } = renderHook(() => useSemanticSearch(mockDb, 50));

    await act(async () => {
      await result.current.search("test query");
    });

    expect(result.current.isSearching).toBe(false);
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].noteId).toBe("1");
    expect(result.current.results[0].score).toBe(0.85);
    expect(result.current.results[0].percentage).toBe(85);
  });

  it("should use BM25 fallback when webGpuScore < 31", async () => {
    const mockDb = createMockDbService([]);
    (searchNotesFts5 as any).mockResolvedValue([
      { noteId: 2, title: "Fallback Note", score: 0.7 },
    ]);

    const { result } = renderHook(() => useSemanticSearch(mockDb, 20));

    await act(async () => {
      await result.current.search("test query");
    });

    expect(searchNotesFts5).toHaveBeenCalledWith(mockDb, "test query");
    expect(result.current.isSearching).toBe(false);
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].noteId).toBe("2");
  });

  it("should calculate percentage as score * 100 rounded to integer", async () => {
    const mockDb = createMockDbService([
      {
        note_id: 1,
        chunk_index: 0,
        embedding: makeEmbedding([0.1, 0.2, 0.3]),
      },
    ]);

    (searchVectors as any).mockReturnValue([
      { noteId: 1, score: 0.7234, chunkIndex: 0 },
    ]);

    const { result } = renderHook(() => useSemanticSearch(mockDb, 50));

    await act(async () => {
      await result.current.search("test");
    });

    expect(result.current.results[0].percentage).toBe(72);
  });

  it("should return top 10 results from semantic search", async () => {
    const mockDb = createMockDbService([
      {
        note_id: 1,
        chunk_index: 0,
        embedding: makeEmbedding([0.1, 0.2, 0.3]),
      },
    ]);

    const manyResults = Array.from({ length: 15 }, (_, i) => ({
      noteId: i + 1,
      score: 0.9 - i * 0.05,
      chunkIndex: 0,
    }));
    (searchVectors as any).mockReturnValue(manyResults);

    const { result } = renderHook(() => useSemanticSearch(mockDb, 50));

    await act(async () => {
      await result.current.search("test");
    });

    expect(result.current.results).toHaveLength(10);
  });

  it("should keep the best semantic score when multiple chunks map to the same note", async () => {
    const mockDb = createMockDbService([
      {
        note_id: 1,
        chunk_index: 0,
        embedding: makeEmbedding([0.1, 0.2, 0.3]),
      },
      {
        note_id: 1,
        chunk_index: 1,
        embedding: makeEmbedding([0.3, 0.2, 0.1]),
      },
    ]);

    (searchVectors as any).mockReturnValue([
      { noteId: 1, score: 0.92, chunkIndex: 0 },
      { noteId: 1, score: 0.41, chunkIndex: 1 },
    ]);

    const { result } = renderHook(() => useSemanticSearch(mockDb, 50));

    await act(async () => {
      await result.current.search("test");
    });

    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].noteId).toBe("1");
    expect(result.current.results[0].score).toBe(0.92);
    expect(result.current.results[0].percentage).toBe(92);
  });

  it("should set isSearching to true during search then false on complete", async () => {
    const mockDb = createMockDbService([]);
    (searchVectors as any).mockResolvedValue([]);

    const { result } = renderHook(() => useSemanticSearch(mockDb, 50));

    // Before search
    expect(result.current.isSearching).toBe(false);

    await act(async () => {
      await result.current.search("test");
    });

    // After search completes
    expect(result.current.isSearching).toBe(false);
  });

  it("should clear results when query is empty", async () => {
    const mockDb = createMockDbService([]);

    const { result } = renderHook(() => useSemanticSearch(mockDb, 50));

    await act(async () => {
      await result.current.search("");
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.isSearching).toBe(false);
  });

  it("should handle search errors gracefully", async () => {
    const mockDb = createMockDbService([]);
    (searchVectors as any).mockImplementation(() => {
      throw new Error("embedding failed");
    });

    const { result } = renderHook(() => useSemanticSearch(mockDb, 50));

    await act(async () => {
      await result.current.search("test");
    });

    expect(result.current.isSearching).toBe(false);
    expect(result.current.results).toEqual([]);
  });
});
