import { useMemo } from "react";
import { Note } from "@/types/note";
import { getRelativeTime } from "@/utils/relative-time";

export interface NoteListProps {
  notes: Note[];
  selectedNoteId: string;
  onSelect: (id: string) => void;
}

/**
 * Renders a hierarchical list of notes sorted by `updated_at` DESC.
 * Uses glassmorphic dark theme with ARIA attributes for accessibility.
 */
export function NoteList({ notes, selectedNoteId, onSelect }: NoteListProps) {
  const sortedNotes = useMemo(
    () =>
      [...notes].sort(
        (a, b) =>
          new Date(b.updated_at).getTime() -
          new Date(a.updated_at).getTime(),
      ),
    [notes],
  );

  return (
    <ul className="space-y-1" data-testid="note-list" role="listbox">
      {sortedNotes.map((note) => {
        const isSelected = note.id === selectedNoteId;

        return (
          <li key={note.id} role="option" aria-selected={isSelected}>
            <button
              type="button"
              data-testid={`note-item-${note.id}`}
              onClick={() => onSelect(note.id)}
              className={`w-full text-left px-3 py-2 rounded-md border transition-colors font-geist glass-panel hover:bg-white/5 ${
                isSelected
                  ? "border-primary text-on-surface font-medium"
                  : "border-transparent text-on-surface-variant"
              }`}
            >
              <div className="text-sm truncate text-on-surface">
                {note.title}
              </div>
              <div className="text-xs text-on-surface-variant font-jetbrains">
                {getRelativeTime(note.updated_ts)}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
