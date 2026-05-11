# SemanticNotes.ai — Project Directory Tree

This document maps the complete directory structure for the SemanticNotes.ai project.

## Complete Directory Tree

```
semanticnotes.ai/
├── src/
│   ├── components/          # React UI components
│   │   ├── NoteEditor/      # Note editing component
│   │   ├── NoteList/        # Note listing component
│   │   ├── SearchBar/       # Semantic search input
│   │   ├── Sidebar/        # Navigation sidebar
│   │   └── AppLayout/       # Main layout wrapper
│   ├── hooks/              # Custom React hooks
│   │   ├── useDatabase.ts  # wa-sqlite database hook
│   │   ├── useEmbedding.ts # Embedding pipeline hook
│   │   ├── useNotes.ts     # Note CRUD operations
│   │   └── useSemanticSearch.ts # Semantic search hook
│   ├── workers/            # Web Worker modules
│   │   ├── sqlite.worker.ts    # WASM SQLite worker
│   │   ├── embedding.worker.ts # Embedding pipeline worker
│   │   └── inference.worker.ts # Model inference worker
│   ├── types/              # TypeScript type definitions
│   │   ├── note.ts         # Note type definitions
│   │   ├── database.ts     # Database schema types
│   │   └── worker.ts       # Worker message types
│   ├── utils/              # Pure utility functions
│   │   ├── math.ts         # Math utilities (cosine similarity, normalization)
│   │   ├── string.ts       # String utilities (chunking, tokenization)
│   │   └── array.ts        # Array utilities (transferables, chunking)
│   ├── styles/             # Tailwind CSS configuration
│   │   └── globals.css     # Global styles
│   ├── config/             # App configuration constants
│   │   └── app.config.ts   # App configuration
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── tests/
│   ├── components/         # React component unit tests
│   │   ├── NoteEditor.test.tsx
│   │   ├── NoteList.test.tsx
│   │   ├── SearchBar.test.tsx
│   │   └── Sidebar.test.tsx
│   ├── workers/            # Web Worker integration tests
│   │   ├── sqlite.worker.test.ts
│   │   ├── embedding.worker.test.ts
│   │   └── inference.worker.test.ts
│   ├── hooks/              # Custom hook tests
│   │   ├── useDatabase.test.ts
│   │   ├── useEmbedding.test.ts
│   │   └── useNotes.test.ts
│   ├── utils/              # Utility function tests
│   │   ├── math.test.ts
│   │   ├── string.test.ts
│   │   └── array.test.ts
│   └── e2e/                # End-to-end Playwright tests
│       ├── note-management.test.ts
│       ├── semantic-search.test.ts
│       └── ui-layout.test.ts
├── docs/                   # Architecture & design documentation
│   ├── architecture/       # Architecture specifications
│   │   ├── 00_index.md
│   │   ├── 01_system-overview.md
│   │   ├── 02_storage_layer_spec.md
│   │   ├── 03_model_runtime_spec.md
│   │   ├── 04_embedding_pipeline_spec.md
│   │   ├── 05_context_window_spec.md
│   │   ├── 06_worker_threading_spec.md
│   │   ├── 07_ui_state_management_spec.md
│   │   └── adr/
│   │       ├── 001_storage_concurrency.md
│   │       ├── 002_webgpu_model_runtime.md
│   │       ├── 003_embedding_vector_pipeline.md
│   │       ├── 004_llm_context_window.md
│   │       ├── 005_worker_isolation.md
│   │       └── 006_ui_state_management.md
│   ├── design/             # UI/UX design system
│   │   ├── 01_design_system.md
│   │   └── 02_ui_layout.md
│   ├── functional/         # Functional requirements
│   │   ├── 01_note_management.md
│   │   ├── 02_semantic_search.md
│   │   ├── 03_ai_chat.md
│   │   └── 04_ui_layout.md
│   └── non-functional/     # Technical constraints
│       └── 01_technical_constraints.md
├── .github/                # Agent workspace context engine
│   ├── instructions/       # Hierarchical instruction profiles
│   │   ├── frontend-ui.instructions.md
│   │   ├── worker-wasm.instructions.md
│   │   ├── testing-suite.instructions.md
│   │   ├── dev-workflow.instructions.md
│   │   └── bug-workflow.instructions.md
│   ├── skills/             # Autonomous agent skills
│   │   ├── documentation-authoring/
│   │   │   └── SKILL.md
│   │   ├── ui-layout-integration/
│   │   │   └── SKILL.md
│   │   ├── typescript-react-audit/
│   │   │   └── SKILL.md
│   │   └── wasm-sqlite-validation/
│   │       └── SKILL.md
│   ├── agents/             # Custom agent configurations
│   │   └── default.agent.md
│   └── copilot-instructions.md
├── .vscode/                # VS Code workspace settings
│   ├── settings.json
│   ├── tasks.json
│   └── launch.json
├── public/                 # Static assets
│   ├── favicon.ico
│   └── splash.png
├── mock/                   # Visual mock-ups
│   ├── code.html
│   └── DESIGN.md
├── vite.config.ts          # Vite configuration
├── vitest.config.ts       # Vitest configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies & scripts
├── index.html             # Entry point
├── AGENTS.md              # Agent workspace configuration
├── LICENSE
└── README.md
```

## Key Directories

### `src/` — Source Code

- **`components/`**: React UI components for the note-taking interface.
- **`hooks/`**: Custom React hooks for database, embedding, and state management.
- **`workers/`**: Web Worker modules for SQLite, embedding pipeline, and model inference.
- **`types/`**: TypeScript type definitions for notes, database, and worker messages.
- **`utils/`**: Pure utility functions for math, string, and array operations.
- **`styles/`**: Tailwind CSS configuration and global styles.
- **`config/`**: App configuration constants.

### `tests/` — Test Suite

- **`components/`**: Unit tests for React components.
- **`workers/`**: Integration tests for Web Worker modules.
- **`hooks/`**: Tests for custom React hooks.
- **`utils/`**: Tests for pure utility functions.
- **`e2e/`**: End-to-end tests using Playwright.

### `docs/` — Documentation

- **`architecture/`**: Architecture specifications and ADRs.
- **`design/`**: UI/UX design system.
- **`functional/`**: Functional requirements.
- **`non-functional/`**: Technical constraints.

### `.github/` — Agent Workspace Context Engine

- **`instructions/`**: Hierarchical instruction profiles for different directories.
- **`skills/`**: Autonomous agent skills for specialized tasks.
- **`agents/`**: Custom agent configurations.
- **`copilot-instructions.md`**: Global workspace instructions.

### `.vscode/` — VS Code Workspace Settings

- **`settings.json`**: Workspace settings for TDD workflow.
- **`tasks.json`**: Automation tasks for build, test, and cleanup.
- **`launch.json`**: Debug configurations for Chrome and workers.
