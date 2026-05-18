---
title: "UI Mock Alignment, Homescreen Fix, E2E Tests & User Flow Documentation"
status: "In-Progress"
created: "2026-05-17"
depends_on: ["05b_ui-indicators"]
---

# UI Mock Alignment, Homescreen Fix, E2E Tests & User Flow Documentation

## Goal

Align the application's UI with the mock design (`mock/code.html`), fix the blank homescreen state, add comprehensive E2E Playwright tests for core user flows, and document user flows based on functional requirements.

## Acceptance Criteria

# | Criterion | Verification Method | Status

1 | Homescreen shows welcome state (not blank) when no note selected | Visual inspection + E2E test | [ ]
2 | App theme matches mock design colors, typography, glassmorphism | Visual comparison with mock | [ ]
3 | E2E tests cover: create note, edit note, search notes, select note | `npx vitest run tests/e2e` | [ ]
4 | User flow documentation exists in `docs/functional/user-flows.md` | File exists + content review | [ ]
5 | All existing tests still pass | `npx vitest run` | [ ]
6 | TypeScript compiles without errors | `npx tsc --noEmit` | [ ]

## Change Types

- **Enhancement**: Homescreen welcome state, mock design alignment
- **New Feature**: E2E Playwright test suite
- **Documentation**: User flow documentation

## Implementation Steps

### Phase 1: Homescreen & Design Alignment

1. Create `EmptyState` component for welcome screen when no note selected
2. Update `App.tsx` to render `EmptyState` instead of plain text
3. Refine `NoteEditor.tsx` to match mock's editor/preview layout
4. Update `SemanticContextPanel.tsx` to match mock's right panel layout
5. Add missing CSS utilities (glass-panel, ai-glow, custom scrollbar)
6. Ensure `index.html` loads Geist + JetBrains Mono + Material Symbols fonts

### Phase 2: E2E Test Suite

1. Create `tests/e2e/note-lifecycle.spec.ts` — create, edit, select note flow
2. Create `tests/e2e/search.spec.ts` — semantic search flow
3. Create `tests/e2e/user-flows.spec.ts` — full user journey
4. Configure Playwright/Vitest browser testing

### Phase 3: User Flow Documentation

1. Create `docs/functional/user-flows.md` mapping all functional requirements to step-by-step flows
2. Include diagrams for: note CRUD, semantic search, AI chat, settings

## Files to Create/Modify

### Create

- `src/components/EmptyState.tsx` — Welcome screen when no note selected
- `tests/e2e/note-lifecycle.spec.ts` — E2E note lifecycle tests
- `tests/e2e/search.spec.ts` — E2E search tests
- `tests/e2e/user-flows.spec.ts` — E2E full user journey tests
- `docs/functional/user-flows.md` — User flow documentation

### Modify

- `src/App.tsx` — Render EmptyState, layout refinements
- `src/components/NoteEditor.tsx` — Match mock editor layout
- `src/components/SemanticContextPanel.tsx` — Match mock right panel
- `src/components/Sidebar.tsx` — Minor style refinements
- `src/components/GlobalHeader.tsx` — Minor style refinements
- `index.html` — Add font imports
- `src/styles/index.css` or `src/main.tsx` — Add glass-panel/ai-glow utilities

## Dependencies

- `mock/code.html` — Reference design
- `docs/functional/*.md` — Functional requirements
- `docs/design/02_ui_layout.md` — Design system

## Sub-Agent Tasks

### Sub-Agent Task 1: UI Design Alignment

- **Files**: `src/App.tsx`, `src/components/EmptyState.tsx`, `src/components/NoteEditor.tsx`, `src/components/SemanticContextPanel.tsx`, `index.html`
- **Task**: Fix blank homescreen, create EmptyState, align components with mock design
- **Skills**: `ui-layout-integration`, `typescript-react-audit`
- **Tests**: `tests/components/EmptyState.test.tsx`

### Sub-Agent Task 2: E2E Test Suite

- **Files**: `tests/e2e/note-lifecycle.spec.ts`, `tests/e2e/search.spec.ts`, `tests/e2e/user-flows.spec.ts`
- **Task**: Write Playwright E2E tests for all core user flows
- **Skills**: `test-driven-development`
- **Tests**: E2E tests themselves

### Sub-Agent Task 3: User Flow Documentation

- **Files**: `docs/functional/user-flows.md`
- **Task**: Document all user flows from functional requirements
- **Skills**: `documentation-authoring`

## Estimated Effort

3-4 hours (parallelizable across 3 sub-agents)
