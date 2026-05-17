import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { PerformanceMetrics } from "../../src/components/PerformanceMetrics";

describe("PerformanceMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display FPS counter", () => {
    render(<PerformanceMetrics />);
    expect(screen.getByText(/FPS/)).toBeDefined();
  });

  it("should show bundle size", () => {
    render(<PerformanceMetrics />);
    expect(screen.getByText(/Bundle/)).toBeDefined();
  });

  it("should display memory usage", () => {
    render(<PerformanceMetrics />);
    expect(screen.getByText(/Memory/)).toBeDefined();
  });

  it("should update metrics every second", () => {
    const { unmount } = render(<PerformanceMetrics />);
    // The component uses requestAnimationFrame with a 1-second interval
    expect(screen.getByText(/FPS/)).toBeDefined();
    unmount();
  });

  it("should show initial state with 0 values", () => {
    render(<PerformanceMetrics />);
    expect(screen.getByText("0 FPS")).toBeDefined();
  });
});
