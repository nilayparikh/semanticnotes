---
title: "Plan 06 — Code Quality & Bug Fixes"
plan_id: "drift-2026-05-12-13-22-06_code_quality"
status: "Complete"
author: "Change Agent"
created: "2026-05-12"
updated: "2026-05-12"
completed: "2026-05-12"
priority: "Critical"
story_points: 2
effort_days: 0.5
depends_on: []
depends_on_external: []
phase: null
parent_drift_index: "docs/plans/drifts/README.md"
source_drifts: ["#9", "#10", "#11", "#12", "#13"]
drift_of: null
archived_date: null
archive_log: null
---

## 1. Objective

Fix high-severity bugs identified in the implementation review report: WorkerManager `ping()` method, WebGPU `assessCapability()` API, `useNoteSaveDebounce` memory leak, optimistic locking enforcement, and `NoteList` performance optimization.

## 2. Scope

### In Scope

- [x] Refactor `WorkerManager.ping()` to use `addEventListener` instead of `onmessage`
- [x] Replace `getInfo()` with `requestDevice()` in `assessCapability()`
- [x] Add `useEffect` cleanup to `useNoteSaveDebounce` to clear timeout on unmount
- [x] Add `note_version` increment in `UPDATE_NOTE` reducer case
- [x] Add `useMemo` optimization to `NoteList` sorting

### Out of Scope

- [ ] UI theme changes (covered in Phase 3)
- [ ] Layout structure changes (covered in Phase 4)
- [ ] Missing components (covered in Phase 5)

## 3. Acceptance Criteria

| #   | Criterion                                      | Verification Method | Status |
| --- | ---------------------------------------------- | ------------------- | ------ |
| 1   | `WorkerManager.ping()` uses `addEventListener` | Unit Test           | `[x]`  |
| 2   | `assessCapability()` uses `requestDevice()`    | Unit Test           | `[x]`  |
| 3   | `useNoteSaveDebounce` has `useEffect` cleanup  | Unit Test           | `[x]`  |
| 4   | `note_version` increments on `UPDATE_NOTE`     | Unit Test           | `[x]`  |
| 5   | `NoteList` uses `useMemo` for sorting          | Unit Test           | `[x]`  |

## 4. TDD Test Cases

### Test Suite: WorkerManager

```typescript
// tests/workers/worker-manager.test.ts
describe("WorkerManager", () => {
  it("should use addEventListener for ping", () => {
    // Verify addEventListener is used instead of onmessage
  });

  it("should not clobber onmessage handler", () => {
    // Verify multiple listeners can coexist
  });
});
```

### Test Suite: useNoteSaveDebounce

```typescript
// tests/hooks/useNoteSaveDebounce.test.ts
describe("useNoteSaveDebounce", () => {
  it("should clear timeout on unmount", () => {
    // Verify useEffect cleanup
  });

  it("should debounce save calls", () => {
    // Verify 1000ms debounce
  });
});
```

### Test Suite: useNoteManager

```typescript
// tests/hooks/useNoteManager.test.ts
describe("useNoteManager", () => {
  it("should increment note_version on UPDATE_NOTE", () => {
    // Verify version increment
  });
});
```

## 5. Technical Approach

### 5.1 Fix WorkerManager.ping()

Replace `onmessage` with `addEventListener`:

```typescript
// src/workers/worker-manager.ts
ping(workerId: string, timeout = 5000): Promise<void> {
  const entry = this.workers.get(workerId);
  if (!entry) {
    throw new Error(`Worker ${workerId} not found`);
  }

  return new Promise((resolve, reject) => {
    const correlationId = `${workerId}-ping-${Date.now()}`;

    const handler = (e: MessageEvent) => {
      if (e.data.id === correlationId && e.data.type === 'PONG') {
        entry.worker.removeEventListener('message', handler);
        clearTimeout(timer);
        resolve();
      }
    };

    entry.worker.addEventListener('message', handler);

    const timer = setTimeout(() => {
      entry.worker.removeEventListener('message', handler);
      reject(new Error(`Worker ${workerId} ping timeout`));
    }, timeout);

    entry.worker.postMessage({ type: 'PING', id: correlationId });
  });
}
```

### 5.2 Fix assessCapability()

Replace `getInfo()` with `requestDevice()`:

```typescript
// src/utils/webgpu.ts
export async function assessCapability(): Promise<WebGPUCapability> {
  const gpu = navigator.gpu;
  if (!gpu) return { available: false, score: 0, strategy: "fallback" };

  const adapter = await gpu.requestAdapter();
  if (!adapter) return { available: false, score: 0, strategy: "fallback" };

  try {
    const device = await adapter.requestDevice();
    const score = device.limits.maxBufferBindingSize > 0 ? 1 : 0;
    return { available: true, score, strategy: "webgpu" };
  } catch {
    return { available: false, score: 0, strategy: "fallback" };
  }
}
```

### 5.3 Fix useNoteSaveDebounce Memory Leak

Add `useEffect` cleanup:

```typescript
// src/hooks/useNoteSaveDebounce.ts
export function useNoteSaveDebounce(
  note: Note,
  onSave: (note: Note) => void,
  delay = 1000,
) {
  const lastSavedRef = useRef<Note>(note);

  useEffect(() => {
    if (lastSavedRef.current !== note) {
      lastSavedRef.current = note;
    }
  }, [note]);

  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return useCallback(() => {
    timerRef.current = setTimeout(() => {
      onSave(note);
    }, delay);
  }, [note, onSave, delay]);
}
```

### 5.4 Fix Optimistic Locking

Add `note_version` increment:

```typescript
// src/hooks/useNoteManager.ts
case 'UPDATE_NOTE': {
  const updatedNotes = state.notes.map(n => {
    if (n.id === action.payload.id) {
      return {
        ...n,
        ...action.payload,
        note_version: n.note_version + 1,
        updated_at: new Date().toISOString()
      };
    }
    return n;
  });
  return { ...state, notes: updatedNotes };
}
```

### 5.5 Fix NoteList Performance

Add `useMemo` optimization:

```typescript
// src/components/NoteList.tsx
import { useMemo } from 'react';

export function NoteList({ notes, selectedId, onSelect }) {
  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [notes]);

  return (
    <nav role="listbox" aria-label="Notes">
      {sortedNotes.map(note => (
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

## 6. Dependencies

- No dependencies on other phases
- Can run in parallel with Phases 3-5

## 7. Risks & Mitigations

| Risk                      | Impact | Mitigation                 |
| ------------------------- | ------ | -------------------------- |
| WorkerManager API changes | Medium | Test with existing workers |
| WebGPU API compatibility  | Low    | Test on multiple browsers  |
| Memory leak regression    | High   | Add unit tests for cleanup |

## 8. Test Strategy

| Test Type | Scope                | Location                                  |
| --------- | -------------------- | ----------------------------------------- |
| Unit      | WorkerManager.ping   | `tests/workers/worker-manager.test.ts`    |
| Unit      | useNoteSaveDebounce  | `tests/hooks/useNoteSaveDebounce.test.ts` |
| Unit      | useNoteManager       | `tests/hooks/useNoteManager.test.ts`      |
| Unit      | NoteList performance | `tests/components/NoteList.test.tsx`      |

## 9. Files to Create / Modify

| File                               | Action | Description                                   |
| ---------------------------------- | ------ | --------------------------------------------- |
| `src/workers/worker-manager.ts`    | Modify | Use `addEventListener` in `ping()`            |
| `src/utils/webgpu.ts`              | Modify | Use `requestDevice()` in `assessCapability()` |
| `src/hooks/useNoteSaveDebounce.ts` | Modify | Add `useEffect` cleanup                       |
| `src/hooks/useNoteManager.ts`      | Modify | Add `note_version` increment                  |
| `src/components/NoteList.tsx`      | Modify | Add `useMemo` for sorting                     |

## 10. Completion Checklist

- [ ] All acceptance criteria met
- [ ] All tests passing
- [ ] No regressions in existing features
- [ ] Drift report updated to mark drifts #9, #10, #11, #12, #13 as `Resolved`
