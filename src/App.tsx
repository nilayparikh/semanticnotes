import React from "react";
import { Sidebar } from "./components/Sidebar";
import { ContextPanel } from "./components/ContextPanel";
import NoteEditor from "./components/NoteEditor";
import type { Note } from "./types/note";

function App() {
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = React.useState<string>("");

  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
  };

  const handleNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled",
      content: "",
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_ts: Date.now(),
    };
    setNotes(prev => [...prev, newNote]);
    setSelectedNoteId(newNote.id);
  };

  const handleSearch = (_query: string) => {
    // Search logic will be connected to embedding pipeline later
  };

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  const handleUpdate = (data: { title?: string; content?: string }) => {
    setNotes(prev =>
      prev.map(n =>
        n.id === selectedNoteId ? { ...n, ...data, updated_at: new Date().toISOString(), updated_ts: Date.now() } : n
      )
    );
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header with Status Badges */}
      <header className="glass-panel px-4 py-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h1 className="text-primary font-geist text-lg">SemanticNotes.ai</h1>
          <div className="flex gap-2">
            <span className="glass-panel px-2 py-1 text-xs text-secondary">● WebGPU</span>
            <span className="glass-panel px-2 py-1 text-xs text-secondary">● SQLite</span>
          </div>
        </div>
      </header>

      {/* 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (20%) */}
        <Sidebar
          notes={notes}
          selectedNoteId={selectedNoteId}
          onSelectNote={handleSelectNote}
          onNewNote={handleNewNote}
          onSearch={handleSearch}
        />

        {/* Editor (55%) */}
        <main className="flex-[55%] glass-panel">
          {selectedNote ? (
            <NoteEditor note={selectedNote} onUpdate={handleUpdate} />
          ) : (
            <div className="flex items-center justify-center h-full text-on-surface-variant font-geist">
              Select or create a note to begin
            </div>
          )}
        </main>

        {/* Context Panel (25%) */}
        <ContextPanel />
      </div>
    </div>
  );
}

export default App;
