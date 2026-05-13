import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AIContextBar } from "@/components/AIContextBar";

describe("AIContextBar", () => {
  it("should render floating pill with AI status", () => {
    render(
      <AIContextBar
        isProcessing={false}
        onSummarize={() => {}}
        onFinishLinks={() => {}}
      />,
    );

    expect(screen.getByText("AI Ready")).toBeDefined();
  });

  it("should have Summarize and Find Links buttons", () => {
    render(
      <AIContextBar
        isProcessing={false}
        onSummarize={() => {}}
        onFinishLinks={() => {}}
      />,
    );

    expect(screen.getByText("Summarize")).toBeDefined();
    expect(screen.getByText("Find Links")).toBeDefined();
  });

  it("should pulse when AI is processing", () => {
    render(
      <AIContextBar
        isProcessing={true}
        onSummarize={() => {}}
        onFinishLinks={() => {}}
      />,
    );

    expect(screen.getByText("AI Processing...")).toBeDefined();
  });
});
