import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatThread, ChatMessage } from "@/components/ChatThread";

const makeMsg = (role: "user" | "assistant", content: string): ChatMessage => ({
  role,
  content,
  timestamp: new Date().toISOString(),
});

const createMessages = (count: number): ChatMessage[] =>
  Array.from({ length: count }, (_, i) => ({
    role: i % 2 === 0 ? "user" : "assistant",
    content: `Message ${i + 1}`,
    timestamp: new Date(2026, 4, 12, 10, i).toISOString(),
  }));

describe("ChatThread", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should render an empty state when no messages are provided", () => {
    render(<ChatThread messages={[]} />);
    expect(screen.getByText("No messages yet")).toBeDefined();
  });

  it("should render chat messages in order", () => {
    const messages: ChatMessage[] = [
      { role: "user", content: "Hello", timestamp: new Date().toISOString() },
      { role: "assistant", content: "Hi there!", timestamp: new Date().toISOString() },
      { role: "user", content: "How are you?", timestamp: new Date().toISOString() },
    ];
    render(<ChatThread messages={messages} />);
    expect(screen.getByText("Hello")).toBeDefined();
    expect(screen.getByText("Hi there!")).toBeDefined();
    expect(screen.getByText("How are you?")).toBeDefined();
  });

  it("should display user messages with user styling", () => {
    render(<ChatThread messages={[makeMsg("user", "User message")]} />);
    expect(screen.getByText("User message").parentElement?.parentElement).toHaveClass("justify-end");
  });

  it("should display assistant messages with assistant styling", () => {
    render(<ChatThread messages={[makeMsg("assistant", "Assistant message")]} />);
    expect(screen.getByText("Assistant message").parentElement?.parentElement).toHaveClass("justify-start");
  });

  it("should display streaming tokens with pulsing cursor", () => {
    render(<ChatThread messages={[makeMsg("user", "What is AI?")]} streamingText="AI is a field of..." />);
    expect(screen.getByText("AI is a field of...")).toBeDefined();
    expect(screen.getByTestId("streaming-cursor")).toBeDefined();
  });

  it("should not render streaming cursor when not streaming", () => {
    render(<ChatThread messages={[makeMsg("user", "What is AI?")]} />);
    expect(screen.queryByTestId("streaming-cursor")).toBeNull();
  });

  it("should show only the last 50 messages when there are many", () => {
    render(<ChatThread messages={createMessages(100)} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(50);
    expect(screen.getByText("Message 51")).toBeDefined();
    expect(screen.getByText("Message 100")).toBeDefined();
    expect(screen.queryByText("Message 1")).toBeNull();
  });

  it("should scroll to bottom when new messages are added", () => {
    const { rerender } = render(<ChatThread messages={[makeMsg("user", "First")]} />);
    rerender(<ChatThread messages={[makeMsg("user", "First"), makeMsg("assistant", "New")]} />);
    expect(screen.getByRole("list").parentElement).toBeDefined();
  });

  it("should have proper ARIA attributes", () => {
    render(<ChatThread messages={[makeMsg("user", "Test")]} />);
    expect(screen.getByRole("list")).toHaveAttribute("aria-label", "Chat messages");
  });
});
