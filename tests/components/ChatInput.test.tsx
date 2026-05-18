import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatInput } from "@/components/ChatInput";

describe("ChatInput", () => {
  let onSendMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSendMock = vi.fn();
  });

  it("should render input with placeholder text", () => {
    render(<ChatInput onSend={onSendMock} />);

    const input = screen.getByPlaceholderText(
      "Ask anything about your notes..."
    );
    expect(input).toBeDefined();
  });

  it("should render send button", () => {
    render(<ChatInput onSend={onSendMock} />);

    const button = screen.getByLabelText("Send");
    expect(button).toBeDefined();
  });

  it("should have send button disabled when input is empty", () => {
    render(<ChatInput onSend={onSendMock} />);

    const button = screen.getByLabelText("Send");
    expect(button).toBeDisabled();
  });

  it("should enable send button when input has text", () => {
    render(<ChatInput onSend={onSendMock} />);

    const input = screen.getByPlaceholderText(
      "Ask anything about your notes..."
    );
    fireEvent.change(input, { target: { value: "hello" } });

    const button = screen.getByLabelText("Send");
    expect(button).not.toBeDisabled();
  });

  it("should emit onSend with query string when button is clicked", () => {
    render(<ChatInput onSend={onSendMock} />);

    const input = screen.getByPlaceholderText(
      "Ask anything about your notes..."
    );
    fireEvent.change(input, { target: { value: "what is TDD?" } });

    const button = screen.getByLabelText("Send");
    fireEvent.click(button);

    expect(onSendMock).toHaveBeenCalledWith("what is TDD?");
  });

  it("should clear input after sending", () => {
    render(<ChatInput onSend={onSendMock} />);

    const input = screen.getByPlaceholderText(
      "Ask anything about your notes..."
    );
    fireEvent.change(input, { target: { value: "test query" } });

    const button = screen.getByLabelText("Send");
    fireEvent.click(button);

    expect((input as HTMLInputElement).value).toBe("");
  });

  it("should emit onSend when Enter key is pressed", () => {
    render(<ChatInput onSend={onSendMock} />);

    const input = screen.getByPlaceholderText(
      "Ask anything about your notes..."
    );
    fireEvent.change(input, { target: { value: "enter query" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSendMock).toHaveBeenCalledWith("enter query");
  });

  it("should clear input after sending via Enter key", () => {
    render(<ChatInput onSend={onSendMock} />);

    const input = screen.getByPlaceholderText(
      "Ask anything about your notes..."
    );
    fireEvent.change(input, { target: { value: "enter send" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect((input as HTMLInputElement).value).toBe("");
  });
});
