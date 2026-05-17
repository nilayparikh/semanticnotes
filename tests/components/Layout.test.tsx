import { render, screen } from "@testing-library/react";
import { Layout } from "@/components/Layout";

describe("Layout", () => {
  it("should render 3-column grid layout", () => {
    render(<Layout />);

    const sidebar = screen.getByTestId("sidebar");
    expect(sidebar).toBeInTheDocument();

    const main = screen.getByTestId("main");
    expect(main).toBeInTheDocument();

    const chat = screen.getByTestId("chat");
    expect(chat).toBeInTheDocument();
  });

  it("should display global header with app title", () => {
    render(<Layout />);

    const title = screen.getByText("SemanticNotes.ai");
    expect(title).toBeInTheDocument();
  });

  it("should collapse sidebar on mobile breakpoint", () => {
    render(<Layout />);

    const sidebar = screen.getByTestId("sidebar");
    expect(sidebar).toHaveClass("hidden");
  });

  it("should expand sidebar on desktop breakpoint", () => {
    render(<Layout />);

    const sidebar = screen.getByTestId("sidebar");
    expect(sidebar).toHaveClass("lg:block");
  });

  it("should handle responsive breakpoints", () => {
    render(<Layout />);

    const grid = screen.getByTestId("grid");
    expect(grid).toHaveClass("grid-cols-1");
    expect(grid).toHaveClass("lg:grid-cols-3");
  });
});
