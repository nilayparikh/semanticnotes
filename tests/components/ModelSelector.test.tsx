import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ModelSelector } from "@/components/ModelSelector";

describe("ModelSelector", () => {
  const mockModels = [
    { name: "Qwen2.5-Coder-0.5B", state: "idle" as const },
    { name: "MiniLM", state: "ready" as const },
  ];

  it("should render with model list", () => {
    render(
      <ModelSelector
        models={mockModels}
        selectedModel="MiniLM"
        onModelChange={vi.fn()}
      />
    );

    const select = screen.getByRole("combobox");
    expect(select).toBeDefined();
  });

  it("should display selected model", () => {
    render(
      <ModelSelector
        models={mockModels}
        selectedModel="MiniLM"
        onModelChange={vi.fn()}
      />
    );

    expect(screen.getByText("MiniLM")).toBeDefined();
  });

  it("should emit onModelChange callback when selection changes", () => {
    const onModelChange = vi.fn();
    render(
      <ModelSelector
        models={mockModels}
        selectedModel="MiniLM"
        onModelChange={onModelChange}
      />
    );

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "Qwen2.5-Coder-0.5B" } });

    expect(onModelChange).toHaveBeenCalledWith("Qwen2.5-Coder-0.5B");
  });

  it("should display state indicators correctly", () => {
    const modelsWithStates = [
      { name: "Qwen2.5-Coder-0.5B", state: "loading" as const },
      { name: "MiniLM", state: "ready" as const },
      { name: "ErrorModel", state: "error" as const },
    ];

    render(
      <ModelSelector
        models={modelsWithStates}
        selectedModel="MiniLM"
        onModelChange={vi.fn()}
      />
    );

    expect(screen.getByText("MiniLM")).toBeDefined();
  });
});
