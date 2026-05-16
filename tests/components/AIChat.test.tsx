import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AIChat } from "@/components/AIChat";

// Mock localStorage
const mockLocalStorage = (() => {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
  };
})();

vi.stubGlobal("localStorage", mockLocalStorage);

describe("AIChat", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it("should render chat interface", () => {
    render(<AIChat />);

    expect(screen.getByText("AI Chat")).toBeDefined();
    expect(screen.getByPlaceholderText("Ask anything about your notes...")).toBeDefined();
    expect(screen.getByText("Send")).toBeDefined();
  });

  it("should render model selector", () => {
    render(<AIChat />);

    expect(screen.getByLabelText("Select AI model")).toBeDefined();
  });

  it("should render chat thread", () => {
    render(<AIChat />);

    expect(screen.getByLabelText("Chat messages")).toBeDefined();
  });

  it("should show empty state when no messages", () => {
    render(<AIChat />);

    expect(screen.getByText("No messages yet")).toBeDefined();
  });

  it("should send message on Enter key", () => {
    render(<AIChat />);

    const textarea = screen.getByLabelText("Chat message input");
    fireEvent.change(textarea, { target: { value: "test query" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    expect(screen.getByText("test query")).toBeDefined();
  });
});
