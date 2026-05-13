import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AIChat } from "@/components/AIChat";

describe("AIChat", () => {
  it("should render chat interface", () => {
    render(<AIChat />);

    expect(screen.getByText("Ask your local AI...")).toBeDefined();
    expect(screen.getByPlaceholderText("Type your question...")).toBeDefined();
    expect(screen.getByText("Send")).toBeDefined();
  });
});
