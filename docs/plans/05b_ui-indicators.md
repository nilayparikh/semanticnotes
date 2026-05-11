# Plan 05b — UI Indicators

**Status**: `Draft`  
**Author**: Planning Agent  
**Created**: 2026-05-12  
**Last Updated**: 2026-05-12  
**Priority**: `Medium`  
**Estimated Effort**: 4 Story Points / 0.5 Days

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

| #   | Criterion                                                   | Status |
| --- | ----------------------------------------------------------- | ------ |
| 1   | Loading overlay displays model progress                     | `[ ]`  |
| 2   | Performance metrics show FPS, bundle size, memory           | `[ ]`  |
| 3   | Glassmorphic theme uses backdrop-blur and semi-transparency | `[ ]`  |
| 4   | Theme toggle switches between Light/Dark/System             | `[ ]`  |
| 5   | UI indicators pass visual tests                             | `[ ]`  |

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

- [ ] All acceptance criteria met
- [ ] Tests written and passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] No regressions in existing features
