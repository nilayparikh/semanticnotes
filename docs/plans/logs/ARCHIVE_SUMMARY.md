---
title: "Consolidated Archive Summary — SemanticNotes.ai"
archive_date: "2026-05-18"
archived_by: "Archive Agent"
plan_count: 22
---

# Consolidated Archive Summary

## Overview

This file consolidates all archived plans and drifts for SemanticNotes.ai. All individual plan files and logs have been merged into this single reference document.

**Archive Date**: 2026-05-18  
**Total Plans Archived**: 22 (11 phase plans + 11 drift plans)  
**Total Story Points**: 87  
**Date Range**: 2026-05-12 → 2026-05-18

---

## Phase Plans (00–05b)

| Plan | Title              | SP  | Completed  | Key Decisions                                                                                          |
| ---- | ------------------ | --- | ---------- | ------------------------------------------------------------------------------------------------------ |
| 00   | Project Setup      | 3   | 2026-05-12 | Vite + React + TS strict; Vitest as test framework                                                     |
| 01a  | Worker Runtime     | 6   | 2026-05-12 | WorkerManager with event routing; WebGPU detection; ping/pong health check                             |
| 01b  | Data & Model Layer | 6   | 2026-05-12 | wa-sqlite WASM over OPFS; Web Locks API concurrency; ModelManager lifecycle                            |
| 02a  | Note CRUD          | 4   | 2026-05-12 | In-memory CRUD + SQLite persistence; useEffect cleanup; note_version increment                         |
| 02b  | Note UI            | 4   | 2026-05-12 | Markdown editor + live preview; sidebar note list; ARIA accessibility; useMemo optimization            |
| 03a  | Embedding Pipeline | 5   | 2026-05-12 | 256-token sliding window, 64-token overlap; cosine similarity; 384-dim Float32Array vectors            |
| 03b  | Semantic Search    | 5   | 2026-05-15 | BM25 fallback; query embedding; sidebar search input                                                   |
| 04a  | RAG Pipeline       | 5   | 2026-05-15 | all-MiniLM-L6-v2; top-N context selection; 256 tokens/note, max 128 notes                              |
| 04b  | Chat UI            | 5   | 2026-05-15 | Streaming tokens; chat thread management; model selector                                               |
| 05a  | Layout Structure   | 4   | 2026-05-17 | 3-column CSS Grid (280px/1fr/320px); responsive collapse at 768px/1024px; GlobalHeader                 |
| 05b  | UI Indicators      | 4   | 2026-05-17 | LoadingOverlay with progress; PerformanceMetrics (FPS/bundle/memory); theme toggle (Light/Dark/System) |

## Drift Plans (2026-05-12-13-22)

| Plan | Title              | SP  | Completed  | Key Decisions                                                                                              |
| ---- | ------------------ | --- | ---------- | ---------------------------------------------------------------------------------------------------------- |
| 01   | Context Alignment  | 1   | 2026-05-12 | AGENTS.md/copilot-instructions.md bidirectional refs; SKILLS-REGISTRY.md as SSoT                           |
| 02   | Design System      | 3   | 2026-05-12 | 40+ Tailwind color tokens; Geist + JetBrains Mono fonts; glassmorphism utilities                           |
| 03   | UI Theme           | —   | 2026-05-12 | Glassmorphic dark theme for NoteList/NoteEditor/NewNoteButton; ARIA attributes; MarkdownPreview edge cases |
| 04   | Layout Structure   | 3   | 2026-05-12 | 3-column flex (Sidebar 20%, Editor 55%, Context 25%); status badges header                                 |
| 05   | Missing Components | 8   | 2026-05-12 | AIContextBar, SemanticContextPanel, AutoTags, SearchBar, StatusBadges, VectorMetrics, AIChat               |
| 06   | Code Quality       | 2   | 2026-05-12 | WorkerManager.addEventListener refactor; requestDevice(); useEffect cleanup; note_version                  |

## Drift Plans (2026-05-17-full-flow)

| Plan | Title                | SP  | Completed  | Key Decisions                                                                                 | Status Note          |
| ---- | -------------------- | --- | ---------- | --------------------------------------------------------------------------------------------- | -------------------- |
| 01   | Wire SQLite Storage  | 4   | 2026-05-17 | Replace InMemoryDbService with DbService; useNoteManager persistence; debounced save (1000ms) | ⚠ Criteria unchecked |
| 02   | Wire Semantic Search | 3   | 2026-05-17 | Replace keywordSearch() with useSemanticSearch; real query embedding; BM25 fallback           | ⚠ Criteria unchecked |
| 03   | Wire Chat RAG        | 4   | 2026-05-17 | AIChat → useRagPipeline → llm.worker.ts; token streaming; SQLite chat history                 | ⚠ Criteria unchecked |
| 04   | Startup Loading      | 2   | 2026-05-17 | LoadingOverlay in App.tsx; useLoadingState orchestration; per-component retry                 | ⚠ Criteria unchecked |
| 05   | Model Download UI    | 3   | 2026-05-17 | SettingsPanel model lifecycle; download consent; progress indicator; load/unload buttons      | ⚠ Criteria unchecked |
| 06   | Polish Right Panel   | 2   | 2026-05-17 | SemanticContextPanel section dividers; note excerpts; score badges; AIContextBar component    | ⚠ Criteria unchecked |

---

## What Went Well

1. **TDD Discipline**: Plans 01b, 02a, 02b achieved 30+ passing tests per plan. Full suite hit 193 tests.
2. **Modular Architecture**: Clean separation between worker runtime (01a), data layer (01b), and UI (02b) enabled parallel drift work.
3. **Drift Remediation**: 6 drift plans addressed 23 identified drifts across context, design, layout, components, and code quality.
4. **Accessibility**: ARIA attributes and useMemo optimizations were baked in early (02b, 06).
5. **Design System**: Glassmorphic theme with 40+ tokens established visual consistency.

## What Went Wrong

1. **Stub Implementations**: Plans 03b, 04a, 04b had `Complete*` status — query embedding used zero-filled stubs, not real model inference. Note highlighting was missing.
2. **Unwired Workers**: `embedding.worker.ts` existed but was completely unwired from `useEmbeddingPipeline`. `llm.worker.ts` was similarly disconnected.
3. **Test Infrastructure Gaps**: E2E test files had wrong extensions (`.ts` instead of `.tsx`). `Worker` wasn't mocked in jsdom, causing test failures.
4. **Premature Completion Status**: Plans 05a, 05b marked `Complete` with `[x]` criteria (genuine). All 2026-05-17-full-flow drifts marked `Complete` but had `[ ]` criteria — status set before implementation verified.
5. **Plan 07 (End-to-End Fix)**: Marked `Complete` with `completed: null` and all criteria `[ ]` — plan exists but work not done. Left unarchived for future execution.

## Important Decisions

- **Local-First Architecture**: wa-sqlite over OPFS (no server dependencies)
- **WebGPU Acceleration**: Transformers.js v3 for client-side ML inference
- **Worker Concurrency**: Web Locks API + SharedArrayBuffer for cross-worker state
- **Embedding Model**: all-MiniLM-L6-v2 (384-dim vectors)
- **Search Strategy**: Hybrid BM25 + semantic (cosine similarity ≥ 0.72)
- **UI Framework**: React 18 + Tailwind CSS + glassmorphic dark theme
- **Testing**: Vitest + Playwright with 80% line coverage target
- **Wiring Strategy**: 2026-05-17 drift identified 6 wiring groups needed to connect components → hooks → workers

## Plans Left Unarchived (Incomplete)

| Plan                                                | Status               | Reason                                                        |
| --------------------------------------------------- | -------------------- | ------------------------------------------------------------- |
| 06_ui_mock_alignment_e2e.md                         | In-Progress          | All criteria `[ ]`; work not started                          |
| 07_end_to_end_fix.md                                | Complete (premature) | `completed: null`, all 8 criteria `[ ]`; wiring work not done |
| drifts/2026-05-17-full-flow/README.md               | Draft                | Index file only; sub-plans archived separately                |
| drifts/2026-05-18-11-24/01_real-note-search-flow.md | In Progress          | Depends on unwired workers from 2026-05-17 drifts             |

## File Inventory

### Primary Source Files Created

- `src/workers/` — WorkerManager, sqlite.worker.ts, embedding.worker.ts, llm.worker.ts
- `src/hooks/` — useDbService, useNoteManager, useEmbeddingPipeline, useSemanticSearch, useRagPipeline
- `src/components/` — NoteEditor, NoteList, MarkdownPreview, AIChat, ChatInput, ChatThread, AIContextBar, SemanticContextPanel, AutoTags, SearchBar, StatusBadges, VectorMetrics
- `src/styles/` — tailwind.css (glassmorphism utilities)
- `src/types/` — note.ts, worker messages

### Configuration Files

- `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`
- `tailwind.config.ts` (40+ color tokens)
- `AGENTS.md`, `.github/copilot-instructions.md`, `.github/SKILLS-REGISTRY.md`

---

_This consolidated summary replaces all individual archive logs and plan files. Original plans have been removed from the archive directory._
