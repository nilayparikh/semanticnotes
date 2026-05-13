import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNoteManager } from "../../src/hooks/useNoteManager";

describe("useNoteManager", () => {
  describe("CREATE_NOTE", () => {
    it("creates a new note with crypto.randomUUID() ID", () => {
      const randomUUIDSpy = vi
        .spyOn(crypto, "randomUUID")
        .mockReturnValue("uuid-1");

      const { result } = renderHook(() => useNoteManager());

      act(() => {
        const id = result.current.createNote({
          title: "Test Note",
          content: "Test Content",
        });
        expect(id).toBe("uuid-1");
      });

      expect(result.current.notes.length).toBe(1);
      expect(result.current.notes[0].title).toBe("Test Note");
      expect(result.current.notes[0].note_version).toBe(1);
      expect(result.current.notes[0].created_at).toBeDefined();
      expect(result.current.notes[0].updated_at).toBeDefined();
      expect(result.current.notes[0].updated_ts).toBeDefined();

      randomUUIDSpy.mockRestore();
    });

    it("sets selectedNote to the newly created note", () => {
      vi.spyOn(crypto, "randomUUID").mockReturnValue("uuid-2");

      const { result } = renderHook(() => useNoteManager());

      act(() => {
        result.current.createNote({
          title: "Selected Note",
          content: "Content",
        });
      });

      expect(result.current.selectedNote).toBeDefined();
      expect(result.current.selectedNote?.title).toBe("Selected Note");
    });
  });

  describe("UPDATE_NOTE", () => {
    it("updates an existing note", () => {
      vi.spyOn(crypto, "randomUUID").mockReturnValue("uuid-3");

      const { result } = renderHook(() => useNoteManager());

      let noteId: string;
      act(() => {
        noteId = result.current.createNote({
          title: "Original",
          content: "Old Content",
        });
      });

      expect(result.current.notes[0].title).toBe("Original");

      act(() => {
        result.current.updateNote(noteId, {
          title: "Updated",
          note_version: 2,
        });
      });

      expect(result.current.notes[0].title).toBe("Updated");
      expect(result.current.notes[0].note_version).toBe(2);
    });

    it("updates the updated_at and updated_ts fields", () => {
      vi.spyOn(crypto, "randomUUID").mockReturnValue("uuid-4");

      const { result } = renderHook(() => useNoteManager());

      let noteId: string;
      act(() => {
        noteId = result.current.createNote({
          title: "Timestamp Test",
          content: "Content",
        });
      });

      const originalUpdatedTs = result.current.notes[0].updated_ts;

      act(() => {
        result.current.updateNote(noteId, {
          title: "Updated",
          note_version: 2,
        });
      });

      expect(result.current.notes[0].updated_at).toBeDefined();
      expect(result.current.notes[0].updated_ts).toBeDefined();
    });
  });

  describe("DELETE_NOTE", () => {
    it("removes a note by ID", () => {
      vi.spyOn(crypto, "randomUUID").mockReturnValue("uuid-5");

      const { result } = renderHook(() => useNoteManager());

      let noteId: string;
      act(() => {
        noteId = result.current.createNote({
          title: "To Delete",
          content: "Content",
        });
      });

      expect(result.current.notes.length).toBe(1);

      act(() => {
        result.current.deleteNote(noteId);
      });

      expect(result.current.notes.length).toBe(0);
    });

    it("clears selectedNote if the selected note is deleted", () => {
      vi.spyOn(crypto, "randomUUID").mockReturnValue("uuid-6");

      const { result } = renderHook(() => useNoteManager());

      let noteId: string;
      act(() => {
        noteId = result.current.createNote({
          title: "Selected",
          content: "Content",
        });
      });

      expect(result.current.selectedNote).toBeDefined();

      act(() => {
        result.current.deleteNote(noteId);
      });

      expect(result.current.selectedNote).toBeUndefined();
    });

    it("preserves selection when deleting an unselected note", () => {
      vi.spyOn(crypto, "randomUUID")
        .mockReturnValueOnce("uuid-7")
        .mockReturnValueOnce("uuid-8");

      const { result } = renderHook(() => useNoteManager());

      let noteIdA: string;
      let noteIdB: string;
      act(() => {
        noteIdA = result.current.createNote({
          title: "Note A",
          content: "Content A",
        });
        noteIdB = result.current.createNote({
          title: "Note B",
          content: "Content B",
        });
      });

      act(() => {
        result.current.selectNote(noteIdA);
      });

      expect(result.current.selectedNote?.title).toBe("Note A");

      act(() => {
        result.current.deleteNote(noteIdB);
      });

      expect(result.current.selectedNote?.title).toBe("Note A");
      expect(result.current.notes.length).toBe(1);
    });
  });

  describe("SELECT_NOTE", () => {
    it("selects a note by ID", () => {
      vi.spyOn(crypto, "randomUUID")
        .mockReturnValueOnce("uuid-9")
        .mockReturnValueOnce("uuid-10");

      const { result } = renderHook(() => useNoteManager());

      let noteIdA: string;
      let noteIdB: string;
      act(() => {
        noteIdA = result.current.createNote({
          title: "Note A",
          content: "Content A",
        });
        noteIdB = result.current.createNote({
          title: "Note B",
          content: "Content B",
        });
      });

      act(() => {
        result.current.selectNote(noteIdB);
      });

      expect(result.current.selectedNote?.title).toBe("Note B");
    });
  });

  describe("listNotes", () => {
    it("returns all notes", () => {
      vi.spyOn(crypto, "randomUUID")
        .mockReturnValueOnce("uuid-11")
        .mockReturnValueOnce("uuid-12");

      const { result } = renderHook(() => useNoteManager());

      act(() => {
        result.current.createNote({
          title: "Note 1",
          content: "Content 1",
        });
        result.current.createNote({
          title: "Note 2",
          content: "Content 2",
        });
      });

      const listed = result.current.listNotes();
      expect(listed.length).toBe(2);
    });
  });

  describe("integration", () => {
    it("handles a full CRUD lifecycle", () => {
      vi.spyOn(crypto, "randomUUID").mockReturnValue("uuid-13");

      const { result } = renderHook(() => useNoteManager());

      // Create
      let noteId: string;
      act(() => {
        noteId = result.current.createNote({
          title: "Lifecycle Note",
          content: "Initial",
        });
      });
      expect(result.current.notes.length).toBe(1);

      // Update
      act(() => {
        result.current.updateNote(noteId, {
          title: "Updated",
          note_version: 2,
        });
      });
      expect(result.current.notes[0].title).toBe("Updated");

      // Select
      act(() => {
        result.current.selectNote(noteId);
      });
      expect(result.current.selectedNote?.title).toBe("Updated");

      // Delete
      act(() => {
        result.current.deleteNote(noteId);
      });
      expect(result.current.notes.length).toBe(0);
      expect(result.current.selectedNote).toBeUndefined();
    });
  });
});
