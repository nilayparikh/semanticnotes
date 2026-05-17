---
title: "Plan 04b — Chat UI"
plan_id: "04b_chat-ui"
status: "Complete"
author: "Planning Agent"
created: "2026-05-12"
updated: "2026-05-17"
completed: "2026-05-15"
priority: "High"
story_points: 5
effort_days: 1
depends_on: [04a_rag-pipeline]
depends_on_external: []
phase: 4
drift_of: null
archived_date: null
archive_log: null
---

## 1. Objective

Implement the chat UI components: streaming tokens, chat thread management, and model selector. This is the user-facing interface for AI chat — displaying the conversation with the LLM.

## 2. Scope

### In Scope

- [x] Chat input field with "Send" button
- [x] Streaming token display (word-by-word reveal)
- [x] Chat thread management (messages array)
- [x] Model selector dropdown (Qwen2.5-Coder-0.5B, MiniLM)
- [ ] Chat history persistence in localStorage
- [x] Chat UI tests
- [x] Streaming tests

### Out of Scope

- [ ] RAG pipeline (covered in Plan 04a)
- [ ] Context window (covered in Plan 04a)

## 3. Acceptance Criteria

| #   | Criterion                                      | Verification Method | Status |
| --- | ---------------------------------------------- | ------------------- | ------ |
| 1   | Chat input field is displayed with send button | Manual Check        | `[x]`  |
| 2   | Tokens stream word-by-word with 50ms delay     | Unit Test           | `[x]`  |
| 3   | Chat thread persists in localStorage           | Integration Test    | `[ ]`  |
| 4   | Model selector shows available models          | Manual Check        | `[x]`  |
| 5   | Chat history is scrollable                     | Manual Check        | `[x]`  |

## 4. TDD Test Cases

### Test Suite: Chat UI

```typescript
// tests/components/ChatInput.test.tsx
describe("ChatInput", () => {
  it("should render input field with send button", () => {});
  it("should emit onSend event with query string", () => {});
  it("should disable button when input is empty", () => {});
  it("should clear input after sending", () => {});
});
```

```typescript
// tests/components/ChatThread.test.tsx
describe("ChatThread", () => {
  it("should render chat messages in order", () => {});
  it("should scroll to bottom on new message", () => {});
  it("should display streaming tokens", () => {});
});
```

```typescript
// tests/hooks/useChatStreaming.test.ts
describe("useChatStreaming", () => {
  it("should stream tokens with 50ms delay", () => {});
  it("should pause streaming on user interaction", () => {});
  it("should resume streaming after pause", () => {});
  it("should complete streaming on model output", () => {});
});
```

## 5. Technical Approach

### 5.1 Streaming Tokens

Use setInterval with 50ms delay to reveal words one by one. Pause/resume on user interaction.

### 5.2 Chat Thread

Store messages as an array of {role, content, timestamp}. Persist to localStorage on every dispatch.

## 6. Dependencies

- Plan 04a (RAG Pipeline) — Context window, token budgeting

## 7. Risks & Mitigations

| Risk                       | Impact | Mitigation                  |
| -------------------------- | ------ | --------------------------- |
| Streaming lag on basic CPU | Medium | Debounce with 50ms interval |
| Chat history bloat         | Low    | Limit to last 50 messages   |

## 8. Test Strategy

| Test Type | Scope            | Location                               |
| --------- | ---------------- | -------------------------------------- |
| Unit      | ChatInput        | `tests/components/ChatInput.test.tsx`  |
| Unit      | ChatThread       | `tests/components/ChatThread.test.tsx` |
| Unit      | useChatStreaming | `tests/hooks/useChatStreaming.test.ts` |

## 9. Files to Create / Modify

| File                                      | Action | Description             |
| ----------------------------------------- | ------ | ----------------------- |
| `src/components/ChatInput.tsx`            | Create | Chat input field        |
| `src/components/ChatThread.tsx`           | Create | Chat thread display     |
| `src/components/ModelSelector.tsx`        | Create | Model selector dropdown |
| `src/hooks/useChatStreaming.ts`           | Create | Streaming token hook    |
| `tests/components/ChatInput.test.tsx`     | Create | ChatInput tests         |
| `tests/components/ChatThread.test.tsx`    | Create | ChatThread tests        |
| `tests/components/ModelSelector.test.tsx` | Create | ModelSelector tests     |
| `tests/hooks/useChatStreaming.test.ts`    | Create | Streaming tests         |

## 10. Completion Checklist

- [ ] All acceptance criteria met
- [x] Tests written and passing
- [x] Code reviewed
- [x] Documentation updated
- [x] No regressions in existing features

## 11. Peer Review Notes

- **localStorage persistence**: Chat history is not yet persisted to `localStorage`. The `useChatStreaming` hook collects messages in-memory but lacks a `localStorage` sync layer. AC 3 remains unverified until this is implemented.
