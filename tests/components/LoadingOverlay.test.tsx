import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
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

  it("should not render when visible is false", () => {
    const { container } = render(<LoadingOverlay {...mockProps} visible={false} />);
    expect(container.querySelector("div")).toBeNull();
  });

  it("should render when visible is true", () => {
    render(<LoadingOverlay {...mockProps} visible={true} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should have pointer-events-auto when visible to capture interactions", () => {
    render(<LoadingOverlay {...mockProps} visible={true} />);
    expect(screen.getByRole("status")).toHaveClass("pointer-events-auto");
  });

  it("should display progress percentage", () => {
    render(<LoadingOverlay {...mockProps} progress={75} />);
    expect(screen.getByText("75%")).toBeDefined();
  });

  it("should not render overlay element when hidden to avoid blocking clicks", () => {
    const { container } = render(<LoadingOverlay {...mockProps} visible={false} />);
    // When hidden, the overlay should not be in the DOM at all
    expect(container.querySelector("div")).toBeNull();
  });

  it("should allow click-through when hidden", () => {
    const { rerender } = render(
      <>
        <button data-testid="target" tabIndex={0}>Click me</button>
        <LoadingOverlay {...mockProps} visible={true} />
      </>
    );

    // Hide overlay
    rerender(<><button data-testid="target" tabIndex={0}>Click me</button><LoadingOverlay {...mockProps} visible={false} /></>);

    // Click the target button — should work without overlay in the way
    const target = screen.getByTestId("target");
    target.focus();
    fireEvent.click(target);
    expect(target).toHaveFocus();
  });
});
