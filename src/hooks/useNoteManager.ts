import { useReducer, useCallback, useEffect, useRef } from "react";
import { Note, NoteCreateData, NoteUpdateData } from "@/types/note";
import type { DbServiceInterface } from "@/types/database";

type NoteId = string;

type Action =
  | { type: "CREATE_NOTE"; note: Note }
  | { type: "UPDATE_NOTE"; id: NoteId; data: Partial<Note> }
  | { type: "DELETE_NOTE"; id: NoteId }
  | { type: "SELECT_NOTE"; id: NoteId }
  | { type: "HYDRATE_NOTES"; notes: Note[] };

interface State {
  notes: Note[];
  selectedNoteId: NoteId | undefined;
}

const initialState: State = {
  notes: [],
  selectedNoteId: undefined,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "CREATE_NOTE":
      return {
        ...state,
        notes: [...state.notes, action.note],
        selectedNoteId: action.note.id,
      };
    case "UPDATE_NOTE": {
      const notes = state.notes.map((n) => {
        if (n.id === action.id) {
          const updated = {
            ...n,
            ...action.data,
            note_version: (n.note_version ?? 0) + 1,
            updated_at: new Date().toISOString(),
            updated_ts: Date.now(),
          };
          return updated;
        }
        return n;
      });
      return { ...state, notes };
    }
    case "DELETE_NOTE":
      const notes = state.notes.filter((n) => n.id !== action.id);
      const selectedNoteId =
        state.selectedNoteId === action.id ? undefined : state.selectedNoteId;
      return { ...state, notes, selectedNoteId };
    case "SELECT_NOTE":
      return { ...state, selectedNoteId: action.id };
    case "HYDRATE_NOTES":
      return {
        ...state,
        notes: action.notes,
      };
    default:
      return state;
  }
}

export function useNoteManager(dbService?: DbServiceInterface) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { notes, selectedNoteId } = state;
  const hydratedRef = useRef(false);

  // Hydrate notes from SQLite on mount
  useEffect(() => {
    if (!dbService || hydratedRef.current) return;
    hydratedRef.current = true;

    const hydrate = async () => {
      try {
        await dbService.ready;
        const rows = await dbService.query("SELECT * FROM notes");
        if (Array.isArray(rows)) {
          await dbService.query("DELETE FROM notes_fts");
          await dbService.query(
            "INSERT INTO notes_fts (note_id, title, content) SELECT id, title, content FROM notes",
          );
          dispatch({ type: "HYDRATE_NOTES", notes: rows as Note[] });
        }
      } catch (err) {
        console.warn("useNoteManager: hydration failed", err);
      }
    };

    hydrate();
  }, [dbService]);

  const createNote = useCallback(
    (data: NoteCreateData): string => {
      const now = new Date().toISOString();
      const ts = Date.now();
      const id = crypto.randomUUID();
      const note: Note = {
        id,
        title: data.title,
        content: data.content,
        note_version: 1,
        created_at: now,
        updated_at: now,
        updated_ts: ts,
      };
      dispatch({ type: "CREATE_NOTE", note });

      // Persist to SQLite
      if (dbService) {
        void (async () => {
          await dbService.query(
            "INSERT INTO notes (id, title, content, note_version, created_at, updated_at, updated_ts) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [id, note.title, note.content, note.note_version, note.created_at, note.updated_at, note.updated_ts],
          );
          await dbService.query(
            "INSERT INTO notes_fts (note_id, title, content) VALUES (?, ?, ?)",
            [id, note.title, note.content],
          );
        })().catch((err) => console.warn("useNoteManager: CREATE_NOTE insert failed", err));
      }

      return id;
    },
    [dbService],
  );

  const updateNote = useCallback(
    (id: NoteId, data: NoteUpdateData) => {
      dispatch({ type: "UPDATE_NOTE", id, data });

      // Persist to SQLite after reducer updates
      if (dbService) {
        const now = new Date().toISOString();
        const ts = Date.now();
        const currentNote = state.notes.find((n) => n.id === id);
        const title = data.title ?? currentNote?.title ?? "";
        const content = data.content ?? currentNote?.content ?? "";

        void (async () => {
          await dbService.query(
            "UPDATE notes SET title = ?, content = ?, note_version = note_version + 1, updated_at = ?, updated_ts = ? WHERE id = ?",
            [title, content, now, ts, id],
          );
          await dbService.query(
            "UPDATE notes_fts SET title = ?, content = ? WHERE note_id = ?",
            [title, content, id],
          );
        })().catch((err) => console.warn("useNoteManager: UPDATE_NOTE update failed", err));
      }
    },
    [dbService, state.notes],
  );

  const deleteNote = useCallback(
    (id: NoteId) => {
      dispatch({ type: "DELETE_NOTE", id });

      // Persist to SQLite
      if (dbService) {
        void (async () => {
          await dbService.query("DELETE FROM notes WHERE id = ?", [id]);
          await dbService.query("DELETE FROM notes_fts WHERE note_id = ?", [id]);
          await dbService.query("DELETE FROM note_embeddings WHERE note_id = ?", [id]);
        })().catch((err) => console.warn("useNoteManager: DELETE_NOTE delete failed", err));
      }
    },
    [dbService],
  );

  const selectNote = useCallback((id: NoteId) => {
    dispatch({ type: "SELECT_NOTE", id });
  }, []);

  const listNotes = useCallback((): Note[] => {
    return [...notes];
  }, [notes]);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  return {
    notes,
    selectedNote,
    createNote,
    updateNote,
    deleteNote,
    selectNote,
    listNotes,
  };
}
