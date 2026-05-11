---
name: LLM & Context Window Management
status: proposed
date: 2026-05-11
context: Qwen2.5-Coder-0.5B-Instruct RAG pipeline with wa-sqlite + OPFS + WebGPU + Transformers.js
decision: Implement token-aware context budgeting with sliding-window truncation and rAF-batched streaming
consequences: Bounded context injection, predictable answer quality, smoother UI during streaming
---

# ADR-004: LLM & Context Window Management

## Problem

The RAG pipeline faces three interrelated context window challenges:

1. **Context Window Overflow (High)** — Qwen2.5-Coder-0.5B-Instruct has a ~2,048 token context window. When top-2 retrieved notes total ~3,000 tokens, the injected context exceeds the window, and the model silently truncates the last tokens (typically the user question).

2. **System Prompt Token Budget (Medium)** — The RAG wrapper injects context + question + system prompt. No hard cap is defined, risking token starvation for the actual answer output.

3. **Streaming Token Backpressure (Medium)** — Streaming tokens to React state on every token can cause ~30 fps UI jitter due to excessive re-renders.

## Options Considered

### 1. Context Window Overflow

**Option A — Fixed token budget per note with hard truncation**

```javascript
const MAX_CONTEXT_TOKENS = 1800;
const MAX_PER_NOTE_TOKENS = 800;

function truncateToBudget(notes, maxTokens) {
  return notes.map((note) => {
    const tokens = tokenize(note.text);
    if (tokens.length > maxTokens) {
      return { ...note, text: detokenize(tokens.slice(0, maxTokens)) };
    }
    return note;
  });
}
```

**Option B — Sliding window with priority scoring (Recommended)**

Assign a relevance score to each note from the embedding pipeline, then use a sliding window that keeps the highest-scoring segments within the budget.

```javascript
function buildContextWindow(notes, question, maxContextTokens = 1800) {
  const systemTokens = 120; // Estimated system prompt size
  const questionTokens = tokenize(question).length;
  const available = maxContextTokens - systemTokens - questionTokens;

  // Sort by embedding score descending, keep top segments
  const scored = notes
    .map((n) => ({
      note: n,
      tokens: tokenize(n.text).length,
      score: n.embeddingScore,
    }))
    .sort((a, b) => b.score - a.score);

  let window = [];
  let count = 0;
  for (const item of scored) {
    if (count + item.tokens <= available) {
      window.push(item);
      count += item.tokens;
    } else {
      // Partial inclusion
      const remaining = available - count;
      const truncated = detokenize(
        tokenize(item.note.text).slice(0, remaining),
      );
      window.push({ ...item, note: { ...item.note, text: truncated } });
      break;
    }
  }

  return { context: window, usedTokens: count, budget: available };
}
```

**Option C — Progressive context loading with "expand" tokens**

Inject a `[+N more tokens]` marker and let the model request more context. Complex but requires model-level awareness.

### 2. System Prompt Token Budget

**Option A — Hard cap with defined allocation**

| Component      | Token Budget |
| -------------- | ------------ |
| System prompt  | 120 tokens   |
| Context notes  | 1,400 tokens |
| User question  | 300 tokens   |
| Answer reserve | 228 tokens   |
| **Total**      | **2,048**    |

```javascript
const TOKEN_BUDGET = Object.freeze({
  SYSTEM: 120,
  CONTEXT: 1400,
  QUESTION: 300,
  ANSWER_RESERVE: 228,
  TOTAL: 2048,
});

function validateBudget(system, context, question) {
  const used = system + context + question;
  if (used > TOKEN_BUDGET.TOTAL - TOKEN_BUDGET.ANSWER_RESERVE) {
    console.warn(`Token budget warning: ${used}/${TOKEN_BUDGET.TOTAL} used`);
  }
  return { used, remaining: TOKEN_BUDGET.TOTAL - used };
}
```

**Option B — Dynamic budget based on note count**

Scale the per-note budget inversely to the number of retrieved notes.

### 3. Streaming Token Backpressure

**Option A — requestAnimationFrame batching (Recommended)**

```javascript
function useStreamingTokens() {
  const [displayed, setDisplayed] = React.useState("");
  const bufferRef = React.useRef([]);

  React.useEffect(() => {
    let frameId;
    const batch = () => {
      if (bufferRef.current.length > 0) {
        const chunk = bufferRef.current.slice(0, 5);
        setDisplayed((prev) => prev + chunk.join(""));
        bufferRef.current = bufferRef.current.slice(5);
      }
      frameId = requestAnimationFrame(batch);
    };
    frameId = requestAnimationFrame(batch);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return {
    getDisplayed: () => displayed,
    pushToken: (token) => bufferRef.current.push(token),
  };
}
```

**Option B — useReducer with throttle**

```javascript
function streamingReducer(state, action) {
  switch (action.type) {
    case "TOKEN":
      return { ...state, buffer: [...state.buffer, action.token] };
    case "FLUSH":
      return { ...state, text: state.text + state.buffer.join(""), buffer: [] };
    default:
      return state;
  }
}

// Flush every 50ms via setInterval
```

**Option C — Virtual DOM diffing with React 19's useSyncExternalStore**

```javascript
const tokenStore = create((set) => ({
  tokens: [],
  add: (t) => set((s) => ({ ...s, tokens: [...s.tokens, t] })),
}));
```

## Recommended Approach

Adopt a **composite strategy** combining the best options above:

### 1. Token-Aware Context Injection (from Option B)

Implement `buildContextWindow()` with scoring-based sliding window. This ensures the most relevant note segments survive truncation.

### 2. Hard Token Budget (from Option A)

Define `TOKEN_BUDGET` as a frozen constant. Log warnings when the budget is exceeded but don't fail silently.

### 3. rAF-Batched Streaming (from Option A)

Use `requestAnimationFrame` batching to group 5 tokens per frame, reducing re-renders from ~50/sec to ~30/sec (at 60fps).

### Integrated Implementation

```typescript
// context-window.ts — Centralized context management
export interface TokenBudget {
  system: number;
  context: number;
  question: number;
  answerReserve: number;
  total: number;
}

export const DEFAULT_BUDGET: TokenBudget = Object.freeze({
  system: 120,
  context: 1400,
  question: 300,
  answerReserve: 228,
  total: 2048,
});

export function buildPrompt(
  system: string,
  notes: ScoredNote[],
  question: string,
  budget: TokenBudget = DEFAULT_BUDGET,
): PromptResult {
  const systemTokens = countTokens(system);
  const questionTokens = countTokens(question);
  const availableContext =
    budget.total - systemTokens - questionTokens - budget.answerReserve;

  const context = buildContextWindow(notes, Math.max(0, availableContext));

  return {
    prompt: `${system}\n\nContext:\n${context.text}\n\nQuestion: ${question}`,
    metadata: {
      systemTokens,
      contextTokens: context.usedTokens,
      questionTokens,
      totalUsed: systemTokens + context.usedTokens + questionTokens,
      remaining:
        budget.total - systemTokens - context.usedTokens - questionTokens,
    },
  };
}
```

## Trade-offs

| Trade-off                                         | Impact                                                 |
| ------------------------------------------------- | ------------------------------------------------------ |
| Sliding window drops lower-scored note segments   | May lose tail-end details from less-relevant notes     |
| Hard budget is model-specific                     | Swapping to Qwen2.5-Coder-1.5B requires recalibrating  |
| rAF batching introduces ~16ms latency             | Visually imperceptible but measurable for fast typists |
| Token counting is approximate (BPE vs char-based) | ~5% variance without a full tokenizer                  |

## Open Questions

1. Should we ship a lightweight BPE tokenizer (`@huggingface/tokenizers`) or rely on a character-based heuristic (~4 chars/token)?

[Nilay - 2026-05-11] - Do not allow BGE or other, at first release lock to `all-MiniLM-L6-v2`, and only support tokenizer for minilm. And lock to English Language for now. No multilingual support at the launch.

2. Is the 2,048-token window accurate for Qwen2.5-Coder-0.5B-Instruct across all Transformers.js backends, or does WebGPU introduce variance?

[Nilay - 2026-05-11] - Yes, the 2,048-token window is consistent across all Transformers.js backends for Qwen2.5-Coder-0.5B-Instruct, including WebGPU.

3. Should context truncation be user-configurable (slider in settings) or purely algorithmic?

[Nilay - 2026-05-11] - For the initial release, context truncation will be purely algorithmic to ensure optimal performance and simplicity.

4. Do we need a "context overflow" visual indicator in the UI (e.g., a small badge showing `1,400/1,800 tokens used`)?

[Nilay - 2026-05-11] - Add a visual indicator in the UI showing the token usage of the context window, such as `1,400/1,800 tokens used`, to provide transparency to users about how much of their context is being utilized.

# Status

## 11/05/2026

- All recommendations are accepted.
- Open questions are answered.
