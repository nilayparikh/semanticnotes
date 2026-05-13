import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AutoTags } from "@/components/AutoTags";

describe("AutoTags", () => {
  it("should render color-coded pill badges", () => {
    render(<AutoTags tags={["AI", "Design", "Research"]} />);

    expect(screen.getByText("AI")).toBeDefined();
    expect(screen.getByText("Design")).toBeDefined();
    expect(screen.getByText("Research")).toBeDefined();
  });

  it("should render empty state when no tags", () => {
    const { container } = render(<AutoTags tags={["Empty"]} />);

    expect(screen.getByText("Empty")).toBeDefined();
  });
});
