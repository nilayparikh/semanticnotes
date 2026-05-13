# Plan 04 — Layout Structure

**Status**: `Pending`  
**Author**: Change Agent  
**Created**: 2026-05-12  
**Priority**: `Critical`  
**Estimated Effort**: 5 Story Points / 1 Day  
**Parent**: Drift Remediation (Phase 4)  
**Source Drifts**: #2, #19, #20, #21

## 1. Objective

Implement the 3-column layout structure defined in `mock/code.html`: Sidebar (20%), Editor (55%), Context Panel (25%). This phase transforms `App.tsx` from a single-column placeholder to the approved mock layout.

**Status**: `Complete`

## 2. Scope

### In Scope

- [x] Restructure `App.tsx` with 3-column flex layout
- [x] Create `Sidebar.tsx` component structure
- [x] Create `Editor.tsx` component structure
- [x] Create `ContextPanel.tsx` component structure
- [x] Add header with status badges (WebGPU/SQLite indicators)
- [x] Add search bar to sidebar

### Out of Scope

- [ ] Component styling (covered in Phase 3)
- [ ] New component creation (covered in Phase 5)
- [ ] Design system configuration (covered in Phase 2)

## 3. Acceptance Criteria

| #   | Criterion                                 | Status |
| --- | ----------------------------------------- | ------ |
| 1   | `App.tsx` implements 3-column flex layout | `[x]`  |
| 2   | Sidebar has 20% fixed width               | `[x]`  |
| 3   | Editor has 55% fluid width                | `[x]`  |
| 4   | Context Panel has 25% width               | `[x]`  |
| 5   | Header includes status badges             | `[x]`  |
| 6   | Sidebar includes search bar               | `[x]`  |

## 4. TDD Test Cases

### Test Suite: App Layout

```typescript
// tests/components/App.test.tsx
describe("App Layout", () => {
  it("should render 3-column layout", () => {
    // Verify flex container with 3 children
  });

  it("should have sidebar with 20% width", () => {
    // Verify sidebar width
  });

  it("should have editor with 55% width", () => {
    // Verify editor width
  });
});
```

## 5. Technical Approach

### 5.1 Restructure App.tsx

Implement the 3-column layout matching the mock:

```tsx
// src/App.tsx
export default function App() {
  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header with Status Badges */}
      <header className="glass-panel px-4 py-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h1 className="text-primary font-geist text-lg">SemanticNotes.ai</h1>
          <div className="flex gap-2">
            <span className="glass-panel px-2 py-1 text-xs text-secondary">
              ● WebGPU
            </span>
            <span className="glass-panel px-2 py-1 text-xs text-secondary">
              ● SQLite
            </span>
          </div>
        </div>
      </header>

      {/* 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (20%) */}
        <aside className="w-[20%] glass-panel border-r border-white/10 flex flex-col">
          <div className="p-4">
            <input
              type="text"
              placeholder="AI Semantic Search..."
              className="glass-panel w-full px-3 py-2 text-sm text-on-surface border-none focus:outline-none focus:border-b focus:border-primary"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            <NoteList />
          </div>
          <div className="p-4">
            <NewNoteButton />
          </div>
        </aside>

        {/* Editor (55%) */}
        <main className="flex-[55%] glass-panel">
          <NoteEditor />
        </main>

        {/* Context Panel (25%) */}
        <aside className="w-[25%] glass-panel border-l border-white/10">
          <ContextPanel />
        </aside>
      </div>
    </div>
  );
}
```

### 5.2 Create Sidebar Component

```tsx
// src/components/Sidebar.tsx
export function Sidebar({ children }) {
  return (
    <aside className="w-[20%] glass-panel border-r border-white/10 flex flex-col">
      {children}
    </aside>
  );
}
```

### 5.3 Create Editor Component

```tsx
// src/components/Editor.tsx
export function Editor({ children }) {
  return <main className="flex-[55%] glass-panel">{children}</main>;
}
```

### 5.4 Create ContextPanel Component

```tsx
// src/components/ContextPanel.tsx
export function ContextPanel({ children }) {
  return (
    <aside className="w-[25%] glass-panel border-l border-white/10">
      {children}
    </aside>
  );
}
```

## 6. Dependencies

- Phase 2 (Design System Foundation) must complete first
- Requires `glass-panel` utility class

## 7. Risks & Mitigations

| Risk                       | Impact | Mitigation                              |
| -------------------------- | ------ | --------------------------------------- |
| Responsive layout issues   | Medium | Test on multiple viewport sizes         |
| Flexbox calculation errors | Low    | Use percentage-based widths             |
| Scroll behavior conflicts  | Medium | Add `overflow-hidden` to main container |

## 8. Test Strategy

| Test Type | Scope                | Location                        |
| --------- | -------------------- | ------------------------------- |
| Unit      | App layout structure | `tests/components/App.test.tsx` |
| E2E       | 3-column rendering   | `tests/e2e/layout.test.ts`      |

## 9. Files to Create / Modify

| File                              | Action | Description                           |
| --------------------------------- | ------ | ------------------------------------- |
| `src/App.tsx`                     | Modify | Implement 3-column layout with header |
| `src/components/Sidebar.tsx`      | Create | Sidebar component structure           |
| `src/components/Editor.tsx`       | Create | Editor component structure            |
| `src/components/ContextPanel.tsx` | Create | Context panel structure               |

## 10. Completion Checklist

- [ ] All acceptance criteria met
- [ ] Layout tested on multiple viewports
- [ ] Drift report updated to mark drifts #2, #19, #20, #21 as `Resolved`
