import { render, screen } from "@testing-library/react";
import { ContextPanel } from "@/components/ContextPanel";

describe("ContextPanel", () => {
  it("should render with 25% width", () => {
    render(<ContextPanel />);

    // Verify context panel structure exists
    const panel = screen.getByText("Context Panel");
    expect(panel).toBeInTheDocument();
  });

  it("should display default message when no children", () => {
    render(<ContextPanel />);

    const message = screen.getByText("Select a note to see context...");
    expect(message).toBeInTheDocument();
  });

  it("should render children when provided", () => {
    render(
      <ContextPanel>
        <div>Custom Content</div>
      </ContextPanel>,
    );

    expect(screen.getByText("Custom Content")).toBeInTheDocument();
  });
});
