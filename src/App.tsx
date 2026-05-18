import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNoteManager } from "@/hooks/useNoteManager";
import { useSemanticSearch } from "@/hooks/useSemanticSearch";
import { useEmbeddingPipeline } from "@/hooks/useEmbeddingPipeline";
import { useTheme } from "@/hooks/useTheme";
import { DbService } from "@/hooks/useDbService";
import { GlobalHeader } from "@/components/GlobalHeader";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Sidebar } from "@/components/Sidebar";
import NoteEditor from "@/components/NoteEditor";
import { SearchResults } from "@/components/SearchResults";
import { SemanticContextPanel } from "@/components/SemanticContextPanel";
import { AIContextBar } from "@/components/AIContextBar";
import { SettingsPanel } from "@/components/SettingsPanel";
import { EmptyState } from "@/components/EmptyState";
import type { Note } from "@/types/note";
import SqliteWorker from "@/workers/sqlite.worker?worker";

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
  const sqliteWorker = useMemo(() => new SqliteWorker(), []);
  const dbServiceRef = useRef<DbService | null>(null);
  if (!dbServiceRef.current) {
    dbServiceRef.current = new DbService(sqliteWorker);
  }
  const dbService = dbServiceRef.current;
  const [isSqliteReady, setIsSqliteReady] = useState(false);
  const [sqliteError, setSqliteError] = useState<string | null>(null);

  // Initialize DB service and mark components
  useEffect(() => {
    let cancelled = false;

    dbService.initialize();
    dbService.ready
      .then(() => {
        if (cancelled) return;
        setIsSqliteReady(true);
        setSqliteError(null);
      })
      .catch((error) => {
        if (cancelled) return;
        setIsSqliteReady(false);
        setSqliteError(error instanceof Error ? error.message : "SQLite init failed");
      });

    return () => {
      cancelled = true;
      sqliteWorker.terminate();
    };
  }, [sqliteWorker]);

  const { notes, selectedNote, createNote, updateNote, selectNote } = useNoteManager(dbService);
  const { theme, isDark } = useTheme();
  const webGpuScore = useMemo(() => detectWebGpu(), []);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ noteId: string; title: string; percentage: number }>>([]);

  // Semantic search hook (uses DB with BM25 fallback)
  const { search: runSemanticSearch } = useSemanticSearch(dbService, webGpuScore);

  // Embedding pipeline
  const {
    embedNote,
    isEmbedding,
    isModelReady,
    isModelLoading,
    modelError,
    lastResult,
  } = useEmbeddingPipeline({
    dbService,
    debounceMs: 1500,
  });

  // Settings panel
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Model loaded state — driven by embedding pipeline
  const modelLoaded = isModelReady;
  const hasError = Boolean(sqliteError || modelError);
  const modelStatus = modelError
    ? "Error"
    : isModelReady
      ? "Ready"
      : isModelLoading
        ? "Loading"
        : "Idle";
  const sqliteStatus = sqliteError
    ? "Error"
    : isSqliteReady
      ? "Ready"
      : "Loading";

  // AI Context bar state
  const [aiProcessing, setAiProcessing] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Execute semantic search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults((current) => (current.length === 0 ? current : []));
      setIsSearching(false);
      return;
    }
    (async () => {
      setIsSearching(true);
      try {
        const semanticHits = await runSemanticSearch(debouncedQuery);
        // Map semantic results to the display format
        const mappedResults = semanticHits
          .map((hit) => {
            const note = notes.find((n) => n.id === hit.noteId);
            return {
              noteId: hit.noteId,
              title: note?.title || "Untitled",
              percentage: hit.percentage,
            };
          })
          .filter((r) => r.percentage > 0);
        setSearchResults(mappedResults);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    })();
  }, [debouncedQuery, notes, runSemanticSearch]);

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
    // Model loading is now automatic via embedding pipeline; this is a no-op
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
    return findRelatedNotes(selectedNote, notes).map(r => ({
      ...r,
      content: notes.find(n => n.id === r.id)?.content || ""
    }));
  }, [selectedNote, notes]);

  const noteIndexStatus = useMemo(() => {
    if (!selectedNote) return "Idle";
    if (isEmbedding) return "Indexing";
    if (lastResult?.noteId === selectedNote.id) return "Indexed";
    if (modelError) return "Error";
    return "Pending";
  }, [isEmbedding, lastResult?.noteId, modelError, selectedNote]);

  // Progress: percentage of components that are "ready" out of 4 total
  const progress = useMemo(() => {
    if (isSqliteReady && isModelReady) return 100;
    if (isSqliteReady || isModelReady) return 75;
    if (isModelLoading) return 50;
    return 25;
  }, [isModelLoading, isModelReady, isSqliteReady]);

  return (
    <div className="h-screen bg-background flex flex-col" data-testid="app-root">
      {/* Loading Overlay */}
      <LoadingOverlay
        visible={!isSqliteReady && !sqliteError}
        progress={progress}
        message={hasError ? "Initialization error — some features may be limited" : "Initializing SemanticNotes..."}
      />

      {/* Global Header */}
      <GlobalHeader
        webgpuActive={webGpuScore >= 50}
        sqliteConnected={isSqliteReady}
        sqliteSize="24MB"
        sqliteStatus={sqliteStatus}
        modelLoaded={modelLoaded}
        modelStatus={modelStatus}
        onSettingsClick={handleSettingsClick}
        onHelpClick={handleHelpClick}
        onloadModel={handleLoadModel}
      />

      <div className="sr-only" aria-live="polite">
        <span data-testid="note-index-status">{noteIndexStatus}</span>
      </div>

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
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4 max-w-xl">
                <AIContextBar
                  isProcessing={isEmbedding || aiProcessing}
                  onSummarize={handleSummarize}
                  onFinishLinks={handleFindLinks}
                />
              </div>
            </>
          ) : (
            <EmptyState onNewNote={handleNewNote} />
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