import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  it("renders a title input and content textarea", () => {
    const note = makeNote();
    const onUpdate = vi.fn();

    render(<NoteEditor note={note} onUpdate={onUpdate} />);

    expect(screen.getByDisplayValue("Sample Note")).toBeInTheDocument();
    expect(screen.getByTestId("note-content-textarea")).toBeInTheDocument();
  });

  it("calls onUpdate when content changes", () => {
    const note = makeNote();
    const onUpdate = vi.fn();

    render(<NoteEditor note={note} onUpdate={onUpdate} />);

    const textarea = screen.getByTestId("note-content-textarea" as never);
    fireEvent.change(textarea, { target: { value: "New Content" } });

    // Wait for debounce to fire
    return waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith({
        title: "Sample Note",
        content: "New Content",
      });
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

  it("debounces onUpdate calls (not called immediately on keystroke)", () => {
    vi.useFakeTimers();
    const note = makeNote();
    const onUpdate = vi.fn();

    render(<NoteEditor note={note} onUpdate={onUpdate} />);

    const textarea = screen.getByTestId("note-content-textarea" as never);
    fireEvent.change(textarea, { target: { value: "New Content" } });

    // Should not be called immediately
    expect(onUpdate).not.toHaveBeenCalled();

    // Advance 1000ms
    act(() => vi.advanceTimersByTime(1000));

    expect(onUpdate).toHaveBeenCalledWith({ title: "Sample Note", content: "New Content" });

    vi.useRealTimers();
  });

  it("clears previous debounce timer when user types again within 1000ms", () => {
    vi.useFakeTimers();
    const note = makeNote();
    const onUpdate = vi.fn();

    render(<NoteEditor note={note} onUpdate={onUpdate} />);

    const textarea = screen.getByTestId("note-content-textarea" as never);
    fireEvent.change(textarea, { target: { value: "First" } });
    act(() => vi.advanceTimersByTime(500));
    fireEvent.change(textarea, { target: { value: "Second" } });

    // Advance 1000ms from the second type
    act(() => vi.advanceTimersByTime(1000));

    // Should only call with final value
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith({ title: "Sample Note", content: "Second" });

    vi.useRealTimers();
  });

  it("shows 'Unsaved' status immediately on type", () => {
    const note = makeNote();
    const onUpdate = vi.fn();

    render(<NoteEditor note={note} onUpdate={onUpdate} />);

    const textarea = screen.getByTestId("note-content-textarea" as never);
    fireEvent.change(textarea, { target: { value: "New Content" } });

    expect(screen.getByText("Unsaved")).toBeInTheDocument();
  });

  it("shows 'Saved' status after debounce fires", () => {
    vi.useFakeTimers();
    const note = makeNote();
    const onUpdate = vi.fn();

    render(<NoteEditor note={note} onUpdate={onUpdate} />);

    const textarea = screen.getByTestId("note-content-textarea" as never);
    fireEvent.change(textarea, { target: { value: "New Content" } });

    // Should show Unsaved immediately
    expect(screen.getByText("Unsaved")).toBeInTheDocument();

    // Advance 1000ms for debounce
    act(() => vi.advanceTimersByTime(1000));

    // Should show Saved after debounce
    expect(screen.getByText("Saved")).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("shows 'Saving...' status during debounce window", () => {
    vi.useFakeTimers();
    const note = makeNote();
    const onUpdate = vi.fn();

    render(<NoteEditor note={note} onUpdate={onUpdate} />);

    const textarea = screen.getByTestId("note-content-textarea" as never);
    fireEvent.change(textarea, { target: { value: "New Content" } });

    // Advance 500ms (during debounce)
    act(() => vi.advanceTimersByTime(500));

    expect(screen.getByText("Saving...")).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("debounces title changes", () => {
    vi.useFakeTimers();
    const note = makeNote();
    const onUpdate = vi.fn();

    render(<NoteEditor note={note} onUpdate={onUpdate} />);

    const titleInput = screen.getByDisplayValue("Sample Note");
    fireEvent.change(titleInput, { target: { value: "New Title" } });

    expect(onUpdate).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1000));

    expect(onUpdate).toHaveBeenCalledWith({ title: "New Title", content: "# Hello\n\nSome content here." });

    vi.useRealTimers();
  });

  it("keeps title and content together when both are edited before debounce completes", () => {
    vi.useFakeTimers();
    const note = makeNote();
    const onUpdate = vi.fn();

    render(<NoteEditor note={note} onUpdate={onUpdate} />);

    fireEvent.change(screen.getByDisplayValue("Sample Note"), {
      target: { value: "Road Trip Draft" },
    });
    act(() => vi.advanceTimersByTime(400));
    fireEvent.change(screen.getByTestId("note-content-textarea" as never), {
      target: { value: "Travel notes" },
    });

    act(() => vi.advanceTimersByTime(1000));

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith({
      title: "Road Trip Draft",
      content: "Travel notes",
    });

    vi.useRealTimers();
  });
});
