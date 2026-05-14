---
title: "Plan 04a — RAG Pipeline"
plan_id: "04a_rag-pipeline"
status: "Draft"
author: "Planning Agent"
created: "2026-05-12"
updated: "2026-05-12"
completed: null
priority: "High"
story_points: 5
effort_days: 1
depends_on: [03b_semantic-search]
depends_on_external: []
phase: 4
drift_of: null
archived_date: null
archive_log: null
---

## 1. Objective

Build the RAG (Retrieval-Augmented Generation) pipeline: query embedding, context window management, and token budgeting. This is the bridge between semantic search and the LLM — selecting the most relevant notes to feed into the chat context.

## 2. Scope

### In Scope

- [ ] RAG query embedding (reuse all-MiniLM-L6-v2)
- [ ] Context window selection (top-N notes by cosine similarity)
- [ ] Token budgeting (256 tokens per note, max 128 notes)
- [ ] RAG pipeline hook
- [ ] Context window management
- [ ] RAG pipeline tests
- [ ] Token budgeting tests

### Out of Scope

- [ ] Chat UI components (covered in Plan 04b)
- [ ] Streaming tokens (covered in Plan 04b)

## 3. Acceptance Criteria

| #   | Criterion                                          | Verification Method | Status |
| --- | -------------------------------------------------- | ------------------- | ------ |
| 1   | RAG query selects top-N notes by cosine similarity | Unit Test           | `[ ]`  |
| 2   | Context window is limited to 256 tokens per note   | Unit Test           | `[ ]`  |
| 3   | Token budgeting prevents overflow (max 128 notes)  | Unit Test           | `[ ]`  |
| 4   | RAG pipeline is called before chat completion      | Integration Test    | `[ ]`  |
| 5   | Context window is updated on note changes          | Integration Test    | `[ ]`  |

## 4. TDD Test Cases

### Test Suite: RAG Pipeline

```typescript
// tests/hooks/useRagPipeline.test.ts
describe("useRagPipeline", () => {
  it("should select top-N notes by cosine similarity", () => {});
  it("should limit context window to 256 tokens per note", () => {});
  it("should enforce max 128 notes in context", () => {});
  it("should update context window on note changes", () => {});
  it("should call RAG pipeline before chat completion", () => {});
});
```

### Test Suite: Token Budgeting

```typescript
// tests/utils/token-budgeting.test.ts
describe("Token Budgeting", () => {
  it("should calculate token count for a note", () => {});
  it("should truncate note to 256 tokens", () => {});
  it("should select top-N notes within budget", () => {});
  it("should handle empty context", () => {});
});
```

## 5. Technical Approach

### 5.1 Context Window

Follow `05_context_window_spec.md`:

- Sliding window of 128 notes
- 256 tokens per note
- Token budgeting to prevent overflow

### 5.2 RAG Pipeline

Reuse embedding pipeline from Plan 03a. Select top-N notes by cosine similarity, truncate to token budget, and feed into LLM context.

## 6. Dependencies

- Plan 03b (Semantic Search) — Query embedding, similarity scoring

## 7. Risks & Mitigations

| Risk                          | Impact | Mitigation                         |
| ----------------------------- | ------ | ---------------------------------- |
| Context window overflow       | Medium | Token budgeting with max 128 notes |
| Stale context on note updates | Low    | Debounced context refresh (300ms)  |

## 8. Test Strategy

| Test Type | Scope           | Location                              |
| --------- | --------------- | ------------------------------------- |
| Unit      | RAG pipeline    | `tests/hooks/useRagPipeline.test.ts`  |
| Unit      | Token budgeting | `tests/utils/token-budgeting.test.ts` |

## 9. Files to Create / Modify

| File                                  | Action | Description                   |
| ------------------------------------- | ------ | ----------------------------- |
| `src/hooks/useRagPipeline.ts`         | Create | RAG pipeline hook             |
| `src/hooks/useContextWindow.ts`       | Create | Context window management     |
| `src/utils/token-budgeting.ts`        | Create | Token counting and truncation |
| `tests/hooks/useRagPipeline.test.ts`  | Create | RAG pipeline tests            |
| `tests/utils/token-budgeting.test.ts` | Create | Token budgeting tests         |

## 10. Completion Checklist

- [ ] All acceptance criteria met
- [ ] Tests written and passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] No regressions in existing features
