---
name: "Testing Suite Layer"
description: "Guidelines for test authoring, mock frames, and edge-case execution pipelines."
applyTo: "tests/**/*.{ts,tsx}"
---

# Testing Suite Layer — Instruction Profile

## Scope

These instructions apply to all files under `tests/` — the test suite for components, workers, hooks, and e2e pipelines.

## Core Principles

1. **Test-First Development**: Write the failing test before writing implementation code.
2. **Isolation**: Each test is independent. No shared mutable state between tests unless explicitly documented.
3. **Descriptive Names**: Test names follow the pattern: `describe('ComponentName', () => { it('should behave correctly when X happens') })`.
4. **AAA Pattern**: Arrange → Act → Assert for every test case.

## Testing Frameworks

- **Unit/Integration**: Vitest with `@testing-library/react` for components.
- **E2E**: Playwright with `@vitest/browser` for headless Chrome.
- **Worker Threads**: `MessageChannel` mocks with `Float32Array` transferables.

## Mock Frames

### Browser Capabilities Mock

```typescript
// Mock navigator.gpu for WebGPU testing
const mockWebGPU = {
  gpu: {
    requestAdapter: vi.fn().mockResolvedValue({
      requestDevice: vi.fn().mockResolvedValue({}),
    }),
  },
};

// Mock OPFS for SQLite testing
const mockOPFS = {
  getRoot: vi.fn().mockResolvedValue({
    getFileHandle: vi.fn().mockResolvedValue({}),
    getFile: vi.fn().mockResolvedValue(new File([""], "test.db")),
  }),
};
```

### Worker Message Mock

```typescript
const mockWorkerMessage = {
  addEventListener: vi.fn(),
  postMessage: vi.fn(),
  removeEventListener: vi.fn(),
  terminate: vi.fn(),
};
```

## Test Structure

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComponentName } from 'src/components/ComponentName';

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default props', () => {
    render(<ComponentName title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    render(<ComponentName title="Test" />);
    // Act
    fireEvent.click(screen.getByText('Test'));
    // Assert
    expect(screen.getByText('Updated')).toBeInTheDocument();
  });
});
```

## Edge Case Pipelines

- **Empty state**: Test with empty arrays, null values, and undefined props.
- **Boundary conditions**: Test at min/max values, first/last items, and overflow states.
- **Async operations**: Test promise resolution, rejection, and race conditions.
- **Worker failures**: Test `onError`, `onMessage`, and `terminate` events.

## Coverage Targets

- **Components**: ≥ 80% line coverage.
- **Workers**: ≥ 75% line coverage (due to async complexity).
- **Hooks**: ≥ 85% line coverage.
- **Utils**: ≥ 90% line coverage (pure functions).
