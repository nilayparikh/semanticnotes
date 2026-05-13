# SemanticNotes.ai — Workspace Custom Instructions

> **Always-on instructions for all chat requests in this workspace.**
> These define the foundational architecture, technology stack, and coding standards
> for the SemanticNotes.ai project.

---

## 🏗️ Project Identity

**SemanticNotes.ai** is a **local-first, offline-capable browser application** for AI-enhanced Markdown note-taking with semantic search. The application runs entirely in the browser — no server, no API keys, no network calls required for core functionality.

### Core Philosophy

1. **Local-First**: All data lives in the browser's Origin Private File System (OPFS) via `wa-sqlite` WASM. Zero server dependencies.
2. **Offline-Ready**: WebGPU-accelerated ML inference via Transformers.js v3 runs entirely on the client.
3. **Test-Driven Development (TDD)**: Every feature ships with tests before implementation code.
4. **Agent-Optimized**: The workspace is structured for autonomous coding agents (GitHub Copilot, Claude Code) with hierarchical instruction files and discoverable skills.

---

## 🛠️ Technology Stack

| Layer        | Technology                        | Version      |
| ------------ | --------------------------------- | ------------ |
| Runtime      | Vite                              | Latest       |
| Language     | TypeScript (Strict)               | 5.x          |
| UI Framework | React                             | 18.x         |
| Styling      | Tailwind CSS                      | 3.x          |
| Database     | wa-sqlite (WASM over OPFS)        | Latest       |
| ML Runtime   | Transformers.js                   | 3.x (WebGPU) |
| Testing      | Vitest + Playwright               | Latest       |
| Embeddings   | `@xenova/transformers`            | 3.x          |
| State        | React `useReducer` + `useContext` | Built-in     |
| Concurrency  | Web Workers + `SharedArrayBuffer` | Native       |

---

## 📐 Architecture Constraints

### Concurrency Model

- **Main Thread**: UI rendering, user input, event dispatching.
- **Worker Threads**: WASM SQLite queries, embedding pipelines, model inference.
- **Communication**: `MessageChannel` with `Transferable` objects (Float32Array, ArrayBuffer) for zero-copy data passing.

### Mandatory Planning Phase

All features require a plan in `docs/plans/` before implementation.

- Regular plans: `docs/plans/<feature_name>.md`
- Drift plans: `docs/plans/drifts/<YYYY-MM-DD-HH-MM>/<phase_number>_name.md`
- Review/drift reports: `docs/review/<type>-YYYY-MM-DD.md`

**Reference**: `docs/plans/README.md` (template)

### Storage Layer

- **Primary**: `wa-sqlite` over OPFS (structuredClone-friendly, atomic commits).
- **Secondary**: `localStorage` for lightweight UI state (theme, sidebar toggle).
- **Concurrency**: Read-write lock via `SharedArrayBuffer` + `Atomics` for cross-worker consistency.

### Embedding Pipeline

- **Model**: `all-MiniLM-L6` (or configurable) via Transformers.js WebGPU runtime.
- **Dimensions**: 100–128 dimensions per note (Float32Array).
- **Pipeline**: Note text → Tokenize → Model Forward → Normalize → Store in SQLite `REAL[]` column.

### Context Window

- **LLM Context**: Sliding window of 128 dimensions, chunked at 256 tokens per note.
- **Semantic Search**: Cosine similarity threshold ≥ 0.72 across OPFS-stored embeddings.

### UI State Management

- **UI State**: Managed via `useReducer` with a single `AppContext` provider.
- **State Shape**: `{ notes: Note[], selectedNoteId: string, searchQuery: string, ui: UISlice }`
- **Persistence**: `localStorage` sync on every reducer dispatch (debounced 300ms).

---

## 📁 Directory Structure

```
semanticnotes.ai/
├── src/
│   ├── components/          # Reusable UI components (React)
│   ├── hooks/              # Custom React hooks (database, model, UI state)
│   ├── workers/            # Web Worker modules (SQLite, Embedding, Inference)
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Pure utility functions (math, string, array ops)
│   ├── styles/             # Tailwind CSS configuration
│   ├── config/             # App configuration constants
│   └── App.tsx             # Root component
├── tests/
│   ├── components/         # React component unit tests
│   ├── workers/            # Web Worker integration tests
│   ├── hooks/              # Custom hook tests
│   ├── utils/              # Utility function tests
│   └── e2e/                # End-to-end Playwright tests
├── docs/                   # Architecture & design documentation
├── .github/                # Agent workspace context engine
│   ├── instructions/       # Hierarchical instruction profiles
│   ├── prompts/            # Workflow prompts (sn_plan, sn_new, sn_change, sn_test, sn_drift)
│   ├── skills/             # Autonomous agent skills
│   └── agents/             # Custom agent configurations
├── .vscode/                # VS Code workspace settings
├── public/                 # Static assets (favicon, splash)
├── mock/                   # Visual mock-ups
├── vite.config.ts          # Vite configuration
├── vitest.config.ts        # Vitest configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies & scripts
└── index.html              # Entry point
```

---

## 🧪 TDD Workflow Rules

1. **Write the test first**: Every feature begins with a failing test in the appropriate `tests/` subdirectory.
2. **Minimal implementation**: Write the smallest amount of code to make the test pass.
3. **Refactor**: Clean up the code while tests remain green.
4. **Run tests on save**: Use the `Test: Watch Mode (TDD Loop)` task for continuous feedback.
5. **Coverage target**: ≥ 80% line coverage across `src/components` and `src/workers`.

---

## 📝 Documentation Conventions

- All documentation lives in `docs/`.
- Architecture specs in `docs/architecture/`.
- Design system in `docs/design/`.
- Functional requirements in `docs/functional/`.
- Non-functional constraints in `docs/non-functional/`.
- Use relative links to `docs/` to avoid duplicating core specifications.

---

## 🔒 Security & Performance

- **Zero external API keys** for core functionality.
- **WebGPU fallback**: Graceful degradation to WebGL → CPU when WebGPU is unavailable.
- **Memory budget**: ≤ 256MB total for WASM + Model + OPFS cache.
- **Bundle size**: ≤ 1.2MB Gzipped (excluding WASM binaries).
- **First paint**: ≤ 1.5s on mid-range laptop (Chrome 120+).

---

## 🤖 Agent Usage Guidelines

When working in this workspace, agents should:

1. **Read SKILLS-REGISTRY.md**: Check `.github/SKILLS-REGISTRY.md` for available skills
2. **Read instruction files**: Check `.github/instructions/` for directory-specific rules before making changes
3. **Use workflow prompts**: Use `.github/prompts/` for structured workflows (sn_plan, sn_new, sn_change, sn_test, sn_drift)
4. **Use skills for specialized tasks**: Discover and invoke skills in `.github/skills/` for documentation, UI layout, TS/React auditing, and WASM/SQLite validation
5. **Follow TDD**: Write a test before touching implementation code
6. **Reference docs**: Use `docs/` for architectural context instead of guessing
7. **Keep it local-first**: Avoid introducing server dependencies unless explicitly specified
8. **Follow best practices**: All agent workflows must comply with `docs/code-agents/best-practices.md`
9. **Drift plans use timestamps**: Drift plans live in `docs/plans/drifts/<YYYY-MM-DD-HH-MM>/` format
