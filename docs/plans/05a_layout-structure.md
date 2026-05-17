---
title: "Plan 05a — Layout Structure"
plan_id: "05a_layout-structure"
status: "Complete"
author: "Planning Agent"
created: "2026-05-12"
updated: "2026-05-17"
completed: "2026-05-17"
priority: "Medium"
story_points: 4
effort_days: 0.5
depends_on: [04b_chat-ui]
depends_on_external: []
phase: 5
drift_of: null
archived_date: null
archive_log: null
---

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

| #   | Criterion                                                  | Verification Method | Status |
| --- | ---------------------------------------------------------- | ------------------- | ------ |
| 1   | Layout uses 3-column CSS Grid                              | Manual Check        | `[x]`  |
| 2   | Global header displays app title and model status          | Manual Check        | `[x]`  |
| 3   | Responsive collapse at 768px (tablet) and 1024px (desktop) | Integration Test    | `[x]`  |
| 4   | Sidebar is collapsible on mobile                           | Manual Check        | `[x]`  |
| 5   | Layout passes responsive breakpoint tests                  | Unit Test           | `[x]`  |

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

- [x] All acceptance criteria met
- [x] Tests written and passing
- [x] Code reviewed
- [x] Documentation updated
- [x] No regressions in existing features
