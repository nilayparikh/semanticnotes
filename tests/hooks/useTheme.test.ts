import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTheme } from "../../src/hooks/useTheme";

describe("useTheme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    Object.assign(window, {
      matchMedia: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });
  });

  it("should initialize with 'system' theme by default", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("system");
  });

  it("should toggle between Light/Dark/System", () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.setTheme("light");
    });
    expect(result.current.theme).toBe("light");

    act(() => {
      result.current.setTheme("dark");
    });
    expect(result.current.theme).toBe("dark");

    act(() => {
      result.current.setTheme("system");
    });
    expect(result.current.theme).toBe("system");
  });

  it("should persist theme in localStorage", () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.setTheme("dark");
    });
    
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("should apply glassmorphic classes", () => {
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.glassClasses).toContain("backdrop-blur");
  });

  it("should return isDark flag based on current theme", () => {
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.isDark).toBe(false);
    
    act(() => {
      result.current.setTheme("dark");
    });
    expect(result.current.isDark).toBe(true);
  });
});
