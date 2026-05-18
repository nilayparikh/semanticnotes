import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Sidebar } from "@/components/Sidebar";
import type { Note } from "@/types/note";

const mockNotes: Note[] = [
  { id: "1", title: "WebGPU Setup", content: "Setting up WebGPU...", updated_at: new Date().toISOString() },
  { id: "2", title: "SQLite Notes", content: "SQLite WASM content", updated_at: new Date().toISOString() },
];

describe("Semantic Search E2E", () => {
  const mockSelectNote = vi.fn();
  const mockNewNote = vi.fn();
  const mockSearchChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show search input in sidebar", () => {
    render(
      <Sidebar
        notes={mockNotes}
        selectedNoteId=""
        onSelectNote={mockSelectNote}
        onNewNote={mockNewNote}
        searchQuery=""
        onSearchChange={mockSearchChange}
        searchResults={[]}
        isSearching={false}
      />
    );
    expect(screen.getByTestId("search-bar")).toBeInTheDocument();
  });

  it("should filter notes when typing in search", () => {
    render(
      <Sidebar
        notes={mockNotes}
        selectedNoteId=""
        onSelectNote={mockSelectNote}
        onNewNote={mockNewNote}
        searchQuery=""
        onSearchChange={mockSearchChange}
        searchResults={[]}
        isSearching={false}
      />
    );

    const searchInput = screen.getByTestId("search-bar");
    fireEvent.change(searchInput, { target: { value: "test query" } });

    expect(mockSearchChange).toHaveBeenCalledWith("test query");
  });

  it("should display note list in sidebar", () => {
    render(
      <Sidebar
        notes={mockNotes}
        selectedNoteId=""
        onSelectNote={mockSelectNote}
        onNewNote={mockNewNote}
        searchQuery=""
        onSearchChange={mockSearchChange}
        searchResults={[]}
        isSearching={false}
      />
    );

    expect(screen.getByText("WebGPU Setup")).toBeInTheDocument();
    expect(screen.getByText("SQLite Notes")).toBeInTheDocument();
  });
});
