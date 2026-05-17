import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import NoteEditor from "@/components/NoteEditor";
import { Note } from "@/types/note";

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: "note-1",
    title: "Sample Note",
    content: "# Hello\n\nSome content here.",
    note_version: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    updated_ts: Date.now(),
    ...overrides,
  };
}

describe("NoteEditor", () => {
  it("renders a title display and content textarea", () => {
    const note = makeNote();
    const onUpdate = vi.fn();

    render(<NoteEditor note={note} onUpdate={onUpdate} />);

    expect(screen.getByText("Sample Note")).toBeInTheDocument();
    expect(screen.getByTestId("note-content-textarea")).toBeInTheDocument();
  });

  it("calls onUpdate when content changes", () => {
    const note = makeNote();
    const onUpdate = vi.fn();

    render(<NoteEditor note={note} onUpdate={onUpdate} />);

    const textarea = screen.getByTestId("note-content-textarea" as never);
    fireEvent.change(textarea, { target: { value: "New Content" } });

    expect(onUpdate).toHaveBeenCalledWith({
      content: "New Content",
    });
  });

  it("renders MarkdownPreview with current content", () => {
    const note = makeNote({ content: "# Header\n\nBody text" });
    const onUpdate = vi.fn();

    render(<NoteEditor note={note} onUpdate={onUpdate} />);

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Body text")).toBeInTheDocument();
  });

  it("displays a split-pane layout (editor top, preview bottom)", () => {
    const note = makeNote();
    const onUpdate = vi.fn();

    render(<NoteEditor note={note} onUpdate={onUpdate} />);

    const container = screen.getByTestId("note-editor");
    expect(container).toHaveClass("flex-col");
    expect(screen.getByTestId("note-content-textarea")).toBeInTheDocument();
    expect(screen.getByText("Live Preview")).toBeInTheDocument();
  });
});
