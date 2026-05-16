import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatInput } from "@/components/ChatInput";

describe("ChatInput", () => {
  let onSendMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSendMock = vi.fn();
  });

  it("should render textarea with placeholder text", () => {
    render(<ChatInput onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText(
      "Ask anything about your notes..."
    );
    expect(textarea).toBeDefined();
  });

  it("should render send button", () => {
    render(<ChatInput onSend={onSendMock} />);

    const button = screen.getByRole("button", { name: "Send" });
    expect(button).toBeDefined();
  });

  it("should have send button disabled when input is empty", () => {
    render(<ChatInput onSend={onSendMock} />);

    const button = screen.getByRole("button", { name: "Send" });
    expect(button).toBeDisabled();
  });

  it("should enable send button when input has text", () => {
    render(<ChatInput onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText(
      "Ask anything about your notes..."
    );
    fireEvent.change(textarea, { target: { value: "hello" } });

    const button = screen.getByRole("button", { name: "Send" });
    expect(button).not.toBeDisabled();
  });

  it("should emit onSend with query string when button is clicked", () => {
    render(<ChatInput onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText(
      "Ask anything about your notes..."
    );
    fireEvent.change(textarea, { target: { value: "what is TDD?" } });

    const button = screen.getByRole("button", { name: "Send" });
    fireEvent.click(button);

    expect(onSendMock).toHaveBeenCalledWith("what is TDD?");
  });

  it("should clear input after sending", () => {
    render(<ChatInput onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText(
      "Ask anything about your notes..."
    );
    fireEvent.change(textarea, { target: { value: "test query" } });

    const button = screen.getByRole("button", { name: "Send" });
    fireEvent.click(button);

    expect((textarea as HTMLTextAreaElement).value).toBe("");
  });

  it("should emit onSend when Enter key is pressed", () => {
    render(<ChatInput onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText(
      "Ask anything about your notes..."
    );
    fireEvent.change(textarea, { target: { value: "enter query" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    expect(onSendMock).toHaveBeenCalledWith("enter query");
  });

  it("should NOT emit onSend when Shift+Enter is pressed", () => {
    render(<ChatInput onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText(
      "Ask anything about your notes..."
    );
    fireEvent.change(textarea, { target: { value: "shift enter test" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

    expect(onSendMock).not.toHaveBeenCalled();
  });

  it("should clear input after sending via Enter key", () => {
    render(<ChatInput onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText(
      "Ask anything about your notes..."
    );
    fireEvent.change(textarea, { target: { value: "enter send" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    expect((textarea as HTMLTextAreaElement).value).toBe("");
  });
});
