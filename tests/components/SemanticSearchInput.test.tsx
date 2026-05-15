import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SemanticSearchInput } from "../../src/components/SemanticSearchInput";

describe("SemanticSearchInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default props", () => {
    // Arrange
    const handleChange = vi.fn();

    // Act
    render(<SemanticSearchInput value="" onChange={handleChange} />);

    // Assert
    const input = screen.getByTestId("semantic-search-input");
    expect(input).toBeInTheDocument();
  });

  it("placeholder contains emoji", () => {
    // Arrange & Act
    render(<SemanticSearchInput value="" onChange={vi.fn()} />);

    // Assert
    const input = screen.getByTestId("semantic-search-input");
    expect(input).toHaveAttribute("placeholder", "🔍 AI Semantic Search...");
  });

  it("onChange called on input change", () => {
    // Arrange
    const handleChange = vi.fn();
    render(<SemanticSearchInput value="" onChange={handleChange} />);

    // Act
    const input = screen.getByTestId("semantic-search-input");
    fireEvent.change(input, { target: { value: "test query" } });

    // Assert
    expect(handleChange).toHaveBeenCalledWith("test query");
  });

  it("aria-label is present", () => {
    // Arrange & Act
    render(<SemanticSearchInput value="" onChange={vi.fn()} />);

    // Assert
    const input = screen.getByLabelText("AI Semantic Search");
    expect(input).toBeInTheDocument();
  });
});
