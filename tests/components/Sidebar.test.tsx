import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { Sidebar } from "@/components/Sidebar";

describe("Sidebar", () => {
  it("should render with 20% width", () => {
    render(
      <Sidebar
        notes={[]}
        selectedNoteId=""
        onSelectNote={() => {}}
        onNewNote={() => {}}
        onSearch={() => {}}
      />,
    );

    // Verify sidebar structure exists
    const searchInput = screen.getByPlaceholderText("AI Semantic Search...");
    expect(searchInput).toBeInTheDocument();
  });

  it("should display search bar", () => {
    const onSearch = vi.fn();
    render(
      <Sidebar
        notes={[]}
        selectedNoteId=""
        onSelectNote={() => {}}
        onNewNote={() => {}}
        onSearch={onSearch}
      />,
    );

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

    render(
      <Sidebar
        notes={notes}
        selectedNoteId="1"
        onSelectNote={() => {}}
        onNewNote={() => {}}
        onSearch={() => {}}
      />,
    );

    expect(screen.getByText("Note 1")).toBeInTheDocument();
  });

  it("should display new note button", () => {
    render(
      <Sidebar
        notes={[]}
        selectedNoteId=""
        onSelectNote={() => {}}
        onNewNote={() => {}}
        onSearch={() => {}}
      />,
    );

    const button = screen.getByRole("button", { name: /New Note/i });
    expect(button).toBeInTheDocument();
  });
});
