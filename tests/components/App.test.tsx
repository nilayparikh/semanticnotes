import { render, screen } from "@testing-library/react";
import App from "@/App";

describe("App Layout", () => {
  it("should render 3-column layout", () => {
    render(<App />);

    // Verify flex container exists
    const flexContainer = screen.getByRole("main");
    expect(flexContainer).toBeInTheDocument();
  });

  it("should have sidebar with 20% width", () => {
    render(<App />);

    // Verify sidebar exists with correct width
    const sidebar = screen.getByPlaceholderText("AI Semantic Search...");
    expect(sidebar).toBeInTheDocument();
  });

  it("should have editor with 55% width", () => {
    render(<App />);

    // Verify editor area exists
    const editorArea = screen.getByText(/Select or create a note to begin/);
    expect(editorArea).toBeInTheDocument();
  });

  it("should have context panel with 25% width", () => {
    render(<App />);

    // Verify context panel exists
    const contextPanel = screen.getByText("Context Panel");
    expect(contextPanel).toBeInTheDocument();
  });

  it("should display status badges in header", () => {
    render(<App />);

    // Verify header with status badges
    const header = screen.getByText("SemanticNotes.ai");
    expect(header).toBeInTheDocument();

    const webgpuBadge = screen.getByText("● WebGPU");
    expect(webgpuBadge).toBeInTheDocument();

    const sqliteBadge = screen.getByText("● SQLite");
    expect(sqliteBadge).toBeInTheDocument();
  });

  it("should include search bar in sidebar", () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText("AI Semantic Search...");
    expect(searchInput).toBeInTheDocument();
  });
});
