import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNoteManager } from "@/hooks/useNoteManager";
import { useSemanticSearch, SemanticSearchResult } from "@/hooks/useSemanticSearch";
import { useEmbeddingPipeline } from "@/hooks/useEmbeddingPipeline";
import { useTheme } from "@/hooks/useTheme";
import { GlobalHeader } from "@/components/GlobalHeader";
import { Sidebar } from "@/components/Sidebar";
import NoteEditor from "@/components/NoteEditor";
import { SearchResults } from "@/components/SearchResults";
import { SemanticContextPanel } from "@/components/SemanticContextPanel";
import { AIContextBar } from "@/components/AIContextBar";
import { SettingsPanel } from "@/components/SettingsPanel";
import type { Note } from "@/types/note";

/* ------------------------------------------------------------------ */
/*  In-memory DB service mock                                          */
/* ------------------------------------------------------------------ */

interface DbServiceInterface {
  initialize(): Promise<void>;
  query: (sql: string, params?: any[]) => Promise<any>;
  ready: Promise<void>;
}

class InMemoryDbService implements DbServiceInterface {
  private data: Map<string, any[]> = new Map();
  private resolveReady: () => void = () => {};
  ready = new Promise<void>((resolve) => { this.resolveReady = resolve; });

  constructor() {
    // Simulate async init
    setTimeout(() => this.resolveReady(), 0);
  }

  initialize(): Promise<void> {
    return this.ready;
  }

  async query(sql: string, _params: any[] = []): Promise<any> {
    await this.ready;
    const key = sql.split("FROM")[1]?.trim().split(/\s/)[0];
    return this.data.get(key) || [];
  }

  setTable(name: string, rows: any[]) {
    this.data.set(name, rows);
  }
}

/* ------------------------------------------------------------------ */
/*  WebGPU Detection                                                   */
/* ------------------------------------------------------------------ */

function detectWebGpu(): number {
  if (typeof navigator !== "undefined" && (navigator as Navigator & { gpu?: unknown }).gpu) {
    return 85;
  }
  if (typeof document !== "undefined") {
    return 50;
  }
  return 30;
}

/* ------------------------------------------------------------------ */
/*  Keyword-based keyword search fallback                              */
/* ------------------------------------------------------------------ */

function keywordSearch(query: string, notes: Note[]): Array<{ noteId: string; title: string; percentage: number }> {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return notes
    .map((note) => {
      const title = (note.title || "").toLowerCase();
      const content = (note.content || "").toLowerCase();
      let score = 0;
      if (title.includes(q)) score += 50;
      if (content.includes(q)) score += 30;
      const titleWords = title.split(/\s+/);
      const queryWords = q.split(/\s+/);
      for (const qw of queryWords) {
        if (titleWords.some((tw) => tw.includes(qw))) score += 10;
      }
      return { noteId: note.id, title: note.title || "Untitled", percentage: Math.min(99, Math.round(score)) };
    })
    .filter((r) => r.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);
}

/* ------------------------------------------------------------------ */
/*  Auto-tag extraction (simple keyword extraction)                    */
/* ------------------------------------------------------------------ */

function extractTags(content: string): string[] {
  const keywords = ["webgpu", "sqlite", "ai", "markdown", "opfs", "wasm", "react", "typescript", "embedding", "vector", "rag", "llm", "transformers"];
  const lower = content.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw)).map((kw) => "#" + kw);
}

/* ------------------------------------------------------------------ */
/*  Related notes (keyword overlap simulation)                         */
/* ------------------------------------------------------------------ */

function findRelatedNotes(currentNote: Note, allNotes: Note[]): Array<{ id: string; title: string; similarity: number }> {
  const currentWords = new Set((currentNote.content || "").toLowerCase().split(/\s+/));
  return allNotes
    .filter((n) => n.id !== currentNote.id)
    .map((n) => {
      const words = new Set((n.content || "").toLowerCase().split(/\s+/));
      let overlap = 0;
      for (const w of currentWords) {
        if (words.has(w)) overlap++;
      }
      const similarity = currentWords.size > 0 ? overlap / currentWords.size : 0;
      return { id: n.id, title: n.title || "Untitled", similarity };
    })
    .filter((r) => r.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
}

/* ------------------------------------------------------------------ */
/*  Main App                                                           */
/* ------------------------------------------------------------------ */

export default function App() {
  const { notes, selectedNote, createNote, updateNote, selectNote } = useNoteManager();
  const { theme, isDark } = useTheme();
  const webGpuScore = useMemo(() => detectWebGpu(), []);
  const dbService = useRef(new InMemoryDbService());

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ noteId: string; title: string; percentage: number }>>([]);

  // Semantic search hook (uses DB, but we also do keyword fallback)
  const { results: semanticResults } = useSemanticSearch(dbService.current, webGpuScore);

  // Embedding pipeline
  const { embedNote, isEmbedding } = useEmbeddingPipeline({
    debounceMs: 1500,
  });

  // Settings panel
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Model loaded state
  const [modelLoaded, setModelLoaded] = useState(false);

  // AI Context bar state
  const [aiProcessing, setAiProcessing] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Execute search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
      const results = keywordSearch(debouncedQuery, notes);
      setSearchResults(results);
      setIsSearching(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [debouncedQuery, notes]);

  // Embed note content on change (debounced via hook)
  useEffect(() => {
    if (selectedNote) {
      embedNote(selectedNote.id, selectedNote.content);
    }
  }, [selectedNote?.content, selectedNote, embedNote]);

  // Handlers
  const handleNewNote = useCallback(() => {
    createNote({ title: "Untitled", content: "" });
  }, [createNote]);

  const handleSelectNote = useCallback((id: string) => {
    selectNote(id);
    setSearchQuery("");
  }, [selectNote]);

  const handleUpdateNote = useCallback(
    (data: { title?: string; content?: string }) => {
      if (selectedNote) {
        updateNote(selectedNote.id, { ...data, note_version: selectedNote.note_version });
      }
    }, [selectedNote, updateNote]
  );

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSettingsClick = useCallback(() => {
    setSettingsOpen((prev) => !prev);
  }, []);

  const handleHelpClick = useCallback(() => {
    window.open("https://github.com/semanticnotes/semanticnotes.ai", "_blank");
  }, []);

  const handleLoadModel = useCallback(() => {
    setModelLoaded(true);
  }, []);

  const handleSummarize = useCallback(() => {
    setAiProcessing(true);
    setTimeout(() => setAiProcessing(false), 2000);
  }, []);

  const handleFindLinks = useCallback(() => {
    setAiProcessing(true);
    setTimeout(() => setAiProcessing(false), 2000);
  }, []);

  // Derived: tags and related notes for context panel
  const tags = useMemo(() => {
    if (!selectedNote) return [];
    return extractTags(selectedNote.content);
  }, [selectedNote]);

  const relatedNotes = useMemo(() => {
    if (!selectedNote) return [];
    return findRelatedNotes(selectedNote, notes);
  }, [selectedNote, notes]);

  return (
    <div className="h-screen bg-background flex flex-col" data-testid="app-root">
      {/* Global Header */}
      <GlobalHeader
        webgpuActive={webGpuScore >= 50}
        sqliteConnected
        sqliteSize="24MB"
        modelLoaded={modelLoaded}
        onSettingsClick={handleSettingsClick}
        onHelpClick={handleHelpClick}
        onloadModel={handleLoadModel}
      />

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (20%) */}
        <Sidebar
          notes={notes}
          selectedNoteId={selectedNote?.id || ""}
          onSelectNote={handleSelectNote}
          onNewNote={handleNewNote}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          searchResults={searchResults}
          isSearching={isSearching}
        />

        {/* Center: Editor (flex-1) */}
        <main className="flex-1 flex flex-col h-full bg-[#0A0A0A] relative min-w-[500px]" data-testid="main-editor">
          {selectedNote ? (
            <>
              <NoteEditor note={selectedNote} onUpdate={handleUpdateNote} />
              {/* Floating AI Context Bar */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4 max-w-xl glass-panel rounded-full px-6 py-3 flex items-center justify-between ai-glow">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-fixed-dim animate-pulse">
                    auto_awesome
                  </span>
                  <span className="text-on-surface-variant text-sm">
                    {isEmbedding ? "Embedding in progress..." : "AI is analyzing context..."}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSummarize}
                    className="text-xs px-3 py-1 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
                    data-testid="summarize-button"
                    aria-label="Summarize note"
                  >
                    Summarize
                  </button>
                  <button
                    type="button"
                    onClick={handleFindLinks}
                    className="text-xs px-3 py-1 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
                    data-testid="find-links-button"
                    aria-label="Find semantic links"
                  >
                    Find Links
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-on-surface-variant font-geist">
              Select or create a note to begin
            </div>
          )}
        </main>

        {/* Right Panel (25%) */}
        <aside className="w-[25%] min-w-[280px] max-w-[360px] flex flex-col h-full border-l border-white/10 glass-panel z-10 shrink-0" data-testid="right-panel">
          <SemanticContextPanel tags={tags} relatedNotes={relatedNotes} />
        </aside>
      </div>

      {/* Settings Panel Modal */}
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}