# Drift Report

**Date**: 2026-05-12
**Agent**: Drift Detection Agent
**Scope**: Full workspace — Context files, Architecture docs, Implementations, UI Components, Skills

---

## Summary

- **Total drifts found**: 23
- **Critical**: 6
- **Warning**: 10
- **Info**: 7

---

## Critical Drifts

### 1. UI Components Completely Diverge from Mock Design System

**Severity**: Critical

The mock design at `mock/code.html` and `mock/DESIGN.md` define a comprehensive **Glassmorphism Dark Theme** design system. The current React components in `src/components/` are using a **light/white theme** that barely resembles the approved mock.

- **Source**: `mock/DESIGN.md` defines:
  - Base background: `#0A0A0A` (Deep Charcoal)
  - Glass panels: Translucent Slate with 20px backdrop-blur
  - Accent: Cyan `#00F0FF` / Emerald `#10B981`
  - Typography: Geist + JetBrains Mono
  - Layout: 3-column (Sidebar 20% | Editor 55% | Context 25%)

- **Target**: `src/components/NoteList.tsx` uses:
  - `bg-blue-50`, `bg-white`, `text-gray-500` (Light theme)
  - No glassmorphism, no backdrop-blur, no border-luminance
  - `src/components/NewNoteButton.tsx`: `bg-blue-500` (Solid blue, not glassmorphic)
  - `src/components/NoteEditor.tsx`: `border-gray-200` (Light borders)
  - `src/styles/tailwind.css`: `--color-bg: #0f172a` (Wrong base color)

- **Impact**: The entire UI is visually inconsistent with the approved mock design. Users will see a light-themed, flat UI instead of the glassmorphic dark theme.

- **Recommendation**:
  1. Update `tailwind.config.ts` to use the mock's color palette
  2. Replace all light-theme classes with dark glassmorphic equivalents
  3. Implement `glass-panel` utility class matching the mock's CSS
  4. Apply the 3-column layout structure from the mock

### 2. Missing 3-Column Layout Structure

**Severity**: Critical

The mock defines a **3-column layout** (Sidebar | Editor | Context Panel) but `src/App.tsx` has a minimal single-column layout.

- **Source**: `mock/code.html` defines:
  - Left column (20%): Knowledge Base (Search + Note List + New Note button)
  - Center column (55%): AI Markdown Editor (Editor + Preview + AI Context Bar)
  - Right column (25%): Semantic Context (Auto-Tags, Related Notes, AI Q&A, Metrics)

- **Target**: `src/App.tsx` has only:
  - A header and a single main section
  - No sidebar, no context panel, no AI context bar

- **Recommendation**: Implement the 3-column layout as defined in Plan 05a (`docs/plans/05a_layout-structure.md`)

### 3. Missing AI Context Bar Component

**Severity**: Critical

The mock features a **Floating AI Context Bar** — a key differentiator of the product.

- **Source**: `mock/code.html` has a glassmorphic floating pill with:
  - AI status indicator with pulse animation
  - "Summarize" and "Find Links" action buttons
  - Cyan outer glow (`ai-glow` class)

- **Target**: No `AIContextBar` component exists in `src/components/`

- **Recommendation**: Create `AIContextBar.tsx` component matching the mock's floating pill design

### 4. Missing Semantic Context Panel

**Severity**: Critical

The right panel (25%) is the core value proposition — semantic insights.

- **Source**: `mock/code.html` defines:
  - Auto-Tags section with color-coded pill badges
  - Semantically Related notes with percentage scores
  - Local AI Q&A chat interface
  - Database Vector Metrics

- **Target**: No right panel component exists in `src/components/`

- **Recommendation**: Create `SemanticContextPanel.tsx` and `AITags.tsx` components

### 5. Mandatory Planning Phase Missing from copilot-instructions.md

**Severity**: Critical

- **Source**: `AGENTS.md` says: "Planning Phase (Mandatory): All features require a plan in `docs/plans/` before implementation"
- **Target**: `.github/copilot-instructions.md` has no explicit "mandatory planning phase" rule
- **Recommendation**: Add a "Mandatory Planning Phase" section to `copilot-instructions.md`

### 6. Architecture Doc Specifies 384-Dim Embeddings vs. Plan Says 100-128

**Severity**: Critical

- **Source**: `docs/architecture/01_system-overview.md` says: "384-dim semantic vectors" and "256-token sliding window"
- **Target**: `.github/copilot-instructions.md` says: "100–128 dimensions per note" and "128 dimensions" for LLM context
- **Recommendation**: Align embedding dimension specs across all architecture docs. The architecture spec (384-dim) should be the source of truth.

---

## Warnings

### 7. SKILLS-REGISTRY.md Not Referenced by copilot-instructions.md

- **Source**: `AGENTS.md` lists `.github/SKILLS-REGISTRY.md` as a top-level context file
- **Target**: `copilot-instructions.md` makes no mention of `SKILLS-REGISTRY.md`
- **Recommendation**: Add SKILLS-REGISTRY.md reference to copilot-instructions.md

### 8. `.agents/skills/` Directory Not Documented in AGENTS.md

- **Source**: SKILLS-REGISTRY.md references `.agents/skills/` directory
- **Target**: `AGENTS.md` file structure only documents `.github/skills/`
- **Recommendation**: Add `.agents/skills/` to AGENTS.md file structure

### 9. WorkerManager.ping() Uses `onmessage` Instead of `addEventListener`

- **Source**: `src/workers/worker-manager.ts` assigns `entry.worker.onmessage`
- **Target**: Should use `addEventListener('message', handler)` to support multiple listeners
- **Recommendation**: Refactor `ping()` method to use `addEventListener`

### 10. WebGPU assessCapability() Uses Non-Standard API

- **Source**: `src/utils/webgpu.ts` uses `getInfo()` method
- **Target**: Should use `adapter.requestDevice()` for robust validation
- **Recommendation**: Replace `getInfo()` with `requestDevice()` pattern

### 11. useNoteSaveDebounce Memory Leak

- **Source**: `src/hooks/useNoteSaveDebounce.ts` uses `setTimeout` without `useEffect` cleanup
- **Target**: Timeout persists on unmount
- **Recommendation**: Add `useEffect` cleanup to clear timeout on unmount

### 12. Optimistic Locking Not Enforced

- **Source**: `src/hooks/useNoteManager.ts` has `note_version` field but never increments it
- **Target**: `UPDATE_NOTE` case should increment `note_version`
- **Recommendation**: Add `note_version: n.note_version + 1` in the reducer

### 13. NoteList Re-Sorts on Every Render

- **Source**: `src/components/NoteList.tsx` computes `sortedNotes` without `useMemo`
- **Target**: Every render re-sorts the entire array
- **Recommendation**: Wrap in `useMemo` with `[notes]` dependency

### 14. NoteList Missing ARIA Attributes

- **Source**: `src/components/NoteList.tsx` lacks `aria-selected` and `role="option"`
- **Target**: Screen readers cannot distinguish the active note
- **Recommendation**: Add `aria-selected={isActive}` and `role="option"` to list items

### 15. MarkdownPreview Parser Misses Edge Cases

- **Source**: `src/components/MarkdownPreview.tsx` handles h1, h2, h3, p, li, td
- **Target**: Missing: Bold/italic, blockquotes, horizontal rules, code blocks, nested lists, table row grouping
- **Recommendation**: Consider using `marked` or `react-markdown` for production readiness

### 16. Font Family Not Matching Mock

- **Source**: `mock/DESIGN.md` specifies: **Geist** (UI) + **JetBrains Mono** (Editor)
- **Target**: `src/styles/tailwind.css` uses: **"Inter"** as primary font
- **Recommendation**: Add Geist and JetBrains Mono to font-family stack

---

## Info

### 17. sn_drift Workflow Trigger Missing from AGENTS.md

- **Source**: `docs/code-agents/best-practices.md` defines `sn_drift` workflow
- **Target**: `AGENTS.md` operational guidelines don't surface `sn_drift`
- **Recommendation**: Add `sn_drift` to AGENTS.md workflow section

### 18. docs/plans/README.md Reference Ambiguity

- **Source**: `AGENTS.md` references `docs/plans/README.md` as "template"
- **Target**: The file exists but may not serve as the "template" AGENTS.md implies
- **Recommendation**: Clarify if README.md is the template or create a dedicated template file

### 19. App.tsx Has No Component Composition

- **Source**: `src/App.tsx` is a minimal placeholder
- **Target**: Should integrate NoteList, NoteEditor, MarkdownPreview, and NewNoteButton
- **Recommendation**: Compose components in App.tsx matching the 3-column mock layout

### 20. No Status Badges in Header

- **Source**: `mock/code.html` has WebGPU/SQLite status badges in the header
- **Target**: `src/App.tsx` header has no status indicators
- **Recommendation**: Add status badge components matching the mock design

### 21. No Search Input in Sidebar

- **Source**: `mock/code.html` has an AI Semantic Search input at the top of the sidebar
- **Target**: No search component exists in `src/components/`
- **Recommendation**: Create `SearchBar.tsx` component with glassmorphic styling

### 22. Tailwind Config Missing Custom Design Tokens

- **Source**: `mock/DESIGN.md` defines 40+ color tokens and 6 typography scales
- **Target**: `tailwind.config.ts` has minimal configuration
- **Recommendation**: Migrate mock's design tokens to Tailwind's `extend` configuration

### 23. No Glassmorphism Utility Classes

- **Source**: `mock/code.html` defines `.glass-panel` and `.ai-glow` CSS classes
- **Target**: No equivalent utility classes in `src/styles/tailwind.css`
- **Recommendation**: Add glassmorphism utilities to the CSS file

---

## Drift Heat Map

| Area                   | Critical | Warning | Info |
| ---------------------- | -------- | ------- | ---- |
| **UI / Design System** | 4        | 3       | 5    |
| **Context Files**      | 1        | 2       | 2    |
| **Architecture Docs**  | 1        | 0       | 0    |
| **Implementation**     | 0        | 5       | 0    |
| **Skills**             | 0        | 0       | 0    |

---

## Recommended Remediation Order

1. **Update Tailwind Config** — Migrate mock's color palette and typography to `tailwind.config.ts`
2. **Add Glassmorphism Utilities** — Create `.glass-panel` and `.ai-glow` in `src/styles/tailwind.css`
3. **Fix Context File Drifts** — Align `AGENTS.md` and `copilot-instructions.md`
4. **Fix Architecture Doc Drift** — Align embedding dimensions (384 vs 100-128)
5. **Implement 3-Column Layout** — Restructure `App.tsx` to match mock
6. **Fix High-Severity Bugs** — Memory leak, optimistic locking, WorkerManager ping
7. **Add Missing Components** — AIContextBar, SemanticContextPanel, SearchBar
8. **Apply Dark Theme** — Convert all components from light to glassmorphic dark theme
9. **Add Accessibility** — ARIA attributes on NoteList
10. **Performance Optimizations** — useMemo on NoteList sort
