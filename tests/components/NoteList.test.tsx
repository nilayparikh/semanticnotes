import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { Note } from "@/types/note";
import { NoteList } from "@/components/NoteList";

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: "note-1",
    title: "Sample Note",
    content: "Some content",
    note_version: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    updated_ts: Date.now(),
    ...overrides,
  };
}

describe("NoteList", () => {
  it("displays all notes in the list", () => {
    const notes = [
      makeNote({ id: "a", title: "Note A" }),
      makeNote({ id: "b", title: "Note B" }),
      makeNote({ id: "c", title: "Note C" }),
    ];

    render(<NoteList notes={notes} selectedNoteId="a" onSelect={() => {}} />);

    expect(screen.getByText("Note A")).toBeInTheDocument();
    expect(screen.getByText("Note B")).toBeInTheDocument();
    expect(screen.getByText("Note C")).toBeInTheDocument();
  });

  it("highlights the active note", () => {
    const notes = [
      makeNote({ id: "active", title: "Active Note" }),
      makeNote({ id: "inactive", title: "Inactive Note" }),
    ];

    render(
      <NoteList notes={notes} selectedNoteId="active" onSelect={() => {}} />,
    );

    const activeElement = screen.getByTestId("note-item-active");
    expect(activeElement).toHaveClass("border-primary");
    expect(activeElement).toHaveClass("text-on-surface");
  });

  it("displays relative timestamps", () => {
    const note = makeNote({ id: "ts-test", title: "Timestamp Note" });
    render(
      <NoteList notes={[note]} selectedNoteId="ts-test" onSelect={() => {}} />,
    );

    expect(screen.getByText(/just now|m ago|h ago|d ago/i)).toBeInTheDocument();
  });

  it("calls onSelect when a note is clicked", () => {
    const notes = [makeNote({ id: "click-me", title: "Click Me" })];
    const onSelect = vi.fn();

    render(
      <NoteList notes={notes} selectedNoteId="click-me" onSelect={onSelect} />,
    );

    screen.getByTestId("note-item-click-me").click();
    expect(onSelect).toHaveBeenCalledWith("click-me");
  });

  it("uses correct typography for inactive notes", () => {
    const notes = [makeNote({ id: "inactive-note", title: "Inactive" })];

    render(
      <NoteList notes={notes} selectedNoteId="other" onSelect={() => {}} />,
    );

    const inactiveElement = screen.getByTestId("note-item-inactive-note");
    expect(inactiveElement).toHaveClass("text-on-surface-variant");
  });
});
