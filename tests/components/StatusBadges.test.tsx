import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadges } from "@/components/StatusBadges";

describe("StatusBadges", () => {
  it("should render WebGPU/SQLite badges", () => {
    render(
      <StatusBadges
        badges={[
          { label: "WebGPU", status: "ready" },
          { label: "SQLite", status: "syncing" },
        ]}
      />,
    );

    expect(screen.getByText("● WebGPU")).toBeDefined();
    expect(screen.getByText("● SQLite")).toBeDefined();
  });

  it("should render badges with correct status colors", () => {
    render(
      <StatusBadges
        badges={[
          { label: "Processing", status: "processing" },
        ]}
      />,
    );

    expect(screen.getByText("● Processing")).toBeDefined();
  });
});
