---
name: UI & State Management
status: proposed
date: 2026-05-11
context: React UI with WebGPU badge, SQLite badge, 3-column glassmorphism layout, dark theme
decision: Orchestrate loading states with useReducer + Promise.allSettled; implement responsive breakpoints for 3-column layout
consequences: Unified ready-state indicator, smooth mobile collapse, predictable composite UI rendering
---

# ADR-006: UI & State Management

## Problem

The UI layer faces two critical state management gaps:

1. **Loading State Race (Medium)** — The WebGPU badge shows "Active" on `navigator.gpu`, but the SQLite badge shows "Connected: 24MB". These can load in either order with no unified "Ready" state, causing UI flicker where one badge is green while the other is still spinning.

2. **Mobile Responsiveness (Low)** — The 3-column layout (20% / 55% / 25%) collapses poorly at 768px. No `@media` breakpoint or accordion collapse is defined, leaving the middle column squeezed to ~250px.

## Options Considered

### 1. Loading State Orchestration

**Option A — useReducer with composite loading state (Recommended)**

```typescript
// loading-state.ts — Composite loading orchestration
type ComponentState = "idle" | "loading" | "ready" | "error";

interface LoadingState {
  webgpu: ComponentState;
  sqlite: ComponentState;
  embeddingWorker: ComponentState;
  llmWorker: ComponentState;
}

type LoadingAction =
  | { type: "COMPONENT_START"; component: keyof LoadingState }
  | { type: "COMPONENT_READY"; component: keyof LoadingState }
  | { type: "COMPONENT_ERROR"; component: keyof LoadingState; error: string };

function loadingReducer(
  state: LoadingState,
  action: LoadingAction,
): LoadingState {
  switch (action.type) {
    case "COMPONENT_START":
      return { ...state, [action.component]: "loading" };
    case "COMPONENT_READY":
      return { ...state, [action.component]: "ready" };
    case "COMPONENT_ERROR":
      return { ...state, [action.component]: "error" };
    default:
      return state;
  }
}

// Derived state: "All Ready" flag
function isFullyReady(state: LoadingState): boolean {
  return Object.values(state).every((s) => s === "ready");
}

function hasAnyError(state: LoadingState): boolean {
  return Object.values(state).some((s) => s === "error");
}
```

**Option B — Promise.allSettled at initialization**

```typescript
useEffect(() => {
  const init = async () => {
    const results = await Promise.allSettled([
      initWebGPU(),
      initSQLite(),
      initEmbeddingWorker(),
      initLLMWorker(),
    ]);

    results.forEach((result, index) => {
      const component = ["webgpu", "sqlite", "embeddingWorker", "llmWorker"][
        index
      ];
      if (result.status === "fulfilled") {
        dispatch({ type: "COMPONENT_READY", component });
      } else {
        dispatch({
          type: "COMPONENT_ERROR",
          component: component,
          error: result.reason.message,
        });
      }
    });
  };
  init();
}, []);
```

**Option C — Zustand store for atomic state**

```typescript
const useLoadingStore = create<LoadingState>()(
  immer((set) => ({
    webgpu: "idle",
    sqlite: "idle",
    embeddingWorker: "idle",
    llmWorker: "idle",
    markReady: (component) =>
      set((s) => {
        s[component] = "ready";
      }),
    markLoading: (component) =>
      set((s) => {
        s[component] = "loading";
      }),
  })),
);
```

### 2. Mobile Responsiveness

**Option A — CSS Grid with `@media` breakpoints (Recommended)**

```css
/* app-layout.css — 3-column responsive layout */
.semanticnotes-layout {
  display: grid;
  grid-template-columns: 20% 55% 25%;
  gap: 16px;
  height: 100vh;
}

/* Tablet: collapse to 2-column (sidebar + main) */
@media (max-width: 1024px) {
  .semanticnotes-layout {
    grid-template-columns: 1fr 3fr;
  }
  .semanticnotes-sidebar {
    grid-column: 1 / 2;
  }
  .semanticnotes-main {
    grid-column: 2 / 3;
  }
  .semanticnotes-details {
    grid-column: 1 / -1;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
}

/* Mobile: single column with accordion */
@media (max-width: 768px) {
  .semanticnotes-layout {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .semanticnotes-sidebar {
    grid-column: 1;
    max-height: 30vh;
    overflow-y: auto;
  }
  .semanticnotes-main {
    grid-column: 1;
  }
  .semanticnotes-details {
    grid-column: 1;
    max-height: 40vh;
    overflow-y: auto;
  }
}
```

**Option B — Flexbox with `flex-wrap`**

```css
.semanticnotes-layout {
  display: flex;
  flex-wrap: wrap;
}
.semanticnotes-sidebar {
  flex: 0 0 20%;
}
.semanticnotes-main {
  flex: 0 0 55%;
}
.semanticnotes-details {
  flex: 0 0 25%;
}

@media (max-width: 768px) {
  .semanticnotes-sidebar {
    flex: 0 0 100%;
    max-height: 200px;
  }
  .semanticnotes-main {
    flex: 0 0 100%;
  }
  .semanticnotes-details {
    flex: 0 0 100%;
  }
}
```

**Option C — CSS Container Queries (modern, less browser support)**

```css
.semanticnotes-layout {
  display: grid;
  grid-template-columns: subgrid;
  container-type: inline-size;
}

@container (max-width: 768px) {
  .semanticnotes-sidebar {
    grid-column: 1 / -1;
  }
}
```

### 3. Glassmorphism Dark Theme for Mobile

```css
/* Glassmorphism card styling */
.glass-card {
  background: rgba(30, 30, 42, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* Mobile-specific glass adjustments */
@media (max-width: 768px) {
  .glass-card {
    background: rgba(30, 30, 42, 0.8); /* More opacity on mobile */
    backdrop-filter: blur(8px); /* Reduce blur for performance */
    border-radius: 8px;
    padding: 12px;
  }
}
```

## Recommended Approach

### 1. Composite Loading State with useReducer + Promise.allSettled

Combine **Option A** (useReducer) and **Option B** (Promise.allSettled) for a unified approach:

```typescript
// App.tsx — Root orchestration
function App() {
  const [loading, dispatch] = useReducer(loadingReducer, {
    webgpu: 'idle',
    sqlite: 'idle',
    embeddingWorker: 'idle',
    llmWorker: 'idle'
  });

  useEffect(() => {
    dispatch({ type: 'COMPONENT_START', component: 'webgpu' });
    navigator.gpu.requestDevice().then(
      () => dispatch({ type: 'COMPONENT_READY', component: 'webgpu' }),
      (e) => dispatch({ type: 'COMPONENT_ERROR', component: 'webgpu', error: e.message })
    );

    dispatch({ type: 'COMPONENT_START', component: 'sqlite' });
    waSqlite.init().then(
      () => dispatch({ type: 'COMPONENT_READY', component: 'sqlite' }),
      (e) => dispatch({ type: 'COMPONENT_ERROR', component: 'sqlite', error: e.message })
    );

    dispatch({ type: 'COMPONENT_START', component: 'embeddingWorker' });
    dispatch({ type: 'COMPONENT_START', component: 'llmWorker' };
    // Workers signal readiness via postMessage
  }, []);

  const ready = isFullyReady(loading);
  const hasError = hasAnyError(loading);

  return (
    <div className="semanticnotes-layout">
      <LoadingOverlay ready={ready} error={hasError} state={loading} />
      <Sidebar />
      <MainContent />
      <DetailsPanel />
    </div>
  );
}
```

### 2. CSS Grid with Progressive Collapse

Use **Option A** (CSS Grid with `@media`) as the primary layout strategy. The 3-column grid collapses at two breakpoints:

| Breakpoint | Layout               | Sidebar | Main | Details          |
| ---------- | -------------------- | ------- | ---- | ---------------- |
| ≥ 1024px   | 3-column             | 20%     | 55%  | 25%              |
| 768–1024px | 2-column             | 1fr     | 3fr  | Full width below |
| < 768px    | 1-column (accordion) | 30vh    | full | 40vh             |

## Trade-offs

| Trade-off                                                        | Impact                                                   |
| ---------------------------------------------------------------- | -------------------------------------------------------- |
| useReducer adds boilerplate over useState                        | Reduces prop-drilling; centralizes state transitions     |
| CSS Grid requires `grid-column` overrides at each breakpoint     | More verbose than flexbox but more predictable           |
| Reducing `backdrop-filter` blur on mobile saves ~2% GPU          | Slightly less "glass" aesthetic on smaller screens       |
| LoadingOverlay blocks interaction until all components are ready | Users can tap through, but need to avoid race conditions |

## Open Questions

1. Should the LoadingOverlay be dismissible (tap-to-continue) or blocking (spinner + progress bar)?

- [Nilay - 2026-05-11] - The LoadingOverlay will be blocking until all components are ready to ensure a consistent user experience and avoid potential race conditions. However, we can add a "Retry" button if any component fails to load, allowing users to attempt initialization again without refreshing the page.

2. Do we need a "partially ready" state where users can browse notes before all workers are initialized?

- [Nilay - 2026-05-11] - For the initial release, we will require all components to be ready before allowing users to interact with the app. This ensures that all features are available and prevents confusion. We can consider a "partially ready" state in a future update if there is demand for early access to certain features.

But WebGPU assessment can be done post load. Trigger if no past assessment exists or initial setup.

3. Should the 3-column layout use CSS `aspect-ratio` for the detail cards on mobile, or stick to `max-height`?

- [Nilay - 2026-05-11] - Full screen, this app is designed for web desktop, hence full screen 100% width and 100% height. Fix the solution for Tablets and Desktop Browser. Follow the `mock` for design.

4. Is the dark glassmorphism theme performant enough on mobile Safari (which has weaker `backdrop-filter` support than Chrome)?

- [Nilay - 2026-05-11] - Yes, the adjusted glassmorphism styles with reduced blur and increased opacity should be performant on mobile Safari while still providing a visually appealing design. We can further optimize if performance issues arise. But also ensure this app is designed for web desktop.

# Status

## 11/05/2026

- All recommendations are accepted.
- Open questions are answered.
