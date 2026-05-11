# Plan 05a — Layout Structure

**Status**: `Draft`  
**Author**: Planning Agent  
**Created**: 2026-05-12  
**Last Updated**: 2026-05-12  
**Priority**: `Medium`  
**Estimated Effort**: 4 Story Points / 0.5 Days

## 1. Objective

Build the 3-column CSS Grid layout structure with global header and responsive collapse. This is the visual skeleton of the application — the layout grid that holds all UI components.

## 2. Scope

### In Scope

- [ ] 3-column CSS Grid layout (sidebar, main, chat)
- [ ] Global header with app title and model status
- [ ] Responsive collapse (mobile, tablet, desktop)
- [ ] Layout tests
- [ ] Responsive breakpoint tests

### Out of Scope

- [ ] Loading overlay (covered in Plan 05b)
- [ ] Performance metrics (covered in Plan 05b)

## 3. Acceptance Criteria

| #   | Criterion                                                  | Status |
| --- | ---------------------------------------------------------- | ------ |
| 1   | Layout uses 3-column CSS Grid                              | `[ ]`  |
| 2   | Global header displays app title and model status          | `[ ]`  |
| 3   | Responsive collapse at 768px (tablet) and 1024px (desktop) | `[ ]`  |
| 4   | Sidebar is collapsible on mobile                           | `[ ]`  |
| 5   | Layout passes responsive breakpoint tests                  | `[ ]`  |

## 4. TDD Test Cases

### Test Suite: Layout

```typescript
// tests/components/Layout.test.tsx
describe("Layout", () => {
  it("should render 3-column grid layout", () => {});
  it("should display global header with app title", () => {});
  it("should collapse sidebar on mobile breakpoint", () => {});
  it("should expand sidebar on desktop breakpoint", () => {});
  it("should handle responsive breakpoints", () => {});
});
```

## 5. Technical Approach

### 5.1 CSS Grid Layout

Use Tailwind CSS Grid with 3 columns:

- Sidebar: 280px (Note List + Search)
- Main: 1fr (Markdown Editor + Preview)
- Chat: 320px (Chat Thread + Input)

### 5.2 Responsive Breakpoints

- Mobile (< 768px): Single column, collapsible sidebar
- Tablet (768px – 1024px): 2 columns (sidebar + main)
- Desktop (> 1024px): 3 columns (sidebar + main + chat)

## 6. Dependencies

- Plan 02b (Note UI) — Sidebar, editor components
- Plan 04b (Chat UI) — Chat thread, input

## 7. Risks & Mitigations

| Risk                           | Impact | Mitigation                      |
| ------------------------------ | ------ | ------------------------------- |
| Grid collapse on small screens | Medium | Tailwind responsive utilities   |
| Header overlap with content    | Low    | Sticky positioning with z-index |

## 8. Test Strategy

| Test Type | Scope            | Location                           |
| --------- | ---------------- | ---------------------------------- |
| Unit      | Layout component | `tests/components/Layout.test.tsx` |

## 9. Files to Create / Modify

| File                               | Action | Description                  |
| ---------------------------------- | ------ | ---------------------------- |
| `src/components/Layout.tsx`        | Create | 3-column grid layout         |
| `src/components/GlobalHeader.tsx`  | Create | Global header with app title |
| `tests/components/Layout.test.tsx` | Create | Layout tests                 |

## 10. Completion Checklist

- [ ] All acceptance criteria met
- [ ] Tests written and passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] No regressions in existing features
