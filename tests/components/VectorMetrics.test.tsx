import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VectorMetrics } from "@/components/VectorMetrics";

describe("VectorMetrics", () => {
  it("should render database metrics", () => {
    render(<VectorMetrics />);

    expect(screen.getByText("Dimensions")).toBeDefined();
    expect(screen.getByText("Vector Count")).toBeDefined();
    expect(screen.getByText("Avg. Similarity")).toBeDefined();
  });
});
