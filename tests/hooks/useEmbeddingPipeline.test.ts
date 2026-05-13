import { describe, it, expect, vi, useFakeTimers } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEmbeddingPipeline } from "../../src/hooks/useEmbeddingPipeline";

describe("useEmbeddingPipeline", () => {
  it("returns initial state with undefined lastResult", () => {
    const { result } = renderHook(() => useEmbeddingPipeline());

    expect(result.current.isEmbedding).toBe(false);
    expect(result.current.lastResult).toBeUndefined();
  });

  it("provides embedNote function", () => {
    const { result } = renderHook(() => useEmbeddingPipeline());

    expect(typeof result.current.embedNote).toBe("function");
  });

  it("accepts options with onEmbeddingComplete callback", () => {
    const onEmbeddingComplete = vi.fn();

    const { result } = renderHook(() =>
      useEmbeddingPipeline({ onEmbeddingComplete, debounceMs: 100 }),
    );

    expect(result.current.embedNote).toBeDefined();
  });

  it("accepts debounceMs option", () => {
    const { result } = renderHook(() =>
      useEmbeddingPipeline({ debounceMs: 500 }),
    );

    expect(result.current.embedNote).toBeDefined();
  });
});
