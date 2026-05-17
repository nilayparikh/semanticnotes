import { render, screen } from "@testing-library/react";
import App from "@/App";

describe("App Layout", () => {
  it("should render 3-column layout", () => {
    render(<App />);

    // Verify header exists
    const header = screen.getByText("SemanticNotes AI");
    expect(header).toBeInTheDocument();
  });

  it("should have sidebar with search bar", () => {
    render(<App />);

    // Verify sidebar search exists
    const searchInput = screen.getByPlaceholderText("AI Semantic Search...");
    expect(searchInput).toBeInTheDocument();
  });

  it("should have editor area", () => {
    render(<App />);

    // Verify editor placeholder exists (no note selected)
    expect(screen.getByText(/Select or create a note to begin/)).toBeInTheDocument();
  });

  it("should have context panel", () => {
    render(<App />);

    // Verify context panel header exists
    const contextPanel = screen.getByText("🤖 Local AI Insights");
    expect(contextPanel).toBeInTheDocument();
  });

  it("should display status badges in header", () => {
    render(<App />);

    // Verify header with status badges
    const header = screen.getByText("SemanticNotes AI");
    expect(header).toBeInTheDocument();

    const webgpuBadge = screen.getByText("WebGPU Active");
    expect(webgpuBadge).toBeInTheDocument();

    const sqliteBadge = screen.getByText(/SQLite Connected/);
    expect(sqliteBadge).toBeInTheDocument();
  });

  it("should include search bar in sidebar", () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText("AI Semantic Search...");
    expect(searchInput).toBeInTheDocument();
  });
});
