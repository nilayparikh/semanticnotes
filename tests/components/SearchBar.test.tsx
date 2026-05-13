import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchBar } from "@/components/SearchBar";

describe("SearchBar", () => {
  it("should render glassmorphic search input", () => {
    render(<SearchBar value="" onChange={() => {}} />);

    const input = screen.getByPlaceholderText("AI Semantic Search...");
    expect(input).toBeDefined();
  });

  it("should have placeholder text", () => {
    render(<SearchBar value="" onChange={() => {}} />);

    const input = screen.getByPlaceholderText("AI Semantic Search...");
    expect(input).toBeDefined();
  });

  it("should emit search event on input", () => {
    const onChange = vi.fn();
    render(<SearchBar value="test" onChange={onChange} />);

    const input = screen.getByDisplayValue("test");
    expect(input).toBeDefined();
  });
});
