import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import NewNoteButton from "@/components/NewNoteButton";

describe("NewNoteButton", () => {
  it("renders a button with '+ NEW NOTE' label", () => {
    const onClick = vi.fn();
    render(<NewNoteButton onClick={onClick} />);

    expect(screen.getByText("+ NEW NOTE")).toBeInTheDocument();
  });

  it("calls onClick when button is clicked", () => {
    const onClick = vi.fn();
    render(<NewNoteButton onClick={onClick} />);

    fireEvent.click(screen.getByText("+ NEW NOTE"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders as a button element", () => {
    const onClick = vi.fn();
    render(<NewNoteButton onClick={onClick} />);

    const button = screen.getByText("+ NEW NOTE");
    expect(button.tagName.toLowerCase()).toBe("button");
  });

  it("applies glassmorphic dark theme styling", () => {
    const onClick = vi.fn();
    render(<NewNoteButton onClick={onClick} />);

    const button = screen.getByText("+ NEW NOTE");
    expect(button.className).toContain("glass-panel");
    expect(button.className).toContain("text-primary-container");
  });
});
