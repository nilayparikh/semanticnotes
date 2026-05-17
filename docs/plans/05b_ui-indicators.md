---
title: "Plan 05b — UI Indicators"
plan_id: "05b_ui-indicators"
status: "Complete"
author: "Implementation Agent"
created: "2026-05-12"
updated: "2026-05-17"
completed: "2026-05-17"
priority: "Medium"
story_points: 4
effort_days: 0.5
depends_on: [05a_layout-structure]
depends_on_external: []
phase: 5
drift_of: null
archived_date: null
archive_log: null
---

## 1. Objective

Implement UI indicators: loading overlay, performance metrics display, and glassmorphic theme. This is the polish layer — the visual feedback and performance indicators that make the app feel responsive.

## 2. Scope

### In Scope

- [ ] Loading overlay with progress indicator (ModelManager)
- [ ] Performance metrics display (FPS, bundle size, memory)
- [ ] Glassmorphic theme (backdrop-blur, semi-transparent panels)
- [ ] Theme toggle (Light/Dark/System)
- [ ] UI indicator tests

### Out of Scope

- [ ] Layout structure (covered in Plan 05a)
- [ ] Chat UI (covered in Plan 04b)

## 3. Acceptance Criteria

| #   | Criterion                                                   | Verification Method | Status |
| --- | ----------------------------------------------------------- | ------------------- | ------ |
| 1   | Loading overlay displays model progress                     | Manual Check        | `[x]`  |
| 2   | Performance metrics show FPS, bundle size, memory           | Unit Test           | `[x]`  |
| 3   | Glassmorphic theme uses backdrop-blur and semi-transparency | Manual Check        | `[x]`  |
| 4   | Theme toggle switches between Light/Dark/System             | Unit Test           | `[x]`  |
| 5   | UI indicators pass visual tests                             | Integration Test    | `[x]`  |

## 4. TDD Test Cases

### Test Suite: UI Indicators

```typescript
// tests/components/LoadingOverlay.test.tsx
describe("LoadingOverlay", () => {
  it("should display model loading progress", () => {});
  it("should show spinner during model initialization", () => {});
  it("should fade out when model is ready", () => {});
});
```

```typescript
// tests/components/PerformanceMetrics.test.tsx
describe("PerformanceMetrics", () => {
  it("should display FPS counter", () => {});
  it("should show bundle size", () => {});
  it("should display memory usage", () => {});
  it("should update metrics every second", () => {});
});
```

```typescript
// tests/hooks/useTheme.test.ts
describe("useTheme", () => {
  it("should toggle between Light/Dark/System", () => {});
  it("should persist theme in localStorage", () => {});
  it("should apply glassmorphic classes", () => {});
});
```

## 5. Technical Approach

### 5.1 Loading Overlay

Follow `03_model_runtime_spec.md` Section 7.2:

- Overlay displays model loading progress
- Spinner appears during ModelManager initialization
- Fades out when model is ready

### 5.2 Performance Metrics

Display FPS, bundle size, and memory usage. Use Performance API to sample metrics.

### 5.3 Glassmorphic Theme

Apply Tailwind backdrop-blur and semi-transparent panels. Toggle between Light/Dark/System via localStorage.

## 6. Dependencies

- Plan 05a (Layout Structure) — Grid layout, header
- Plan 01b (Data & Model Layer) — ModelManager, loading state

## 7. Risks & Mitigations

| Risk                 | Impact | Mitigation                                   |
| -------------------- | ------ | -------------------------------------------- |
| Theme toggle flicker | Low    | CSS variables with transition                |
| Metrics polling lag  | Low    | 1-second interval with requestAnimationFrame |

## 8. Test Strategy

| Test Type | Scope              | Location                                       |
| --------- | ------------------ | ---------------------------------------------- |
| Unit      | LoadingOverlay     | `tests/components/LoadingOverlay.test.tsx`     |
| Unit      | PerformanceMetrics | `tests/components/PerformanceMetrics.test.tsx` |
| Unit      | useTheme           | `tests/hooks/useTheme.test.ts`                 |

## 9. Files to Create / Modify

| File                                           | Action | Description                 |
| ---------------------------------------------- | ------ | --------------------------- |
| `src/components/LoadingOverlay.tsx`            | Create | Model loading overlay       |
| `src/components/PerformanceMetrics.tsx`        | Create | Performance metrics display |
| `src/hooks/useTheme.ts`                        | Create | Theme toggle hook           |
| `tests/components/LoadingOverlay.test.tsx`     | Create | LoadingOverlay tests        |
| `tests/components/PerformanceMetrics.test.tsx` | Create | PerformanceMetrics tests    |
| `tests/hooks/useTheme.test.ts`                 | Create | Theme tests                 |

## 10. Completion Checklist

- [x] All acceptance criteria met
- [x] Tests written and passing
- [x] Code reviewed
- [x] Documentation updated
- [x] No regressions in existing features
