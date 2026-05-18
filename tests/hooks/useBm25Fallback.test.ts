import { act, renderHook, waitFor as wtWaitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DbServiceInterface } from "@/types/database";
import { createFts5Table, searchNotesFts5, useBm25Fallback } from "@/hooks/useBm25Fallback";

function createMockDbService(rows: unknown[]): DbServiceInterface {
  return {
    query: vi.fn().mockResolvedValue(rows),
    ready: Promise.resolve(),
    initialize: vi.fn().mockResolvedValue(undefined),
  } as unknown as DbServiceInterface;
}

describe("useBm25Fallback helpers", () => {
  it("creates an FTS table definition that stores note_id explicitly", () => {
    const sql = createFts5Table();

    expect(sql).toContain("note_id UNINDEXED");
    expect(sql).not.toContain("content_rowid");
  });

  it("maps BM25 rows back to UUID note ids instead of rowid", async () => {
    const dbService = createMockDbService([
      {
        note_id: "uuid-note-1",
        title: "Persisted note",
        rank: -0.42,
      },
    ]);

    const results = await searchNotesFts5(dbService, "persisted");

    expect(dbService.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT note_id, title"),
      ["persisted"],
    );
    expect(results).toEqual([
      {
        noteId: "uuid-note-1",
        title: "Persisted note",
        score: -0.42,
      },
    ]);
  });
});

interface FtsRow {
  note_id?: string;
  title: string;
  rank?: number;
  score?: number;
}

function createMockFtsDbService(
  ftsRows: FtsRow[] = [],
): DbServiceInterface & { setFtsRows(rows: FtsRow[]): void } {
  let rows = [...ftsRows];

  const mockQuery = vi.fn(async (sql: string, params: any[] = []): Promise<FtsRow[]> => {
    // FTS MATCH query
    if (sql.includes("MATCH")) {
      return rows.map((r, i) => ({ ...r, rank: r.rank ?? -(i + 1) }));
    }
    // CREATE VIRTUAL TABLE - no-op
    if (sql.includes("CREATE VIRTUAL TABLE")) {
      return [];
    }
    return rows;
  });

  return {
    query: mockQuery,
    ready: Promise.resolve(),
    initialize: vi.fn().mockResolvedValue(undefined),
    setFtsRows: (newRows: FtsRow[]) => {
      rows = newRows;
    },
  } as unknown as DbServiceInterface & { setFtsRows(rows: FtsRow[]): void };
}

/* ------------------------------------------------------------------ */
/*  Tests: Bm25Result type returns string noteId                       */
/* ------------------------------------------------------------------ */

describe("useBm25Fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns noteId as string (UUID), not rowid number", async () => {
    const uuid1 = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const uuid2 = "b2c3d4e5-f6a7-8901-bcde-f12345678901";

    const dbService = createMockFtsDbService([
      { note_id: uuid1, title: "First Note" },
      { note_id: uuid2, title: "Second Note" },
    ]);

    const { result } = renderHook(() => useBm25Fallback(dbService));

    await act(async () => {
      await result.current.search("test");
    });

    await wtWaitFor(() => {
      expect(result.current.results.length).toBeGreaterThanOrEqual(1);
    });

    // All noteIds should be strings (UUIDs), not numbers
    for (const r of result.current.results) {
      expect(typeof r.noteId).toBe("string");
    }
    expect(result.current.results[0].noteId).toBe(uuid1);
    expect(result.current.results[1].noteId).toBe(uuid2);
  });

  it("returns empty results for empty query", async () => {
    const dbService = createMockFtsDbService();

    const { result } = renderHook(() => useBm25Fallback(dbService));

    act(() => {
      result.current.search("");
    });

    expect(result.current.results).toEqual([]);
  });

  it("sets isSearching during search", async () => {
    let resolveQuery: ((value: FtsRow[]) => void) | undefined;
    const dbService: DbServiceInterface = {
      query: vi.fn((sql: string) => {
        if (sql.includes("CREATE VIRTUAL TABLE")) {
          return Promise.resolve([]);
        }
        return new Promise<FtsRow[]>((resolve) => {
          resolveQuery = resolve;
        });
      }),
      ready: Promise.resolve(),
      initialize: vi.fn().mockResolvedValue(undefined),
    } as unknown as DbServiceInterface;

    const { result } = renderHook(() => useBm25Fallback(dbService));

    let searchPromise: Promise<void> | undefined;
    await act(async () => {
      searchPromise = result.current.search("test");
    });

    expect(result.current.isSearching).toBe(true);

    resolveQuery?.([{ note_id: "uuid-1", title: "Note", rank: -1 }]);

    await searchPromise;

    await wtWaitFor(() => {
      expect(result.current.isSearching).toBe(false);
    });
  });

  it("handles search errors gracefully", async () => {
    const dbService: DbServiceInterface = {
      query: vi.fn(async (sql: string) => {
        if (sql.includes("CREATE VIRTUAL TABLE")) {
          return [];
        }
        throw new Error("FTS error");
      }),
      ready: Promise.resolve(),
      initialize: vi.fn().mockResolvedValue(undefined),
    } as unknown as DbServiceInterface;

    const { result } = renderHook(() => useBm25Fallback(dbService));

    await act(async () => {
      await result.current.search("test");
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.isSearching).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  Tests: searchNotesFts5 standalone                                  */
/* ------------------------------------------------------------------ */

describe("searchNotesFts5", () => {
  it("queries FTS5 and maps note_id to noteId", async () => {
    const uuid1 = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const dbService = createMockFtsDbService([
      { note_id: uuid1, title: "Matching Note", rank: -1 },
    ]);

    const results = await searchNotesFts5(dbService, "matching");

    expect(results.length).toBe(1);
    expect(results[0].noteId).toBe(uuid1);
    expect(typeof results[0].noteId).toBe("string");
    expect(results[0].title).toBe("Matching Note");
  });

  it("returns empty array when query returns no rows", async () => {
    const dbService = createMockFtsDbService([]);

    const results = await searchNotesFts5(dbService, "nothing");

    expect(results).toEqual([]);
  });

  it("returns empty array when query returns null", async () => {
    const dbService: DbServiceInterface = {
      query: vi.fn().mockResolvedValue(null),
      ready: Promise.resolve(),
      initialize: vi.fn().mockResolvedValue(undefined),
    };

    const results = await searchNotesFts5(dbService, "test");

    expect(results).toEqual([]);
  });
});
