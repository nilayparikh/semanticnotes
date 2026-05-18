import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "@/components/EmptyState";

describe("EmptyState", () => {
  it("should render welcome screen with title", () => {
    render(<EmptyState onNewNote={() => {}} />);
    expect(screen.getByText("SemanticNotes AI")).toBeInTheDocument();
  });

  it("should render feature badges", () => {
    render(<EmptyState onNewNote={() => {}} />);
    expect(screen.getByText("WebGPU Powered")).toBeInTheDocument();
    expect(screen.getByText("Semantic Search")).toBeInTheDocument();
    expect(screen.getByText("Local AI Chat")).toBeInTheDocument();
  });

  it("should render new note button", () => {
    render(<EmptyState onNewNote={() => {}} />);
    expect(screen.getByTestId("empty-state-new-note")).toBeInTheDocument();
  });

  it("should call onNewNote when button clicked", () => {
    const handleNewNote = vi.fn();
    render(<EmptyState onNewNote={handleNewNote} />);
    fireEvent.click(screen.getByTestId("empty-state-new-note"));
    expect(handleNewNote).toHaveBeenCalledTimes(1);
  });

  it("should have correct data-testid", () => {
    render(<EmptyState onNewNote={() => {}} />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });
});
