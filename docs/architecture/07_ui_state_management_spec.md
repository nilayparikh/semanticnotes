# UI State Management Specification

## 1. Overview

The UI layer uses **React** with **useReducer** for composite loading state orchestration. The layout is a full-screen 3-column glassmorphic dark theme designed for desktop browsers.

## 2. Loading State Orchestration

### 2.1 Composite Loading State

```typescript
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

function isFullyReady(state: LoadingState): boolean {
  return Object.values(state).every((s) => s === "ready");
}

function hasAnyError(state: LoadingState): boolean {
  return Object.values(state).some((s) => s === "error");
}
```

### 2.2 Initialization Flow

```typescript
function App() {
  const [loading, dispatch] = useReducer(loadingReducer, {
    webgpu: 'idle',
    sqlite: 'idle',
    embeddingWorker: 'idle',
    llmWorker: 'idle',
  });

  useEffect(() => {
    dispatch({ type: 'COMPONENT_START', component: 'webgpu' });
    navigator.gpu.requestDevice().then(
      () => dispatch({ type: 'COMPONENT_READY', component: 'webgpu' }),
      (e) => dispatch({ type: 'COMPONENT_ERROR', component: 'webgpu', error: e.message }),
    );

    dispatch({ type: 'COMPONENT_START', component: 'sqlite' });
    waSqlite.init().then(
      () => dispatch({ type: 'COMPONENT_READY', component: 'sqlite' }),
      (e) => dispatch({ type: 'COMPONENT_ERROR', component: 'sqlite', error: e.message }),
    );

    dispatch({ type: 'COMPONENT_START', component: 'embeddingWorker' });
    dispatch({ type: 'COMPONENT_START', component: 'llmWorker' });
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

## 3. Layout System

### 3.1 3-Column Grid Layout

```css
.semanticnotes-layout {
  display: grid;
  grid-template-columns: 20% 55% 25%;
  gap: 16px;
  height: 100vh;
  width: 100vw;
}

/* Desktop: 3-column layout */
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
```

### 3.2 Breakpoint Strategy

| Breakpoint | Layout   | Sidebar | Main | Details          |
| ---------- | -------- | ------- | ---- | ---------------- |
| ≥ 1024px   | 3-column | 20%     | 55%  | 25%              |
| < 1024px   | 2-column | 1fr     | 3fr  | Full width below |

> **Note:** Per ADR-006, the layout is desktop-first. Tablet (< 1024px) collapses to 2-column; mobile breakpoints (< 768px) are excluded from the initial release.

## 4. Glassmorphic Theme

### 4.1 Dark Theme Styling

```css
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
```

### 4.2 Theme Tokens

| Token      | Value                     | Purpose               |
| ---------- | ------------------------- | --------------------- |
| Background | rgba(30, 30, 42, 0.6)     | Glass card background |
| Blur       | 12px                      | Backdrop filter       |
| Border     | rgba(255, 255, 255, 0.08) | Subtle glass edge     |
| Radius     | 12px                      | Card corner radius    |
| Padding    | 16px                      | Internal spacing      |

## 5. Loading Overlay

### 5.1 Blocking Overlay

```typescript
interface LoadingOverlayProps {
  ready: boolean;
  error: boolean;
  state: LoadingState;
  onRetry: () => void;
}

function LoadingOverlay({ ready, error, state, onRetry }: LoadingOverlayProps) {
  if (ready && !error) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <div className="loading-components">
        {Object.entries(state).map(([component, status]) => (
          <div key={component} className={`component-status ${status}`}>
            <span>{component}</span>
            <span>{status}</span>
          </div>
        ))}
      </div>
      {error && (
        <button className="retry-button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
```

## 6. Error Handling

| Error               | Recovery                           |
| ------------------- | ---------------------------------- |
| Component load fail | Retry button in overlay            |
| WebGPU device lost  | Auto-recover with indicator        |
| SQLite mount race   | Promise-gated readiness            |
| Worker crash        | Health check restart               |
| Partial ready state | Blocking overlay (initial release) |

## 7. References

- ADR-006: UI & State Management
- [React useReducer](https://react.dev/reference/react/useReducer)
- [CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
