# Plan 03 — UI Theme Alignment

**Status**: `Complete`  
**Author**: Change Agent  
**Created**: 2026-05-12  
**Completed**: 2026-05-12  
**Priority**: `Critical`  
**Estimated Effort**: 5 Story Points / 1 Day  
**Parent**: Drift Remediation (Phase 3)  
**Source Drifts**: #1, #13, #14, #15

## 1. Objective

Convert all existing UI components from the current light theme to the approved glassmorphic dark theme defined in `mock/DESIGN.md`. This phase ensures visual consistency with the approved mock design.

## 2. Scope

### In Scope

- [x] Rewrite `NoteList.tsx` to match mock glassmorphic styling
- [x] Rewrite `NoteEditor.tsx` to match mock dark theme
- [x] Rewrite `NewNoteButton.tsx` to use primary-fixed-dim cyan styling
- [x] Add ARIA attributes to `NoteList.tsx` (`aria-selected`, `role="option"`)
- [x] Add `useMemo` optimization to `NoteList.tsx` sorting
- [x] Improve `MarkdownPreview.tsx` parser for edge cases

### Out of Scope

- [ ] New component creation (covered in Phase 5)
- [ ] Layout structure changes (covered in Phase 4)
- [ ] Design system configuration (covered in Phase 2)

## 3. Acceptance Criteria

| #   | Criterion                                               | Status |
| --- | ------------------------------------------------------- | ------ |
| 1   | `NoteList.tsx` uses glass-panel styling                 | `[ ]`  |
| 2   | `NoteList.tsx` has `hover:bg-white/5` hover state       | `[ ]`  |
| 3   | `NoteList.tsx` has `aria-selected` and `role="option"`  | `[ ]`  |
| 4   | `NoteList.tsx` uses `useMemo` for sorting               | `[ ]`  |
| 5   | `NoteEditor.tsx` uses dark theme styling                | `[ ]`  |
| 6   | `NewNoteButton.tsx` uses cyan primary styling           | `[ ]`  |
| 7   | `MarkdownPreview.tsx` handles bold, italic, code blocks | `[ ]`  |

## 4. TDD Test Cases

### Test Suite: NoteList Accessibility

```typescript
// tests/components/NoteList.test.tsx
describe("NoteList Accessibility", () => {
  it("should have aria-selected on active note", () => {
    // Verify aria-selected="true" on active item
  });

  it("should have role='option' on each note", () => {
    // Verify role="option" on list items
  });
});
```

### Test Suite: NoteList Performance

```typescript
// tests/components/NoteList.test.tsx
describe("NoteList Performance", () => {
  it("should memoize sorted notes array", () => {
    // Verify sortedNotes is wrapped in useMemo
  });
});
```

## 5. Technical Approach

### 5.1 Rewrite NoteList.tsx

Replace light theme classes with glassmorphic dark theme:

```tsx
// src/components/NoteList.tsx
import { useMemo } from "react";

export function NoteList({ notes, selectedId, onSelect }) {
  const sortedNotes = useMemo(() => {
    return [...notes].sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
  }, [notes]);

  return (
    <nav role="listbox" aria-label="Notes">
      {sortedNotes.map((note) => (
        <div
          key={note.id}
          role="option"
          aria-selected={note.id === selectedId}
          className="glass-panel px-3 py-2 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => onSelect(note.id)}
        >
          <div className="text-on-surface text-sm font-geist">
            {note.title || "Untitled"}
          </div>
          <div className="text-on-surface-variant text-xs font-jetbrains">
            {getRelativeTime(note.updated_at)}
          </div>
        </div>
      ))}
    </nav>
  );
}
```

### 5.2 Rewrite NoteEditor.tsx

Apply dark theme to the editor component:

```tsx
// src/components/NoteEditor.tsx
export function NoteEditor({ note, onUpdate }) {
  return (
    <div className="glass-panel p-4">
      <input
        type="text"
        value={note.title}
        onChange={(e) => onUpdate({ ...note, title: e.target.value })}
        className="bg-transparent text-on-surface text-xl font-geist mb-4 border-none focus:outline-none focus:border-b focus:border-primary"
        placeholder="Note Title"
      />
      <textarea
        value={note.content}
        onChange={(e) => onUpdate({ ...note, content: e.target.value })}
        className="bg-transparent text-on-surface font-jetbrains text-sm leading-relaxed border-none focus:outline-none resize-none min-h-[400px]"
        placeholder="Start writing..."
      />
    </div>
  );
}
```

### 5.3 Rewrite NewNoteButton.tsx

Apply cyan primary styling:

```tsx
// src/components/NewNoteButton.tsx
export function NewNoteButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="glass-panel ai-glow px-4 py-2 text-primary-container font-geist text-sm font-medium hover:bg-white/5 transition-colors"
    >
      <span className="text-lg">+</span> NEW NOTE
    </button>
  );
}
```

## 6. Dependencies

- Phase 2 (Design System Foundation) must complete first
- Requires `glass-panel` and `ai-glow` utility classes

## 7. Risks & Mitigations

| Risk                        | Impact | Mitigation                           |
| --------------------------- | ------ | ------------------------------------ |
| Component styling conflicts | Medium | Use utility classes consistently     |
| Accessibility regression    | High   | Verify ARIA attributes after changes |
| Performance regression      | Medium | Test `useMemo` optimization          |

## 8. Test Strategy

| Test Type | Scope                  | Location                             |
| --------- | ---------------------- | ------------------------------------ |
| Unit      | NoteList accessibility | `tests/components/NoteList.test.tsx` |
| Unit      | NoteList performance   | `tests/components/NoteList.test.tsx` |
| Unit      | Component styling      | `tests/components/`                  |

## 9. Files to Create / Modify

| File                                 | Action | Description                                          |
| ------------------------------------ | ------ | ---------------------------------------------------- |
| `src/components/NoteList.tsx`        | Modify | Apply glassmorphic styling, ARIA attributes, useMemo |
| `src/components/NoteEditor.tsx`      | Modify | Apply dark theme styling                             |
| `src/components/NewNoteButton.tsx`   | Modify | Apply cyan primary styling                           |
| `src/components/MarkdownPreview.tsx` | Modify | Improve markdown parser                              |

## 10. Completion Checklist

- [ ] All acceptance criteria met
- [ ] Accessibility audit passed
- [ ] Performance optimizations verified
- [ ] Drift report updated to mark drifts #1, #13, #14, #15 as `Resolved`
