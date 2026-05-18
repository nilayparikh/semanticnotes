# User Flows — SemanticNotes.ai

> Step-by-step user flows based on functional requirements.
> Each flow maps to acceptance criteria and E2E test coverage.

---

## Flow 1: Note Creation & Editing

**Trigger**: User wants to create a new note.

### Steps

1. **Initial State**: App loads with welcome screen (`EmptyState` component)
   - Shows app logo, title, feature badges, "+ New Note" CTA
2. **Create Note**: User clicks "+ New Note" button
   - From welcome screen OR from sidebar bottom button
3. **New Note Appears**: Sidebar updates with "Untitled" note
   - Note is auto-selected
   - Editor pane opens with empty textarea
4. **Edit Title**: User types in the title area (top of editor)
   - Title updates in real-time in sidebar
5. **Edit Content**: User types Markdown in textarea
   - Live preview renders below the divider
   - Auto-save triggers after 1000ms debounce
6. **Note Persists**: Content saved to SQLite via worker

### Edge Cases

- **Empty title**: Shows "Untitled" in sidebar
- **Rapid typing**: Debounced save prevents excessive DB writes
- **Browser refresh**: Notes restored from SQLite OPFS

### Test Coverage

- `tests/e2e/note-lifecycle.test.ts` — "should create a new note from welcome screen"
- `tests/e2e/note-lifecycle.test.ts` — "should edit note title and content"

---

## Flow 2: Semantic Search

**Trigger**: User wants to find notes by meaning, not just keywords.

### Steps

1. **Focus Search**: User clicks search input in sidebar
   - Placeholder: "AI Semantic Search..."
2. **Type Query**: User types natural language query
   - Example: "notes about WebGPU setup"
3. **Embedding Generation**: Query is embedded via WebGPU (384-dim vector)
   - Falls back to BM25 keyword search if WebGPU unavailable
4. **Similarity Computation**: Cosine similarity against all note vectors
5. **Results Display**: Top matches shown in sidebar with percentage scores
   - Example: "SQLite WASM Setup — 94%"
6. **Select Result**: User clicks a result
   - Editor navigates to that note
   - Search query is cleared

### Edge Cases

- **No results**: Shows "No matching notes" message
- **WebGPU unavailable**: Falls back to BM25/keyword search
- **Empty query**: Shows all notes (default list)

### Test Coverage

- `tests/e2e/search.test.ts` — "should filter notes when typing in search"
- `tests/e2e/search.test.ts` — "should clear search when selecting a note"

---

## Flow 3: AI Chat (RAG)

**Trigger**: User wants to ask questions about their notes.

### Steps

1. **Load Model**: User clicks "Load Model" button in header
   - Model downloads to OPFS (if not cached)
   - Progress indicator shows download status
2. **Model Ready**: Status badge shows "Loaded" with green pulse
3. **Type Question**: User types in chat input at bottom of right panel
   - Placeholder: "Ask anything about your notes..."
4. **RAG Pipeline**:
   - Query is embedded into vector
   - Top 2 most similar notes retrieved from DB
   - System prompt constructed with context + question
5. **AI Response**: LLM streams tokens to chat thread
   - User message: right-aligned, primary accent
   - AI message: left-aligned, secondary accent
6. **Context Display**: Related notes shown in "Semantically Related" section

### Edge Cases

- **Model not loaded**: Shows "Load Model" prompt
- **No relevant notes**: AI responds with "no relevant context found"
- **Network error**: Graceful fallback, retry option

### Test Coverage

- `tests/e2e/user-flows.test.ts` — "should load AI model and chat"

---

## Flow 4: Note Selection & Navigation

**Trigger**: User wants to switch between notes.

### Steps

1. **View Note List**: Sidebar shows all notes with relative timestamps
   - Active note: highlighted with secondary border
   - Inactive notes: muted typography
2. **Click Note**: User clicks a note in sidebar
   - Editor loads note content
   - AI Insights panel updates (tags, related notes)
3. **Keyboard Navigation**: Arrow keys navigate note list (optional)

### Edge Cases

- **No notes**: Sidebar shows "No notes yet" message
- **Deleted note**: Removed from list, empty state shown

### Test Coverage

- `tests/e2e/note-lifecycle.test.ts` — "should create a new note from sidebar button"

---

## Flow 5: Settings & Configuration

**Trigger**: User wants to adjust app settings.

### Steps

1. **Open Settings**: User clicks gear icon in header
2. **Settings Panel**: Modal/panel opens with options:
   - Theme toggle (dark/light)
   - Model management (load/unload)
   - Database info (size, reset)
3. **Make Changes**: User toggles options
4. **Close Settings**: Click outside or close button

### Test Coverage

- `tests/e2e/user-flows.test.ts` — "should open and interact with settings"

---

## Flow 6: Auto-Tags & Related Notes

**Trigger**: User views AI Insights panel for current note.

### Steps

1. **Select Note**: User opens a note with content
2. **Auto-Tags Generated**: Keywords extracted from content
   - Example: `#webgpu`, `#sqlite`, `#ai`
3. **Related Notes Found**: Semantic similarity computed
   - Top 5 related notes displayed with similarity scores
4. **Click Related**: User clicks a related note
   - Navigates to that note

### Test Coverage

- `tests/components/EmptyState.test.tsx` — Component rendering

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User Opens App                        │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Welcome Screen (EmptyState)               │
│  ┌─────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │  Logo   │  │   Title      │  │  "+ New Note" Button    │ │
│  └─────────┘  └──────────────┘  └─────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │ Click
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      3-Column Layout                         │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ Sidebar  │  │   Editor     │  │   AI Insights Panel    │ │
│  │ (Notes)  │  │ (Markdown)   │  │ (Tags/Chat/Metrics)    │ │
│  └──────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## E2E Test Matrix

| Flow            | Test File                | Test Case            | Status |
| --------------- | ------------------------ | -------------------- | ------ |
| Note Creation   | `note-lifecycle.test.ts` | Create from welcome  | ✅     |
| Note Creation   | `note-lifecycle.test.ts` | Create from sidebar  | ✅     |
| Note Editing    | `note-lifecycle.test.ts` | Edit title/content   | ✅     |
| Semantic Search | `search.test.ts`         | Search input visible | ✅     |
| Semantic Search | `search.test.ts`         | Filter notes         | ✅     |
| User Journey    | `user-flows.test.ts`     | Full lifecycle       | 📝     |
| Settings        | `user-flows.test.ts`     | Open settings        | 📝     |

---

## References

- [Note Management Spec](./01_note_management.md)
- [Semantic Search Spec](./02_semantic_search.md)
- [AI Chat Spec](./03_ai_chat.md)
- [UI Layout Spec](./04_ui_layout.md)
