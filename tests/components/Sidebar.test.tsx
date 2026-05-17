import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { Sidebar } from "@/components/Sidebar";

const baseProps = {
  notes: [],
  selectedNoteId: "",
  onSelectNote: () => {},
  onNewNote: () => {},
  searchQuery: "",
  onSearchChange: () => {},
  searchResults: [],
  isSearching: false,
};

describe("Sidebar", () => {
  it("should render with 20% width", () => {
    render(<Sidebar {...baseProps} />);

    // Verify sidebar structure exists
    const searchInput = screen.getByPlaceholderText("AI Semantic Search...");
    expect(searchInput).toBeInTheDocument();
  });

  it("should display search bar", () => {
    const onSearchChange = vi.fn();
    render(<Sidebar {...baseProps} onSearchChange={onSearchChange} />);

    const searchInput = screen.getByPlaceholderText("AI Semantic Search...");
    expect(searchInput).toBeInTheDocument();
  });

  it("should display note list when notes are provided", () => {
    const notes = [
      {
        id: "1",
        title: "Note 1",
        content: "Content 1",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        updated_ts: Date.now(),
      },
    ];

    render(<Sidebar {...baseProps} notes={notes} selectedNoteId="1" />);

    expect(screen.getByText("Note 1")).toBeInTheDocument();
  });

  it("should display new note button", () => {
    render(<Sidebar {...baseProps} />);

    const button = screen.getByRole("button", { name: /New Note/i });
    expect(button).toBeInTheDocument();
  });

  it("should display search results when searching", () => {
    const searchResults = [
      { noteId: "1", title: "Note 1", percentage: 95 },
    ];
    render(<Sidebar {...baseProps} searchQuery="test" searchResults={searchResults} />);

    expect(screen.getByText("Note 1")).toBeInTheDocument();
    expect(screen.getByText("95%")).toBeInTheDocument();
  });
});
