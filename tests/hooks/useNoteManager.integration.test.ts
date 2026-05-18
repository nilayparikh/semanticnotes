import { describe, it, expect, vi, beforeEach, afterEach, waitFor } from "vitest";
import { renderHook, act, waitFor as wtWaitFor } from "@testing-library/react";
import type { DbServiceInterface } from "@/types/database";
import type { Note } from "@/types/note";

// Mock the hook module
vi.mock("@/hooks/useNoteManager", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/useNoteManager")>();
  return actual;
});

import { useNoteManager } from "../../src/hooks/useNoteManager";

/* ------------------------------------------------------------------ */
/*  Mock DB Service                                                    */
/* ------------------------------------------------------------------ */

interface MockRow {
  id: string;
  title: string;
  content: string;
  note_version: number;
  created_at: string;
  updated_at: string;
  updated_ts: number;
}

function createMockDbService(initialRows: MockRow[] = []): DbServiceInterface & { getRows(): MockRow[] } {
  let rows = [...initialRows];

  const mockQuery = vi.fn(async (sql: string, params: any[] = []): Promise<MockRow[]> => {
    if (sql.includes("INSERT INTO notes_fts")) {
      return [];
    }
    if (sql.includes("UPDATE notes_fts")) {
      return [];
    }
    if (sql.includes("DELETE FROM notes_fts")) {
      return [];
    }
    // SELECT * FROM notes
    if (sql.includes("SELECT") && sql.includes("FROM notes")) {
      return rows;
    }
    if (sql === "DELETE FROM notes_fts") {
      return [];
    }
    if (sql.includes("INSERT INTO notes_fts") && sql.includes("SELECT id, title, content FROM notes")) {
      return [];
    }
    // INSERT INTO notes
    if (sql.includes("INSERT INTO notes (")) {
      const [id, title, content, note_version, created_at, updated_at, updated_ts] = params;
      rows.push({ id, title, content, note_version, created_at, updated_at, updated_ts });
      return [];
    }
    // UPDATE notes
    if (sql.includes("UPDATE notes SET")) {
      const [title, content, updated_at, updated_ts, id] = params;
      rows = rows.map((r) => (r.id === id
        ? {
            ...r,
            title,
            content,
            note_version: r.note_version + 1,
            updated_at,
            updated_ts,
          }
        : r));
      return [];
    }
    // DELETE FROM notes
    if (sql.includes("DELETE FROM notes WHERE")) {
      const [id] = params;
      rows = rows.filter((r) => r.id !== id);
      return [];
    }
    return [];
  });

  return {
    query: mockQuery,
    ready: Promise.resolve(),
    initialize: vi.fn().mockResolvedValue(undefined),
    getRows: () => rows,
  } as unknown as DbServiceInterface & { getRows(): MockRow[] };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("useNoteManager (SQLite Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("hydrates notes from SQLite on mount", async () => {
    const existingNote: Note = {
      id: "note-1",
      title: "Existing Note",
      content: "Pre-existing content",
      note_version: 1,
      created_at: "2025-01-01T00:00:00.000Z",
      updated_at: "2025-01-01T00:00:00.000Z",
      updated_ts: 1704067200000,
    };

    const dbService = createMockDbService([existingNote]);

    const { result } = renderHook(() => useNoteManager(dbService));

    // Wait for hydration effect to complete
    await wtWaitFor(() => {
      expect(result.current.notes.length).toBe(1);
    });

    expect(result.current.notes[0].id).toBe("note-1");
    expect(result.current.notes[0].title).toBe("Existing Note");

    // Verify SELECT was called
    expect(dbService.query).toHaveBeenCalledWith("SELECT * FROM notes");
    expect(dbService.query).toHaveBeenCalledWith("DELETE FROM notes_fts");
    expect(dbService.query).toHaveBeenCalledWith(
      "INSERT INTO notes_fts (note_id, title, content) SELECT id, title, content FROM notes",
    );
  });

  it("creates notes in SQLite via INSERT", async () => {
    const dbService = createMockDbService([]);

    const { result } = renderHook(() => useNoteManager(dbService));

    await wtWaitFor(() => {
      expect(result.current.notes.length).toBe(0);
    });

    let noteId: string;
    act(() => {
      noteId = result.current.createNote({
        title: "New Note",
        content: "New content",
      });
    });

    // Verify the note is in state (waitFor async INSERT to settle)
    await wtWaitFor(() => {
      expect(result.current.notes.length).toBeGreaterThanOrEqual(1);
    });

    // Find the created note
    const createdNote = result.current.notes.find((n) => n.id === noteId);
    expect(createdNote).toBeDefined();
    expect(createdNote?.title).toBe("New Note");

    // Verify INSERT was called on dbService
    const insertCall = (dbService as any).query.mock.calls.find(
      (call: any[]) => call[0]?.includes("INSERT INTO notes ("),
    );
    expect(insertCall).toBeDefined();
    expect(insertCall[1][0]).toBe(noteId);
    expect(insertCall[1][1]).toBe("New Note");

    const ftsInsertCall = (dbService as any).query.mock.calls.find(
      (call: any[]) =>
        call[0]?.includes("INSERT INTO notes_fts") &&
        Array.isArray(call[1]) &&
        call[1].length === 3,
    );
    expect(ftsInsertCall).toBeDefined();
    expect(ftsInsertCall[1]).toEqual([noteId, "New Note", "New content"]);

    // Verify note count in mock DB
    expect((dbService as any).getRows().length).toBe(1);
  });

  it("updates notes in SQLite via UPDATE", async () => {
    const existingNote: Note = {
      id: "note-2",
      title: "Original Title",
      content: "Original content",
      note_version: 1,
      created_at: "2025-01-01T00:00:00.000Z",
      updated_at: "2025-01-01T00:00:00.000Z",
      updated_ts: 1704067200000,
    };

    const dbService = createMockDbService([existingNote]);

    const { result } = renderHook(() => useNoteManager(dbService));

    await wtWaitFor(() => {
      expect(result.current.notes.length).toBe(1);
    });

    act(() => {
      result.current.updateNote("note-2", {
        title: "Updated Title",
        note_version: 2,
      });
    });

    // Verify UPDATE was called on dbService
    const updateCall = (dbService as any).query.mock.calls.find(
      (call: any[]) => call[0]?.includes("UPDATE notes SET"),
    );
    expect(updateCall).toBeDefined();
    expect(updateCall[1][0]).toBe("Updated Title"); // title param
    expect(updateCall[1][4]).toBe("note-2"); // id param (WHERE clause)

    await wtWaitFor(() => {
      const ftsUpdateCall = (dbService as any).query.mock.calls.find(
        (call: any[]) => call[0]?.includes("UPDATE notes_fts"),
      );
      expect(ftsUpdateCall).toBeDefined();
      expect(ftsUpdateCall[1]).toEqual(["Updated Title", "Original content", "note-2"]);
    });
  });

  it("deletes notes from SQLite via DELETE", async () => {
    const existingNote: Note = {
      id: "note-3",
      title: "To Delete",
      content: "Content",
      note_version: 1,
      created_at: "2025-01-01T00:00:00.000Z",
      updated_at: "2025-01-01T00:00:00.000Z",
      updated_ts: 1704067200000,
    };

    const dbService = createMockDbService([existingNote]);

    const { result } = renderHook(() => useNoteManager(dbService));

    await wtWaitFor(() => {
      expect(result.current.notes.length).toBe(1);
    });

    act(() => {
      result.current.deleteNote("note-3");
    });

    // Verify DELETE was called
    const deleteCall = (dbService as any).query.mock.calls.find(
      (call: any[]) => call[0]?.includes("DELETE FROM notes WHERE"),
    );
    expect(deleteCall).toBeDefined();
    expect(deleteCall[1][0]).toBe("note-3");

    await wtWaitFor(() => {
      const ftsDeleteCall = (dbService as any).query.mock.calls.find(
        (call: any[]) =>
          call[0]?.includes("DELETE FROM notes_fts") &&
          Array.isArray(call[1]) &&
          call[1].length === 1,
      );
      expect(ftsDeleteCall).toBeDefined();
      expect(ftsDeleteCall[1]).toEqual(["note-3"]);
    });

    await wtWaitFor(() => {
      const embeddingDeleteCall = (dbService as any).query.mock.calls.find(
        (call: any[]) => call[0]?.includes("DELETE FROM note_embeddings WHERE note_id = ?"),
      );
      expect(embeddingDeleteCall).toBeDefined();
      expect(embeddingDeleteCall[1]).toEqual(["note-3"]);
    });
  });

  it("persists multiple CRUD operations to SQLite", async () => {
    const dbService = createMockDbService([]);

    const { result } = renderHook(() => useNoteManager(dbService));

    await wtWaitFor(() => {
      expect(result.current.notes.length).toBe(0);
    });

    let id1: string;
    let id2: string;

    act(() => {
    id1 = result.current.createNote({ title: "First", content: "A" });
    id2 = result.current.createNote({ title: "Second", content: "B" });
  });

    // Notes should be in state (may have duplicates from mock, verify by ID)
    const note1 = result.current.notes.find((n) => n.id === id1);
    const note2 = result.current.notes.find((n) => n.id === id2);
    expect(note1).toBeDefined();
    expect(note2).toBeDefined();

    act(() => {
      result.current.updateNote(id1, { title: "First Updated", note_version: 2 });
    });

    act(() => {
      result.current.deleteNote(id2);
    });

    // Verify by ID (may have duplicates from mock behavior)
    const remaining = result.current.notes.find((n) => n.id === id1);
    expect(remaining).toBeDefined();
    expect(remaining?.title).toBe("First Updated");

    // Verify DELETE from note_embeddings was called
    await wtWaitFor(() => {
      const embedDeleteCall = (dbService as any).query.mock.calls.find(
        (call: any[]) =>
          call[0]?.includes("DELETE FROM note_embeddings") &&
          Array.isArray(call[1]) &&
          call[1].length === 1,
      );
      expect(embedDeleteCall).toBeDefined();
      expect(embedDeleteCall[1]).toEqual([id2]);
    });

    // Count calls by type
    const calls = (dbService as any).query.mock.calls;
    const inserts = calls.filter((c: any[]) => c[0]?.includes("INSERT INTO notes (")).length;
    const updates = calls.filter((c: any[]) => c[0]?.includes("UPDATE notes SET")).length;
    const deletes = calls.filter((c: any[]) => c[0]?.includes("DELETE FROM notes WHERE")).length;

    expect(inserts).toBe(2);
    expect(updates).toBe(1);
    expect(deletes).toBe(1);
  });

  it("deletes note embeddings when deleting a note", async () => {
    const existingNote: Note = {
      id: "note-embed",
      title: "Note with Embeddings",
      content: "Content that has embeddings",
      note_version: 1,
      created_at: "2025-01-01T00:00:00.000Z",
      updated_at: "2025-01-01T00:00:00.000Z",
      updated_ts: 1704067200000,
    };

    const dbService = createMockDbService([existingNote]);

    const { result } = renderHook(() => useNoteManager(dbService));

    await wtWaitFor(() => {
      expect(result.current.notes.length).toBe(1);
    });

    act(() => {
      result.current.deleteNote("note-embed");
    });

    // Verify DELETE FROM note_embeddings was called
    await wtWaitFor(() => {
      const embedDeleteCall = (dbService as any).query.mock.calls.find(
        (call: any[]) =>
          call[0]?.includes("DELETE FROM note_embeddings") &&
          Array.isArray(call[1]) &&
          call[1].length === 1,
      );
      expect(embedDeleteCall).toBeDefined();
      expect(embedDeleteCall[1]).toEqual(["note-embed"]);
    });
  });
});
