---
title: "Plan 02b — Note UI"
plan_id: "02b_note-ui"
status: "Archived"
author: "Planning Agent"
created: "2026-05-12"
updated: "2026-05-17"
completed: 2026-05-12
priority: "High"
story_points: 4
effort_days: 1
depends_on: [02a_note-crud]
depends_on_external: []
phase: 2
drift_of: null
archived_date: "2026-05-18"
archive_log: "docs/plans/logs/2026-05-18-02b_note-ui.md"
---

> **Peer Review Note**: All 4 components are implemented. Improvements applied: (1) Sorted notes in `NoteList` memoized with `useMemo`, (2) ARIA attributes (`aria-selected`, `role="option"`) added for accessibility. ✅ Resolved.

Implement the note UI components: Markdown editor with live preview, sidebar note list, and new note button. This is the view layer for note management — the user-facing interface for working with notes.

## 2. Scope

### In Scope

- [x] Markdown editor with borderless textarea
- [x] Live Markdown preview pane
- [x] Sidebar note list with hierarchical display
- [x] Active note highlighting with relative timestamp
- [x] "+ NEW NOTE" button
- [x] Markdown rendering component
- [x] Note list component
- [x] Component tests

### Out of Scope

- [ ] Note CRUD logic (covered in Plan 02a)
- [ ] Semantic search (covered in Plan 03b)

## 3. Acceptance Criteria

| #   | Criterion                                                     | Verification Method | Status |
| --- | ------------------------------------------------------------- | ------------------- | ------ |
| 1   | User can edit note content in a borderless Markdown textarea  | Unit Test           | `[x]`  |
| 2   | Live Markdown preview renders headers, paragraphs, and tables | Unit Test           | `[x]`  |
| 3   | Sidebar displays hierarchical note list                       | Manual Check        | `[x]`  |
| 4   | Active note is highlighted with high-contrast container       | Manual Check        | `[x]`  |
| 5   | Relative timestamps display ("Just now", "5 min ago")         | Unit Test           | `[x]`  |

## 4. TDD Test Cases

### Test Suite: Markdown Rendering

```typescript
// tests/components/MarkdownPreview.test.tsx
describe("MarkdownPreview", () => {
  it("should render h1 headers", () => {});
  it("should render h2 headers", () => {});
  it("should render paragraphs", () => {});
  it("should render tables", () => {});
  it("should render inline code spans", () => {});
  it("should render unordered lists", () => {});
});
```

### Test Suite: Note List Component

```typescript
// tests/components/NoteList.test.tsx
describe("NoteList", () => {
  it("should display all notes in hierarchical order", () => {});
  it("should highlight the active note", () => {});
  it("should display relative timestamps", () => {});
  it("should select a note on click", () => {});
  it("should use medium-grey typography for inactive notes", () => {});
});
```

## 5. Technical Approach

### 5.1 Markdown Preview

Use a custom Markdown parser (no external library like `marked` or `react-markdown`) to render live preview. The custom parser handles headers, paragraphs, tables, inline code, and lists. Split the editor pane: top half is textarea, bottom half is preview.

### 5.2 Note List

Display notes in a hierarchical list. Highlight the active note with a high-contrast container. Use relative timestamps for each note.

## 6. Dependencies

- Plan 02a (Note CRUD) — Note data, useNoteManager hook

## 7. Risks & Mitigations

| Risk                           | Impact | Mitigation                      |
| ------------------------------ | ------ | ------------------------------- |
| Markdown rendering performance | Low    | Virtualized list for 100+ notes |

## 8. Test Strategy

| Test Type | Scope              | Location                                    |
| --------- | ------------------ | ------------------------------------------- |
| Unit      | Markdown rendering | `tests/components/MarkdownPreview.test.tsx` |
| Unit      | Note list display  | `tests/components/NoteList.test.tsx`        |

## 9. Files to Create / Modify

| File                                        | Action | Description                       |
| ------------------------------------------- | ------ | --------------------------------- |
| `src/components/NoteEditor.tsx`             | Create | Markdown editor with live preview |
| `src/components/NoteList.tsx`               | Create | Sidebar note list                 |
| `src/components/MarkdownPreview.tsx`        | Create | Markdown rendering component      |
| `src/components/NewNoteButton.tsx`          | Create | "+ NEW NOTE" button               |
| `tests/components/MarkdownPreview.test.tsx` | Create | Markdown preview tests            |
| `tests/components/NoteList.test.tsx`        | Create | Note list tests                   |

## 10. Completion Checklist

- [x] All acceptance criteria met
- [x] Tests written and passing
- [x] Code reviewed
- [x] Documentation updated
- [x] No regressions in existing features
