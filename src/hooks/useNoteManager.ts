import { useReducer, useCallback } from "react";
import { Note, NoteCreateData, NoteUpdateData } from "@/types/note";

type NoteId = string;

type Action =
  | { type: "CREATE_NOTE"; note: Note }
  | { type: "UPDATE_NOTE"; id: NoteId; data: Partial<Note> }
  | { type: "DELETE_NOTE"; id: NoteId }
  | { type: "SELECT_NOTE"; id: NoteId };

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
    default:
      return state;
  }
}

export function useNoteManager() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { notes, selectedNoteId } = state;

  const createNote = useCallback((data: NoteCreateData): string => {
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
    return id;
  }, []);

  const updateNote = useCallback((id: NoteId, data: NoteUpdateData) => {
    dispatch({ type: "UPDATE_NOTE", id, data });
  }, []);

  const deleteNote = useCallback((id: NoteId) => {
    dispatch({ type: "DELETE_NOTE", id });
  }, []);

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
