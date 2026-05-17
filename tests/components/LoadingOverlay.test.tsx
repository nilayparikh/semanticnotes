import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { LoadingOverlay } from "../../src/components/LoadingOverlay";

describe("LoadingOverlay", () => {
  const mockProps = {
    progress: 50,
    message: "Loading Model...",
    visible: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display model loading progress", () => {
    render(<LoadingOverlay {...mockProps} />);
    expect(screen.getByRole("progressbar")).toBeDefined();
    expect(screen.getByText("50%")).toBeDefined();
  });

  it("should show spinner during model initialization", () => {
    render(<LoadingOverlay {...mockProps} />);
    const spinner = screen.getByText("Loading Model...");
    expect(spinner).toBeDefined();
  });

  it("should fade out when model is ready", () => {
    const { unmount } = render(<LoadingOverlay {...mockProps} />);
    unmount();
  });

  it("should be hidden when visible is false", () => {
    render(<LoadingOverlay {...mockProps} visible={false} />);
    expect(screen.getByRole("status")).toHaveClass("opacity-0");
  });

  it("should display progress percentage", () => {
    render(<LoadingOverlay {...mockProps} progress={75} />);
    expect(screen.getByText("75%")).toBeDefined();
  });
});
