import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SearchResults } from "../../src/components/SearchResults";

const mockResults = [
  { noteId: "note-1", title: "Meeting Notes", percentage: 94 },
  { noteId: "note-2", title: "Project Plan", percentage: 87 },
];

describe("SearchResults", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state when isLoading is true", () => {
    // Arrange & Act
    render(<SearchResults results={[]} onSelect={vi.fn()} isLoading />);

    // Assert
    expect(screen.getByText("Searching...")).toBeInTheDocument();
  });

  it("returns null when results are empty and not loading", () => {
    // Arrange & Act
    const { container } = render(
      <SearchResults results={[]} onSelect={vi.fn()} />
    );

    // Assert
    expect(container.firstChild).toBeNull();
  });

  it("displays results with titles", () => {
    // Arrange
    const handleSelect = vi.fn();

    // Act
    render(<SearchResults results={mockResults} onSelect={handleSelect} />);

    // Assert
    expect(screen.getByText("Meeting Notes")).toBeInTheDocument();
    expect(screen.getByText("Project Plan")).toBeInTheDocument();
  });

  it("displays percentage scores", () => {
    // Arrange & Act
    render(<SearchResults results={mockResults} onSelect={vi.fn()} />);

    // Assert
    expect(screen.getByTestId("score-note-1")).toHaveTextContent("94%");
    expect(screen.getByTestId("score-note-2")).toHaveTextContent("87%");
  });

  it("calls onSelect when result is clicked", () => {
    // Arrange
    const handleSelect = vi.fn();

    // Act
    render(<SearchResults results={mockResults} onSelect={handleSelect} />);
    fireEvent.click(screen.getByText("Meeting Notes"));

    // Assert
    expect(handleSelect).toHaveBeenCalledWith("note-1");
  });
});
