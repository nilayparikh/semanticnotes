import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SemanticContextPanel } from "@/components/SemanticContextPanel";

describe("SemanticContextPanel", () => {
  it("should render Auto-Tags section", () => {
    render(
      <SemanticContextPanel
        tags={["#ai", "#design"]}
        relatedNotes={[]}
      />,
    );

    expect(screen.getByText("✨ Auto-Tags")).toBeDefined();
    expect(screen.getByText("#ai")).toBeDefined();
  });

  it("should render Semantically Related notes", () => {
    render(
      <SemanticContextPanel
        tags={["#ai"]}
        relatedNotes={[
          { id: "1", title: "Note 1", similarity: 0.85 },
        ]}
      />,
    );

    expect(screen.getByText("🔗 Semantically Related")).toBeDefined();
    expect(screen.getByText("Note 1")).toBeDefined();
  });

  it("should render Local AI Q&A chat", () => {
    render(
      <SemanticContextPanel
        tags={["#ai"]}
        relatedNotes={[]}
      />,
    );

    expect(screen.getByText("Local AI Q&A")).toBeDefined();
  });

  it("should render Database Vector Metrics", () => {
    render(
      <SemanticContextPanel
        tags={["#ai"]}
        relatedNotes={[]}
      />,
    );

    expect(screen.getByText("📊 Database Vector Metrics")).toBeDefined();
  });
});
