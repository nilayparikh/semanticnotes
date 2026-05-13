import { NoteList } from "./NoteList";
import NewNoteButton from "./NewNoteButton";
import type { Note } from "@/types/note";

interface SidebarProps {
  notes: Note[];
  selectedNoteId: string;
  onSelectNote: (id: string) => void;
  onNewNote: () => void;
  onSearch: (query: string) => void;
}

export function Sidebar({
  notes,
  selectedNoteId,
  onSelectNote,
  onNewNote,
  onSearch,
}: SidebarProps) {
  return (
    <aside className="w-[20%] glass-panel border-r border-white/10 flex flex-col">
      <div className="p-4">
        <input
          type="text"
          placeholder="AI Semantic Search..."
          className="glass-panel w-full px-3 py-2 text-sm text-on-surface border-none focus:outline-none focus:border-b focus:border-primary"
          onChange={(e) => onSearch(e.target.value)}
          data-testid="search-bar"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <NoteList
          notes={notes}
          selectedNoteId={selectedNoteId}
          onSelect={onSelectNote}
        />
      </div>
      <div className="p-4">
        <NewNoteButton onClick={onNewNote} />
      </div>
    </aside>
  );
}
