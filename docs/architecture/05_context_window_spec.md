# Context Window Specification

## 1. Overview

The context window manages token budgeting for the Qwen2.5-Coder-0.5B-Instruct RAG pipeline. The model has a 2,048-token context window, and the pipeline injects system prompt + retrieved note context + user question within this budget.

## 2. Token Budget

```typescript
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
```

### 2.1 Budget Allocation

| Component      | Token Budget | Purpose                   |
| -------------- | ------------ | ------------------------- |
| System prompt  | 120 tokens   | RAG wrapper instructions  |
| Context notes  | 1,400 tokens | Retrieved note content    |
| User question  | 300 tokens   | User's input query        |
| Answer reserve | 228 tokens   | Model's output space      |
| **Total**      | **2,048**    | Qwen2.5-Coder-0.5B window |

## 3. Context Injection

### 3.1 Scored Sliding Window

```typescript
interface ScoredNote {
  id: number;
  text: string;
  embeddingScore: number;
}

export function buildContextWindow(
  notes: ScoredNote[],
  maxContextTokens: number,
): ContextResult {
  const scored = notes
    .map((n) => ({
      note: n,
      tokens: countTokens(n.text),
      score: n.embeddingScore,
    }))
    .sort((a, b) => b.score - a.score);

  let window: ScoredNote[] = [];
  let usedTokens = 0;

  for (const item of scored) {
    if (usedTokens + item.tokens <= maxContextTokens) {
      window.push(item.note);
      usedTokens += item.tokens;
    } else {
      const remaining = maxContextTokens - usedTokens;
      if (remaining > 0) {
        const truncated = truncateToTokens(item.note.text, remaining);
        window.push({ ...item.note, text: truncated });
        usedTokens += remaining;
      }
      break;
    }
  }

  return { context: window, usedTokens, budget: maxContextTokens };
}
```

### 3.2 Prompt Construction

```typescript
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
    prompt: `${system}\n\nContext:\n${context.context.map((n) => n.text).join("\n\n")}\n\nQuestion: ${question}`,
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

## 4. Token Counting

### 4.1 Character-Based Heuristic

For the initial release, use a character-based heuristic (~4 chars/token) for approximate token counting:

```typescript
export function countTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function truncateToTokens(text: string, maxTokens: number): string {
  const maxChars = maxTokens * 4;
  return text.slice(0, maxChars) + (text.length > maxChars ? "..." : "");
}
```

### 4.2 Tokenizer Constraints

| Constraint | Value                                                           |
| ---------- | --------------------------------------------------------------- |
| Model      | all-MiniLM-L6-v2 (embedding), Qwen2.5-Coder-0.5B-Instruct (LLM) |
| Language   | English (initial release)                                       |
| Tokenizer  | Character-based heuristic (~4 chars/token)                      |
| Future     | BPE tokenizer via @huggingface/tokenizers                       |

## 5. Streaming

### 5.1 rAF-Batched Streaming

```typescript
function useStreamingTokens() {
  const [displayed, setDisplayed] = React.useState("");
  const bufferRef = React.useRef<string[]>([]);

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
    pushToken: (token: string) => bufferRef.current.push(token),
  };
}
```

### 5.2 Streaming Performance

| Metric                | Value          |
| --------------------- | -------------- |
| Tokens per frame      | 5              |
| Frame rate            | 60 fps         |
| Re-render frequency   | ~30/sec        |
| Latency per frame     | ~16 ms         |
| Token generation rate | ~12 tokens/sec |

## 6. UI Indicators

### 6.1 Context Usage Indicator

Display token usage of the context window:

```typescript
interface ContextUsageIndicator {
  usedTokens: number;
  totalTokens: number;
  percentage: number;
}

function ContextUsageBar({ usedTokens, totalTokens }: ContextUsageIndicator) {
  const percentage = (usedTokens / totalTokens) * 100;
  const color = percentage > 90 ? 'amber' : percentage > 70 ? 'emerald' : 'blue';

  return (
    <div className="context-usage-bar">
      <span>{usedTokens}/{totalTokens} tokens</span>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
```

## 7. Error Handling

| Error                  | Recovery                       |
| ---------------------- | ------------------------------ |
| Context overflow       | Sliding window truncation      |
| Token budget exceeded  | Hard cap with warning log      |
| Streaming backpressure | rAF batching                   |
| Empty context          | Fallback to system prompt only |
| Model swap             | Budget recalculation           |

## 8. References

- ADR-004: LLM & Context Window Management
- [Qwen2.5-Coder-0.5B-Instruct](https://huggingface.co/onnx-community/Qwen2.5-Coder-0.5B-Instruct)
- [Tokenization Strategies](https://huggingface.co/docs/transformers.js/tokenization)
