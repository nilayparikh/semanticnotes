---
title: "Group 4 — Startup Loading Overlay"
plan_id: "drift-2026-05-17-full-flow-04_loading_overlay"
status: "Complete"
author: "Planning Agent"
created: "2026-05-17"
updated: "2026-05-17"
completed: "2026-05-17"
priority: "High"
story_points: 2
effort_days: 0.25
depends_on: ["drift-2026-05-17-full-flow-01_sqlite_storage"]
depends_on_external: []
phase: null
parent_drift_index: "docs/plans/drifts/2026-05-17-full-flow/README.md"
source_drifts: ["drift-2026-05-17-assessment#critical-4"]
archived_date: null
archive_log: null
---

## 1. Objective

Render the `LoadingOverlay` component during app initialization. Use `useLoadingState` hook to orchestrate component states (WebGPU, SQLite, Embedding Worker, LLM Worker) and display a blocking overlay with per-component status and retry capability.

## 2. Scope

### In Scope

- [ ] Import and render `LoadingOverlay` in `App.tsx`
- [ ] Use `useLoadingState` hook to track component initialization
- [ ] Transition components: `idle -> loading -> ready/error`
- [ ] Show retry button on error state
- [ ] Compute progress percentage from component states
- [ ] Hide overlay when `fullyReady` is true

### Out of Scope

- Model download UI (Group 5)
- Chat wiring (Group 3)
- New component creation

## 3. Acceptance Criteria

| #   | Criterion                                                        | Verification Method | Status |
| --- | ---------------------------------------------------------------- | ------------------- | ------ |
| 1   | `LoadingOverlay` renders on app mount                            | Manual              | `[ ]`  |
| 2   | Each component shows individual state (WebGPU, SQLite, etc.)     | Manual              | `[ ]`  |
| 3   | Overlay hides when all components are `ready`                    | Manual              | `[ ]`  |
| 4   | Retry button appears on error and reinitializes failed component | Manual              | `[ ]`  |
| 5   | Progress bar reflects percentage of ready components             | Manual              | `[ ]`  |

## 4. Current Code Analysis

### `src/App.tsx`

No `LoadingOverlay` or `useLoadingState` imported or used. App renders immediately without initialization gate.

### `src/hooks/useLoadingState.ts`

Hook exists with:

- `state`: `{ webgpu, sqlite, embeddingWorker, llmWorker }`
- `startComponent()`, `readyComponent()`, `errorComponent()`
- `fullyReady`, `hasError` computed properties
- `isFullyReady()`, `hasAnyError()` helpers

### `src/components/LoadingOverlay.tsx`

Component exists with `progress`, `message`, `visible` props. Simple progress bar implementation.

## 5. Technical Approach

### 5.1 Add Loading State to App

```typescript
// src/App.tsx
import { useLoadingState, INITIAL_LOADING_STATE } from "@/hooks/useLoadingState";
import { LoadingOverlay } from "@/components/LoadingOverlay";

export default function App() {
  const { state, startComponent, readyComponent, errorComponent, fullyReady, hasError } = useLoadingState();

  // Initialize components sequentially
  useEffect(() => {
    // 1. SQLite
    startComponent("sqlite");
    dbService.initialize()
      .then(() => readyComponent("sqlite"))
      .catch((e) => errorComponent("sqlite", e.message));

    // 2. WebGPU
    startComponent("webgpu");
    // Detect WebGPU...
    readyComponent("webgpu");

    // 3. Embedding Worker
    startComponent("embeddingWorker");
    // ...
  }, []);
```

### 5.2 Render LoadingOverlay

```typescript
const progress = Math.round(
  (Object.values(state).filter(s => s === "ready").length / 4) * 100
);

return (
  <div className="h-screen bg-background flex flex-col">
    <LoadingOverlay
      visible={!fullyReady}
      progress={progress}
      message={hasError ? "Initialization error" : "Initializing SemanticNotes..."}
    />
    {/* App content */}
  </div>
);
```

### 5.3 Retry Logic

```typescript
const handleRetry = () => {
  // Reset all to idle and reinitialize
  // ...
};
```

## 6. TDD Test Cases

```typescript
// tests/hooks/useLoadingState.test.ts
describe("useLoadingState", () => {
  it("should start with all components idle", () => {});
  it("should transition component to loading", () => {});
  it("should transition component to ready", () => {});
  it("should transition component to error", () => {});
  it("should compute fullyReady correctly", () => {});
  it("should compute hasAnyError correctly", () => {});
});

// tests/components/LoadingOverlay.test.tsx
describe("LoadingOverlay", () => {
  it("should render when visible is true", () => {});
  it("should hide when visible is false", () => {});
  it("should display progress percentage", () => {});
});
```

## 7. Files to Modify

| File          | Change                                                                                 |
| ------------- | -------------------------------------------------------------------------------------- |
| `src/App.tsx` | Import `useLoadingState`, `LoadingOverlay`; orchestrate initialization; render overlay |
