import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChatStreaming } from "@/hooks/useChatStreaming";

describe("useChatStreaming", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should start with empty displayText and not streaming", () => {
    const { result } = renderHook(() => useChatStreaming());

    expect(result.current.displayText).toBe("");
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.isPaused).toBe(false);
  });

  it("should expose all control functions", () => {
    const { result } = renderHook(() => useChatStreaming());

    expect(typeof result.current.startStreaming).toBe("function");
    expect(typeof result.current.pause).toBe("function");
    expect(typeof result.current.resume).toBe("function");
    expect(typeof result.current.stop).toBe("function");
  });

  it("should start streaming with empty displayText", () => {
    const { result } = renderHook(() => useChatStreaming());

    act(() => {
      result.current.startStreaming("hello world from streaming");
    });

    expect(result.current.isStreaming).toBe(true);
    expect(result.current.displayText).toBe("");
  });

  it("should stream tokens word-by-word at 50ms intervals", () => {
    const { result } = renderHook(() => useChatStreaming());

    act(() => {
      result.current.startStreaming("one two three four five");
    });

    // After first tick (50ms), first word revealed
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current.displayText).toBe("one");

    // After second tick (100ms), second word revealed
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current.displayText).toBe("one two");

    // After third tick (150ms), third word revealed
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current.displayText).toBe("one two three");
  });

  it("should pause streaming and stop the interval", () => {
    const { result } = renderHook(() => useChatStreaming());

    act(() => {
      result.current.startStreaming("alpha beta gamma delta");
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current.displayText).toBe("alpha");

    // Pause
    act(() => {
      result.current.pause();
    });
    expect(result.current.isPaused).toBe(true);

    // Advancing time should NOT reveal more words
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.displayText).toBe("alpha");
  });

  it("should resume streaming from where it left off", () => {
    const { result } = renderHook(() => useChatStreaming());

    act(() => {
      result.current.startStreaming("alpha beta gamma delta");
    });

    // Reveal first word
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current.displayText).toBe("alpha");

    // Pause
    act(() => {
      result.current.pause();
    });

    // Time passes but nothing changes
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.displayText).toBe("alpha");

    // Resume
    act(() => {
      result.current.resume();
    });
    expect(result.current.isPaused).toBe(false);

    // Next tick reveals second word
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current.displayText).toBe("alpha beta");
  });

  it("should stop streaming and clear everything", () => {
    const { result } = renderHook(() => useChatStreaming());

    act(() => {
      result.current.startStreaming("foo bar baz");
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current.displayText).toBe("foo");

    // Stop
    act(() => {
      result.current.stop();
    });

    expect(result.current.isStreaming).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.displayText).toBe("");

    // Advancing time should NOT reveal more words
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.displayText).toBe("");
  });

  it("should complete streaming when all words are revealed", () => {
    const { result } = renderHook(() => useChatStreaming());

    act(() => {
      result.current.startStreaming("word one two three");
    });

    // Advance past all 4 words (4 * 50ms = 200ms)
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.displayText).toBe("word one two three");
    expect(result.current.isStreaming).toBe(false);
  });

  it("should handle single word input", () => {
    const { result } = renderHook(() => useChatStreaming());

    act(() => {
      result.current.startStreaming("single");
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(result.current.displayText).toBe("single");
    expect(result.current.isStreaming).toBe(false);
  });

  it("should handle empty string input", () => {
    const { result } = renderHook(() => useChatStreaming());

    act(() => {
      result.current.startStreaming("");
    });

    // Empty string produces empty words array, should not stream
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.displayText).toBe("");
    expect(result.current.isStreaming).toBe(false);
  });

  it("should reset state when startStreaming is called again", () => {
    const { result } = renderHook(() => useChatStreaming());

    // Start first stream
    act(() => {
      result.current.startStreaming("first stream text");
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current.displayText).toBe("first");

    // Start new stream
    act(() => {
      result.current.startStreaming("second stream");
    });

    expect(result.current.displayText).toBe("");
    expect(result.current.isStreaming).toBe(true);

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current.displayText).toBe("second");
  });
});
