---
title: "Plan 01a — Worker Runtime"
plan_id: "01a_worker-runtime"
status: "Complete"
author: "Planning Agent"
created: "2026-05-12"
updated: "2026-05-12"
completed: 2026-05-12
priority: "High"
story_points: 6
effort_days: 1.5
depends_on: [00_project-setup]
depends_on_external: []
phase: 1
drift_of: null
archived_date: null
archive_log: null
---

## 1. Objective

Build the worker messaging system: typed message contracts, WorkerManager class, and WebGPU feature detection. This is the transport layer — all data flows through workers using this message contract.

## 2. Scope

### In Scope

- [ ] Worker message type definitions (discriminated union)
- [ ] WorkerManager class with event routing
- [ ] Worker health check (ping/pong)
- [ ] WebGPU feature detection and capability scoring
- [ ] Worker message contract tests
- [ ] WorkerManager routing tests

### Out of Scope

- [ ] Database schema (covered in Plan 01b)
- [ ] ModelManager (covered in Plan 01b)
- [ ] Loading state orchestration (covered in Plan 01b)

## 3. Acceptance Criteria

| #   | Criterion                                                       | Verification Method | Status |
| --- | --------------------------------------------------------------- | ------------------- | ------ |
| 1   | Worker message types are TypeScript-strict discriminated unions | Unit Test           | `[ ]`  |
| 2   | WorkerManager routes messages between UI and workers            | Unit Test           | `[ ]`  |
| 3   | Worker health check ping/pong mechanism works                   | Unit Test           | `[ ]`  |
| 4   | WebGPU detection returns accurate capability assessment         | Unit Test           | `[ ]`  |
| 5   | WorkerManager terminates all workers on cleanup                 | Unit Test           | `[ ]`  |

## 4. TDD Test Cases

### Test Suite: Worker Message Contract

```typescript
// tests/workers/worker-message-contract.test.ts
describe("Worker Message Contract", () => {
  it("should type-check embedding:query message", () => {});
  it("should type-check embedding:result with Float32Array", () => {});
  it("should type-check sqlite:query message", () => {});
  it("should type-check sqlite:result message", () => {});
  it("should type-check worker:ping/pong messages", () => {});
  it("should include version field in all messages", () => {});
});
```

### Test Suite: WorkerManager

```typescript
// tests/workers/worker-manager.test.ts
describe("WorkerManager", () => {
  it("should route messages to correct handler", () => {});
  it("should send messages to embedding worker", () => {});
  it("should send messages to LLM worker", () => {});
  it("should send messages to SQLite worker", () => {});
  it("should terminate all workers on cleanup", () => {});
});
```

### Test Suite: WebGPU Detection

```typescript
// tests/workers/webgpu-detection.test.ts
describe("WebGPU Detection", () => {
  it("should detect navigator.gpu availability", () => {});
  it("should request GPU adapter and extract info", () => {});
  it("should assess GPU capability score", () => {});
  it("should recommend features based on score", () => {});
  it("should return BM25 fallback for low scores", () => {});
});
```

## 5. Technical Approach

### 5.1 Worker Message Contract

Implement typed message contract per `06_worker_threading_spec.md`. Use discriminated union pattern with TypeScript `type` and `payload` fields.

### 5.2 WorkerManager

Implement WorkerManager class with event routing. Each worker has a message channel; WorkerManager routes messages by type.

### 5.3 WebGPU Detection

Implement WebGPU feature detection and capability scoring. Return assessment with feature recommendations and fallback strategy.

## 6. Dependencies

- Plan 00 (Project Setup) — TypeScript, Vite, Vitest
- `@types/webgpu` (TypeScript types)

## 7. Risks & Mitigations

| Risk                           | Impact | Mitigation                           |
| ------------------------------ | ------ | ------------------------------------ |
| Worker message race conditions | Low    | Message ID correlation pattern       |
| WebGPU detection inconsistency | Medium | Feature detection with BM25 fallback |

## 8. Test Strategy

| Test Type | Scope                 | Location                                        |
| --------- | --------------------- | ----------------------------------------------- |
| Unit      | Worker message types  | `tests/workers/worker-message-contract.test.ts` |
| Unit      | WorkerManager routing | `tests/workers/worker-manager.test.ts`          |
| Unit      | WebGPU detection      | `tests/workers/webgpu-detection.test.ts`        |

## 9. Files to Create / Modify

| File                                            | Action | Description                     |
| ----------------------------------------------- | ------ | ------------------------------- |
| `src/types/worker-messages.ts`                  | Create | Worker message type definitions |
| `src/workers/worker-manager.ts`                 | Create | WorkerManager class             |
| `src/utils/webgpu.ts`                           | Create | WebGPU detection utility        |
| `tests/workers/worker-message-contract.test.ts` | Create | Message contract tests          |
| `tests/workers/worker-manager.test.ts`          | Create | WorkerManager tests             |
| `tests/workers/webgpu-detection.test.ts`        | Create | WebGPU detection tests          |

## 10. Completion Checklist

- [ ] All acceptance criteria met
- [ ] Tests written and passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] No regressions in existing features
