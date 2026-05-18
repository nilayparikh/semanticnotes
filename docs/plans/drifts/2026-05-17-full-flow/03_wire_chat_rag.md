---
title: "Group 3 — Wire AI Chat RAG Pipeline"
plan_id: "drift-2026-05-17-full-flow-03_chat_rag"
status: "Complete"
author: "Planning Agent"
created: "2026-05-17"
updated: "2026-05-17"
completed: "2026-05-17"
priority: "Critical"
story_points: 4
effort_days: 0.75
depends_on: ["drift-2026-05-17-full-flow-01_sqlite_storage"]
depends_on_external: ["@xenova/transformers"]
phase: null
parent_drift_index: "docs/plans/drifts/2026-05-17-full-flow/README.md"
source_drifts: ["drift-2026-05-17-assessment#critical-3"]
archived_date: null
archive_log: null
---

## 1. Objective

Connect the `AIChat` component to the `useRagPipeline` hook and `llm.worker.ts`. Replace hardcoded simulated responses with real RAG retrieval → LLM token streaming.

## 2. Scope

### In Scope

- [ ] Wire `AIChat` submit button to `useRagPipeline.execute()`
- [ ] Instantiate `llm.worker.ts` for text generation
- [ ] Replace simulated response with LLM worker generation stream
- [ ] Surface retrieval context (top-2 notes) in chat thread
- [ ] Connect model selector to `useModelManager` for load/unload
- [ ] Persist chat history to SQLite (not localStorage)

### Out of Scope

- Model download UI (Group 5)
- Loading overlay (Group 4)
- UI styling changes

## 3. Acceptance Criteria

| #   | Criterion                                               | Verification Method | Status |
| --- | ------------------------------------------------------- | ------------------- | ------ |
| 1   | Chat submit triggers RAG retrieval                      | Integration Test    | `[ ]`  |
| 2   | RAG selects top-2 notes by cosine similarity            | Unit Test           | `[ ]`  |
| 3   | LLM worker generates tokens from context + query        | Integration Test    | `[ ]`  |
| 4   | Tokens stream to chat UI in real time                   | Manual              | `[ ]`  |
| 5   | Retrieved notes are displayed in chat thread as context | Manual              | `[ ]`  |
| 6   | Chat history persists to SQLite                         | Integration Test    | `[ ]`  |

## 4. Current Code Analysis

### `src/components/AIChat.tsx` (lines 45-65)

```typescript
// Simulated response
const assistantMessage: ChatMessage = {
  role: "assistant",
  content: "I'm processing your query about your notes...",
  timestamp: new Date().toISOString(),
};
```

### `src/hooks/useRagPipeline.ts`

Hook exists with `execute()` method. Takes query + notes with embeddings, returns top-N context notes. Query embedding uses deterministic hash stub.

### `src/workers/llm.worker.ts`

Worker handles `INIT_MODEL` and `GENERATE` messages. Sends `GENERATION_READY` with output.

### `src/hooks/useChatStreaming.ts`

Streaming hook exists — `startStreaming()`, `stop()`, `isStreaming`, `displayText`.

## 5. Technical Approach

### 5.1 Instantiate LLM Worker

```typescript
// src/App.tsx or AIChat.tsx
import LlmWorker from "@/workers/llm.worker.ts";

const llmWorker = useMemo(() => new LlmWorker(), []);
```

### 5.2 Wire Chat Submit → RAG → LLM

```typescript
// src/components/AIChat.tsx
const { execute, isProcessing, lastResult } = useRagPipeline();

const handleSend = async (query: string) => {
  // 1. RAG retrieval
  const result = await execute({ query, notes: notesWithEmbeddings, topN: 2 });

  // 2. Build prompt from context
  const context = result.context
    .map((n) => `<note>${n.title}: ${n.content}</note>`)
    .join("\n");
  const prompt = `Given the following notes:\n${context}\n\nAnswer: ${query}`;

  // 3. LLM generation
  llmWorker.postMessage({ type: "GENERATE", prompt, maxTokens: 256 });
};
```

### 5.3 Stream Tokens to UI

```typescript
// Listen for GENERATION_READY from llmWorker
llmWorker.onmessage = (e) => {
  if (e.data.type === "GENERATION_READY") {
    streaming.startStreaming(e.data.output);
  }
};
```

### 5.4 Persist Chat to SQLite

Create a `chat_messages` table and store messages:

```sql
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp DATETIME DEFAULT (datetime('now'))
);
```

## 6. TDD Test Cases

```typescript
// tests/hooks/useRagPipeline.integration.test.ts
describe("useRagPipeline with notes", () => {
  it("should select top-2 notes by cosine similarity", () => {});
  it("should limit context to 256 tokens per note", () => {});
  it("should return RagResult with context array", () => {});
});

// tests/components/AIChat.test.tsx
describe("AIChat with RAG", () => {
  it("should call execute on submit", () => {});
  it("should display streaming tokens", () => {});
  it("should show retrieved notes as context", () => {});
});
```

## 7. Files to Modify

| File                                      | Change                                            |
| ----------------------------------------- | ------------------------------------------------- |
| `src/App.tsx`                             | Instantiate `llm.worker`, pass notes to `AIChat`  |
| `src/components/AIChat.tsx`               | Wire submit → RAG → LLM, remove simulation        |
| `src/hooks/useRagPipeline.ts`             | Replace hash stub with real embedding worker call |
| `src/components/SemanticContextPanel.tsx` | Pass notes to `AIChat` for RAG context            |
