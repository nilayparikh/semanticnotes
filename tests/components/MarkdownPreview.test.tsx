import { render, screen } from "@testing-library/react";
import { MarkdownPreview } from "@/components/MarkdownPreview";

describe("MarkdownPreview", () => {
  it("renders h1 headers", () => {
    render(<MarkdownPreview content="# Main Title" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Main Title",
    );
  });

  it("renders h2 headers", () => {
    render(<MarkdownPreview content="## Subtitle" />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Subtitle",
    );
  });

  it("renders h3 headers", () => {
    render(<MarkdownPreview content="### Section" />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Section",
    );
  });

  it("renders paragraphs", () => {
    render(<MarkdownPreview content="This is a paragraph." />);
    expect(screen.getByText("This is a paragraph.")).toBeInTheDocument();
  });

  it("renders unordered lists", () => {
    const content = "- Item one\n- Item two\n- Item three";
    render(<MarkdownPreview content={content} />);
    expect(screen.getByText("Item one")).toBeInTheDocument();
    expect(screen.getByText("Item two")).toBeInTheDocument();
    expect(screen.getByText("Item three")).toBeInTheDocument();
  });

  it("renders inline code spans", () => {
    render(<MarkdownPreview content="The `code` is here." />);
    expect(screen.getByText("code")).toHaveClass("font-jetbrains");
  });

  it("handles empty content", () => {
    render(<MarkdownPreview content="" />);
    const article = screen.getByRole("article");
    expect(article).toBeInTheDocument();
  });
});
