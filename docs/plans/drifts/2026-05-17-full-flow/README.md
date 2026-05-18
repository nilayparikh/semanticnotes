---
title: "Full Flow Wiring — Drift Remediation Index"
plan_id: "drift-2026-05-17-full-flow"
status: "Draft"
author: "Planning Agent"
created: "2026-05-17"
updated: "2026-05-17"
completed: null
priority: "Critical"
story_points: 18
effort_days: 2
depends_on: []
depends_on_external: []
phase: null
parent_drift_index: null
source_drifts: ["drift-2026-05-17-ui-functional-assessment"]
archived_date: null
archive_log: null
---

# Full Flow Wiring — Drift Remediation Plan

## Objective

Wire all existing components, hooks, and workers into a functional end-to-end user experience. The application currently has all the building blocks (components, hooks, workers) but they are not connected. This plan addresses every gap identified in the assessment report.

## Assessment Source

`docs/review/drift-2026-05-17-ui-functional-assessment.md`

## Current State Summary

| Layer                 | Created                    | Wired   | Gap                                                                           |
| --------------------- | -------------------------- | ------- | ----------------------------------------------------------------------------- |
| Components (21 files) | ✅                         | Partial | `LoadingOverlay`, `SemanticSearchInput`, `VectorMetrics` not rendered         |
| Hooks (13 files)      | ✅                         | Partial | `useDbService`, `useRagPipeline`, `useLoadingState`, `useModelManager` unused |
| Workers (4 files)     | ✅                         | ❌      | `sqlite.worker`, `embedding.worker`, `llm.worker` not instantiated            |
| Storage               | In-memory `DbService` mock | ✅      | No real SQLite persistence                                                    |
| Search                | Keyword fallback only      | ✅      | No query embedding or vector search                                           |
| Chat                  | Simulated response         | ✅      | No RAG pipeline or LLM generation                                             |
| Model                 | `handleLoadModel` stub     | ✅      | No download, consent, or lifecycle UI                                         |
| Loading               | Hook + component exist     | ❌      | Not rendered in App                                                           |

## Task Groups (Execution Order)

Each group is a self-contained, reviewable unit. Groups build on each other sequentially.

| Group | Plan File                       | Story Points | Depends On | Description                                                        |
| ----- | ------------------------------- | ------------ | ---------- | ------------------------------------------------------------------ |
| 1     | `01_wire_sqlite_storage.md`     | 4            | —          | Connect `useNoteManager` to real SQLite via `useDbService`         |
| 2     | `02_wire_semantic_search.md`    | 3            | Group 1    | Replace keyword search with `useSemanticSearch` + embedding worker |
| 3     | `03_wire_chat_rag.md`           | 4            | Group 1    | Wire `AIChat` → `useRagPipeline` → `llm.worker`                    |
| 4     | `04_startup_loading_overlay.md` | 2            | Group 1    | Render `LoadingOverlay` with `useLoadingState` orchestration       |
| 5     | `05_model_download_ui.md`       | 3            | Group 1    | Add model download consent, progress, and lifecycle controls       |
| 6     | `06_polish_right_panel.md`      | 2            | Group 2, 3 | Align right panel with mock (related notes, metrics, chat header)  |

## Dependency Graph

```
Group 1: Wire SQLite Storage
├── Group 2: Wire Semantic Search
├── Group 3: Wire Chat RAG
├── Group 4: Startup Loading Overlay
│   └── (parallel with 2 & 3)
└── Group 5: Model Download UI
    └── (parallel with 2 & 3)
        └── Group 6: Polish Right Panel (depends on 2 + 3)
```

## Acceptance Criteria (Overall)

| #   | Criterion                                                          | Verification  | Status |
| --- | ------------------------------------------------------------------ | ------------- | ------ |
| 1   | Notes persist to SQLite and survive page reload                    | Manual + Test | `[ ]`  |
| 2   | Sidebar search uses vector embeddings, not keyword heuristic       | Manual + Test | `[ ]`  |
| 3   | Chat submit triggers RAG retrieval → LLM streaming                 | Manual + Test | `[ ]`  |
| 4   | App shows loading overlay during initialization                    | Manual        | `[ ]`  |
| 5   | Users can download, load, and unload models from Settings          | Manual        | `[ ]`  |
| 6   | Right panel shows related notes with excerpts and scores           | Manual        | `[ ]`  |
| 7   | AI Context Bar uses `AIContextBar` component (no inline duplicate) | Code Review   | `[ ]`  |
| 8   | All 4 workers (sqlite, embedding, llm, manager) are instantiated   | Code Review   | `[ ]`  |

## Execution Strategy

1. **Each group** will be implemented as a single drift plan with its own TDD test cases.
2. **After each group**, run `npx vitest run` to verify no regressions.
3. **After all groups**, run the full assessment again to confirm drift closure.

## Files to Modify

| File                                      | Groups Affected |
| ----------------------------------------- | --------------- |
| `src/App.tsx`                             | 1, 2, 3, 4, 6   |
| `src/hooks/useNoteManager.ts`             | 1               |
| `src/hooks/useSemanticSearch.ts`          | 2               |
| `src/hooks/useRagPipeline.ts`             | 3               |
| `src/hooks/useLoadingState.ts`            | 4               |
| `src/hooks/useModelManager.ts`            | 5               |
| `src/components/AIChat.tsx`               | 3               |
| `src/components/SemanticContextPanel.tsx` | 6               |
| `src/components/SettingsPanel.tsx`        | 5               |
| `src/components/LoadingOverlay.tsx`       | 4               |
| `src/components/Sidebar.tsx`              | 2               |

## Notes

- All hooks and workers already exist — the task is **wiring**, not creation.
- No new components need to be created.
- Focus on connecting the dots: App → Hooks → Workers → DB.
