import { SearchResults } from "./SearchResults";
import type { Note } from "@/types/note";

interface SidebarProps {
  notes: Note[];
  selectedNoteId: string;
  onSelectNote: (id: string) => void;
  onNewNote: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: Array<{ noteId: string; title: string; percentage: number }>;
  isSearching: boolean;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return diffMin + "m";
  if (diffHr < 24) return diffHr + "h";
  return diffDay + "d";
}

export function Sidebar({
  notes,
  selectedNoteId,
  onSelectNote,
  onNewNote,
  searchQuery,
  onSearchChange,
  searchResults,
  isSearching,
}: SidebarProps) {
  return (
    <aside
      className="w-[20%] min-w-[240px] max-w-[320px] flex flex-col h-full border-r border-white/10 glass-panel z-10 shrink-0"
      data-testid="sidebar"
      role="navigation"
      aria-label="Notes sidebar"
    >
      {/* Search Bar */}
      <div className="p-4 border-b border-white/10">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="AI Semantic Search..."
            className="w-full bg-surface-container-highest border-0 rounded-lg pl-9 pr-4 py-2 text-body-base text-on-surface placeholder:text-on-surface-variant focus:ring-1 focus:ring-primary-fixed-dim focus:outline-none transition-all group-focus-within:ai-glow"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            data-testid="search-bar"
            aria-label="Search notes"
          />
        </div>
      </div>

      {/* Content: Search Results or Note List */}
      <div className="flex-1 overflow-y-auto py-2">
        {searchQuery && searchQuery.trim() ? (
          <SearchResults
            results={searchResults}
            onSelect={onSelectNote}
            isLoading={isSearching}
          />
        ) : (
          <nav className="flex flex-col px-2 gap-1" role="list" aria-label="Note list">
            {notes.map((note) => {
              const isSelected = note.id === selectedNoteId;
              return (
                <button
                  key={note.id}
                  type="button"
                  role="listitem"
                  onClick={() => onSelectNote(note.id)}
                  className={isSelected
                    ? "px-2 py-3 cursor-pointer flex items-center justify-between group rounded transition-all duration-200 bg-secondary-container/20 text-secondary border-r-2 border-secondary rounded-l"
                    : "px-2 py-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all duration-200 rounded cursor-pointer flex items-center justify-between group"
                  }
                  data-testid={"note-item-" + note.id}
                  aria-label={"Note: " + note.title}
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="material-symbols-outlined text-[18px]">
                      description
                    </span>
                    <span className="truncate">{note.title || "Untitled"}</span>
                  </div>
                  <span className="font-status-pill text-status-pill opacity-70">
                    {formatRelativeTime(note.updated_at)}
                  </span>
                </button>
              );
            })}
            {notes.length === 0 && (
              <div className="px-4 py-8 text-center text-on-surface-variant text-sm">
                No notes yet
              </div>
            )}
          </nav>
        )}
      </div>

      {/* New Note Button */}
      <div className="p-4 border-t border-white/10 mt-auto">
        <button
          type="button"
          onClick={onNewNote}
          className="w-full bg-primary-fixed-dim text-background font-label-caps text-label-caps py-3 rounded-lg hover:bg-primary-fixed transition-colors flex items-center justify-center gap-2 uppercase tracking-widest border border-transparent hover:border-white/20"
          data-testid="new-note-button"
          aria-label="Create new note"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          + New Note
        </button>
      </div>
    </aside>
  );
}