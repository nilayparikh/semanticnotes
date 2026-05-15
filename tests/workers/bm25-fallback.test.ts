/**
 * BM25 Fallback Hook Tests
 *
 * Tests for the BM25 keyword search fallback using SQLite FTS5.
 * Covers createFts5Table, searchNotesFts5, and useBm25Fallback.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  createFts5Table,
  searchNotesFts5,
  useBm25Fallback,
} from "@/hooks/useBm25Fallback";
import type { DbServiceInterface } from "@/types/database";

// ── Mock DbService ────────────────────────────────────────────────────────

function makeMockDbService(): DbServiceInterface {
  return {
    initialize: vi.fn().mockResolvedValue(undefined),
    query: vi.fn(),
    ready: Promise.resolve(),
  };
}

// ── createFts5Table ───────────────────────────────────────────────────────

describe("createFts5Table", () => {
  it("should return SQL that creates the notes_fts FTS5 virtual table", () => {
    // Arrange / Act
    const sql = createFts5Table();

    // Assert
    expect(sql).toContain("CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts");
    expect(sql).toContain("USING fts5");
    expect(sql).toContain("title");
    expect(sql).toContain("content");
    expect(sql).toContain("content = 'notes'");
    expect(sql).toContain("content_rowid = 'id'");
  });
});

// ── searchNotesFts5 ───────────────────────────────────────────────────────

describe("searchNotesFts5", () => {
  let dbService: DbServiceInterface;

  beforeEach(() => {
    vi.clearAllMocks();
    dbService = makeMockDbService();
  });

  it("should query the notes_fts table with the search term", async () => {
    // Arrange
    const mockRows = [
      { id: 1, title: "Note One", rank: 0.85 },
      { id: 2, title: "Note Two", rank: 0.62 },
    ];
    (dbService.query as any).mockResolvedValue(mockRows);

    // Act
    const results = await searchNotesFts5(dbService, "test query");

    // Assert
    expect(dbService.query).toHaveBeenCalledWith(
      expect.stringContaining("notes_fts"),
      expect.arrayContaining(["test query"])
    );
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      noteId: 1,
      title: "Note One",
      score: 0.85,
    });
    expect(results[1]).toEqual({
      noteId: 2,
      title: "Note Two",
      score: 0.62,
    });
  });

  it("should return an empty array when no rows match", async () => {
    // Arrange
    (dbService.query as any).mockResolvedValue([]);

    // Act
    const results = await searchNotesFts5(dbService, "nonexistent");

    // Assert
    expect(results).toEqual([]);
  });

  it("should return an empty array when query returns null", async () => {
    // Arrange
    (dbService.query as any).mockResolvedValue(null);

    // Act
    const results = await searchNotesFts5(dbService, "nothing");

    // Assert
    expect(results).toEqual([]);
  });

  it("should return an empty array when query returns undefined", async () => {
    // Arrange
    (dbService.query as any).mockResolvedValue(undefined);

    // Act
    const results = await searchNotesFts5(dbService, "nothing");

    // Assert
    expect(results).toEqual([]);
  });
});

// ── useBm25Fallback ───────────────────────────────────────────────────────

describe("useBm25Fallback", () => {
  let dbService: DbServiceInterface;

  beforeEach(() => {
    vi.clearAllMocks();
    dbService = makeMockDbService();
  });

  it("should initialize with isSearching false and empty results", () => {
    // Arrange
    (dbService.query as any).mockResolvedValue([]);

    // Act
    const { result } = renderHook(() => useBm25Fallback(dbService));

    // Assert
    expect(result.current.isSearching).toBe(false);
    expect(result.current.results).toEqual([]);
  });

  it("should initialize FTS5 table on mount", () => {
    // Arrange
    (dbService.query as any).mockResolvedValue(undefined);

    // Act
    renderHook(() => useBm25Fallback(dbService));

    // Assert
    expect(dbService.query).toHaveBeenCalledWith(createFts5Table());
  });

  it("should set isSearching to true during search", async () => {
    // Arrange
    let resolveQuery: (val: any) => void;
    (dbService.query as any).mockImplementation(
      () => new Promise((resolve) => (resolveQuery = resolve))
    );

    // Act
    const { result } = renderHook(() => useBm25Fallback(dbService));
    // Clear the init call from the assertion
    (dbService.query as any).mockClear();
    (dbService.query as any).mockImplementation(
      () => new Promise((resolve) => (resolveQuery = resolve))
    );

    await act(async () => {
      result.current.search("test");
    });

    // Assert
    expect(result.current.isSearching).toBe(true);

    // Resolve the promise
    await act(async () => {
      resolveQuery!([{ id: 1, title: "A", rank: 0.5 }]);
    });

    expect(result.current.isSearching).toBe(false);
  });

  it("should populate results after search completes", async () => {
    // Arrange
    (dbService.query as any).mockResolvedValue([
      { id: 10, title: "Matched Note", rank: 0.91 },
    ]);

    // Act
    const { result } = renderHook(() => useBm25Fallback(dbService));
    // Clear init call
    (dbService.query as any).mockClear();
    (dbService.query as any).mockResolvedValue([
      { id: 10, title: "Matched Note", rank: 0.91 },
    ]);

    await act(async () => {
      result.current.search("keyword");
    });

    // Assert
    expect(result.current.isSearching).toBe(false);
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0]).toEqual({
      noteId: 10,
      title: "Matched Note",
      score: 0.91,
    });
  });

  it("should handle search errors gracefully", async () => {
    // Arrange
    (dbService.query as any).mockResolvedValue(undefined); // init
    (dbService.query as any).mockClear();
    (dbService.query as any).mockRejectedValue(new Error("FTS error"));

    // Act
    const { result } = renderHook(() => useBm25Fallback(dbService));

    await act(async () => {
      await result.current.search("bad");
    });

    // Assert
    expect(result.current.isSearching).toBe(false);
    expect(result.current.results).toEqual([]);
  });
});
