---
title: "Group 6 — Polish Right Panel & UX Alignment"
plan_id: "drift-2026-05-17-full-flow-06_right_panel"
status: "Complete"
author: "Planning Agent"
created: "2026-05-17"
updated: "2026-05-17"
completed: "2026-05-17"
priority: "Medium"
story_points: 2
effort_days: 0.25
depends_on:
  [
    "drift-2026-05-17-full-flow-02_semantic_search",
    "drift-2026-05-17-full-flow-03_chat_rag",
  ]
depends_on_external: []
phase: null
parent_drift_index: "docs/plans/drifts/2026-05-17-full-flow/README.md"
source_drifts:
  [
    "drift-2026-05-17-assessment#warning-1",
    "drift-2026-05-17-assessment#warning-2",
    "drift-2026-05-17-assessment#warning-3",
    "drift-2026-05-17-assessment#warning-4",
  ]
archived_date: null
archive_log: null
---

## 1. Objective

Align the right panel (`SemanticContextPanel`) with the approved mock: stronger section boundaries, related notes with excerpts and score badges, chat readiness cues, and use `AIContextBar` component instead of inline duplicate.

## 2. Scope

### In Scope

- [ ] Add section dividers and visual hierarchy to `SemanticContextPanel`
- [ ] Add excerpt snippets to related notes cards
- [ ] Add score badge pill styling to related notes
- [ ] Add model state badge and progress text to chat header
- [ ] Replace inline AI Context Bar in `App.tsx` with `AIContextBar` component
- [ ] Add icon treatment to section titles (material-symbols-outlined)

### Out of Scope

- New component creation
- Functional wiring (Groups 1-5)
- Theme changes

## 3. Acceptance Criteria

| #   | Criterion                                                             | Verification Method | Status |
| --- | --------------------------------------------------------------------- | ------------------- | ------ |
| 1   | Right panel has distinct section boundaries (glass-panel per section) | Manual              | `[ ]`  |
| 2   | Related notes cards show excerpt + score badge                        | Manual              | `[ ]`  |
| 3   | Chat header shows active model name and state                         | Manual              | `[ ]`  |
| 4   | `AIContextBar` component is used in `App.tsx` (no inline duplicate)   | Code Review         | `[ ]`  |
| 5   | Section titles have icon + label treatment                            | Manual              | `[ ]`  |

## 4. Current Code Analysis

### `src/components/SemanticContextPanel.tsx`

Simple sections with `<h3>` headers. Related notes show title + similarity percentage only. No excerpts.

### `src/App.tsx` (lines 276-309)

Inline AI Context Bar:

```tsx
<div className="absolute bottom-6 left-1/2 ...">
  {/* Inline duplicate of AIContextBar */}
</div>
```

### `src/components/AIContextBar.tsx`

Standalone component exists but is not imported in `App.tsx`.

### `src/components/AIChat.tsx`

Has model selector but no explicit model state badge or progress indicator in chat header.

## 5. Technical Approach

### 5.1 Related Notes with Excerpts

```typescript
// SemanticContextPanel.tsx
// Accept content prop for excerpts
export interface SemanticContextPanelProps {
  tags: string[];
  relatedNotes: Array<{
    id: string;
    title: string;
    content: string; // excerpt
    similarity: number;
  }>;
}

// Render excerpt
<div className="glass-panel px-3 py-2">
  <div className="flex justify-between items-center">
    <span className="text-on-surface text-sm">{note.title}</span>
    <span className="badge text-xs px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300">
      {Math.round(note.similarity * 100)}%
    </span>
  </div>
  <p className="text-secondary text-xs mt-1 line-clamp-2">{note.content.slice(0, 120)}...</p>
</div>
```

### 5.2 Chat Header with Model State

```typescript
// AIChat.tsx
<div className="flex justify-between items-center mb-2">
  <span className="text-on-surface text-xs font-geist">AI Chat</span>
  <div className="flex items-center gap-2">
    <span className="text-xs text-secondary">{modelName} ({modelState})</span>
    <ModelSelector ... />
  </div>
</div>
```

### 5.3 Replace Inline Context Bar

```typescript
// src/App.tsx
import { AIContextBar } from "@/components/AIContextBar";

// Replace inline div with:
<AIContextBar
  isProcessing={aiProcessing}
  isEmbedding={isEmbedding}
  onSummarize={handleSummarize}
  onFindLinks={handleFindLinks}
/>
```

### 5.4 Section Icon Treatment

```tsx
<section>
  <h3 className="flex items-center gap-2 text-on-surface font-geist text-sm font-semibold mb-3">
    <span className="material-symbols-outlined text-primary-fixed-dim">
      auto_awesome
    </span>
    AI Insights
  </h3>
  {/* content */}
</section>
```

## 6. TDD Test Cases

```typescript
// tests/components/SemanticContextPanel.test.tsx
describe("SemanticContextPanel", () => {
  it("should render related notes with excerpts", () => {});
  it("should render score badges", () => {});
  it("should render section icons", () => {});
});

// tests/components/AIContextBar.test.tsx
describe("AIContextBar", () => {
  it("should render processing state", () => {});
  it("should render summarize button", () => {});
  it("should render find links button", () => {});
});
```

## 7. Files to Modify

| File                                      | Change                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/App.tsx`                             | Replace inline context bar with `AIContextBar` component; pass related notes with excerpts |
| `src/components/SemanticContextPanel.tsx` | Add section styling, excerpts, score badges, icons                                         |
| `src/components/AIChat.tsx`               | Add model state badge in chat header                                                       |
| `src/components/AIContextBar.tsx`         | Verify props interface matches App usage                                                   |
