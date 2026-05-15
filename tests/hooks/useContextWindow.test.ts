import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useContextWindow, ScoredNote } from "../../src/hooks/useContextWindow";

// Helper to create a scored note with predictable token count
// countTokens uses ~4 chars/token heuristic, so 400 chars ≈ 100 tokens
function createNote(
  id: string,
  score: number,
  charCount: number,
): ScoredNote {
  return {
    id,
    title: `Note ${id}`,
    content: "x".repeat(charCount),
    score,
  };
}

describe("useContextWindow", () => {
  it("should return empty context on initialization", () => {
    const { result } = renderHook(() => useContextWindow());

    expect(result.current.context.notes).toEqual([]);
    expect(result.current.usedTokens).toBe(0);
    expect(result.current.budget).toBe(1400); // DEFAULT_BUDGET.context
  });

  it("should provide updateNotes function", () => {
    const { result } = renderHook(() => useContextWindow());

    expect(typeof result.current.updateNotes).toBe("function");
  });

  it("should provide buildContext function", () => {
    const { result } = renderHook(() => useContextWindow());

    expect(typeof result.current.buildContext).toBe("function");
  });

  it("should sort notes by score descending", () => {
    const notes: ScoredNote[] = [
      createNote("low", 0.3, 100),
      createNote("high", 0.9, 100),
      createNote("mid", 0.6, 100),
    ];

    const { result } = renderHook(() => useContextWindow());

    let context: any;
    act(() => {
      context = result.current.buildContext(notes);
    });

    expect(context.notes[0].id).toBe("high");
    expect(context.notes[1].id).toBe("mid");
    expect(context.notes[2].id).toBe("low");
  });

  it("should limit to maxNotes (128)", () => {
    // Create 200 notes with high scores
    const notes: ScoredNote[] = Array.from({ length: 200 }, (_, i) =>
      createNote(`note-${i}`, 0.99 - i * 0.001, 40),
    );

    const { result } = renderHook(() => useContextWindow({ maxNotes: 128 }));

    let context: any;
    act(() => {
      context = result.current.buildContext(notes);
    });

    expect(context.notes.length).toBeLessThanOrEqual(128);
  });

  it("should respect token budget per context", () => {
    // Each note is ~100 tokens (400 chars / 4)
    // Budget is 1400 tokens by default, so ~14 notes should fit
    const notes: ScoredNote[] = Array.from({ length: 50 }, (_, i) =>
      createNote(`note-${i}`, 0.99 - i * 0.001, 400),
    );

    const { result } = renderHook(() => useContextWindow());

    let context: any;
    act(() => {
      context = result.current.buildContext(notes);
    });

    expect(context.usedTokens).toBeLessThanOrEqual(context.budget);
  });

  it("should truncate last note to fill remaining budget", () => {
    // 10 notes × 500 chars = 1250 tokens, leaving 150 tokens (budget = 1400)
    // 11th note (1200 chars = 300 tokens) won't fit fully → truncated to 150 tokens
    const notes: ScoredNote[] = [
      ...Array.from({ length: 10 }, (_, i) =>
        createNote(`full-${i}`, 0.95 - i * 0.001, 500),
      ),
      createNote("partial", 0.85, 1200),
    ];

    const { result } = renderHook(() => useContextWindow());

    let context: any;
    act(() => {
      context = result.current.buildContext(notes);
    });

    // Should have 11 notes (10 full + 1 truncated)
    expect(context.notes.length).toBe(11);
    // Last note should be truncated (original was 1200 chars)
    expect(context.notes[10].content.length).toBeLessThan(1200);
    // Total should not exceed budget
    expect(context.usedTokens).toBeLessThanOrEqual(context.budget);
  });

  it("should update context when scored notes change", () => {
    const { result } = renderHook(() => useContextWindow());

    expect(result.current.context.notes).toEqual([]);

    const notes: ScoredNote[] = [createNote("a", 0.8, 200)];

    act(() => {
      result.current.updateNotes(notes);
    });

    expect(result.current.context.notes.length).toBe(1);
    expect(result.current.context.notes[0].id).toBe("a");
  });
});
