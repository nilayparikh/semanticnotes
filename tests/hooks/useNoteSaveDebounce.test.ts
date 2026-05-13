import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNoteSaveDebounce } from "../../src/hooks/useNoteSaveDebounce";

describe("useNoteSaveDebounce", () => {
  const testNoteId = "note-1";

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns save function and isSaving flag", () => {
    const mockSaveCallback = vi.fn();
    const { result } = renderHook(() =>
      useNoteSaveDebounce(testNoteId, mockSaveCallback),
    );

    expect(result.current.save).toBeDefined();
    expect(typeof result.current.save).toBe("function");
    expect(result.current.isSaving).toBe(false);
  });

  it("calls save callback after debounce interval", () => {
    const mockSaveCallback = vi.fn();
    const { result } = renderHook(() =>
      useNoteSaveDebounce(testNoteId, mockSaveCallback),
    );

    act(() => {
      result.current.save({ title: "New Title", content: "New Content" });
    });

    expect(result.current.isSaving).toBe(true);
    expect(mockSaveCallback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockSaveCallback).toHaveBeenCalledWith({
      id: testNoteId,
      title: "New Title",
      content: "New Content",
    });
  });

  it("debounces multiple calls within 1000ms", () => {
    const mockSaveCallback = vi.fn();
    const { result } = renderHook(() =>
      useNoteSaveDebounce(testNoteId, mockSaveCallback),
    );

    act(() => {
      result.current.save({ title: "First" });
    });

    act(() => {
      result.current.save({ title: "Second" });
    });

    act(() => {
      result.current.save({ title: "Third" });
    });

    expect(mockSaveCallback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockSaveCallback).toHaveBeenCalledTimes(1);
    expect(mockSaveCallback).toHaveBeenCalledWith({
      id: testNoteId,
      title: "Third",
      content: undefined,
    });
  });

  it("resets isSaving to false after debounce completes", () => {
    const mockSaveCallback = vi.fn();
    const { result } = renderHook(() =>
      useNoteSaveDebounce(testNoteId, mockSaveCallback),
    );

    act(() => {
      result.current.save({ title: "Test" });
    });

    expect(result.current.isSaving).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.isSaving).toBe(false);
  });

  it("handles empty save data", () => {
    const mockSaveCallback = vi.fn();
    const { result } = renderHook(() =>
      useNoteSaveDebounce(testNoteId, mockSaveCallback),
    );

    act(() => {
      result.current.save({});
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockSaveCallback).toHaveBeenCalledWith({
      id: testNoteId,
      title: undefined,
      content: undefined,
    });
  });

  it("handles only title update", () => {
    const mockSaveCallback = vi.fn();
    const { result } = renderHook(() =>
      useNoteSaveDebounce(testNoteId, mockSaveCallback),
    );

    act(() => {
      result.current.save({ title: "Only Title" });
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockSaveCallback).toHaveBeenCalledWith({
      id: testNoteId,
      title: "Only Title",
      content: undefined,
    });
  });

  it("handles only content update", () => {
    const mockSaveCallback = vi.fn();
    const { result } = renderHook(() =>
      useNoteSaveDebounce(testNoteId, mockSaveCallback),
    );

    act(() => {
      result.current.save({ content: "Only Content" });
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockSaveCallback).toHaveBeenCalledWith({
      id: testNoteId,
      title: undefined,
      content: "Only Content",
    });
  });

  it("prevents race conditions between notes", () => {
    const mockSaveCallback = vi.fn();
    const noteId2 = "note-2";

    const { result } = renderHook(() =>
      useNoteSaveDebounce(testNoteId, mockSaveCallback),
    );
    const { result: result2 } = renderHook(() =>
      useNoteSaveDebounce(noteId2, mockSaveCallback),
    );

    act(() => {
      result.current.save({ title: "Note 1" });
    });

    act(() => {
      result2.current.save({ title: "Note 2" });
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockSaveCallback).toHaveBeenCalledTimes(2);
    expect(mockSaveCallback).toHaveBeenCalledWith({
      id: testNoteId,
      title: "Note 1",
      content: undefined,
    });
    expect(mockSaveCallback).toHaveBeenCalledWith({
      id: noteId2,
      title: "Note 2",
      content: undefined,
    });
  });
});
