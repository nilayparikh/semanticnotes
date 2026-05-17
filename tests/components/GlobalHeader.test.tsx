import { render, screen } from "@testing-library/react";
import { GlobalHeader } from "@/components/GlobalHeader";

describe("GlobalHeader", () => {
  it("should display app title", () => {
    render(<GlobalHeader />);

    const title = screen.getByText("SemanticNotes AI");
    expect(title).toBeInTheDocument();
  });

  it("should display status badges", () => {
    render(<GlobalHeader />);

    const webgpuBadge = screen.getByText("WebGPU Active");
    expect(webgpuBadge).toBeInTheDocument();

    const sqliteBadge = screen.getByText(/SQLite Connected/);
    expect(sqliteBadge).toBeInTheDocument();
  });

  it("should display settings button", () => {
    render(<GlobalHeader />);

    const settingsButton = screen.getByTestId("settings-button");
    expect(settingsButton).toBeInTheDocument();
  });

  it("should display help button", () => {
    render(<GlobalHeader />);

    const helpButton = screen.getByTestId("help-button");
    expect(helpButton).toBeInTheDocument();
  });

  it("should display load model button when model is not loaded", () => {
    render(<GlobalHeader modelLoaded={false} onloadModel={() => {}} />);

    const loadModelButton = screen.getByTestId("load-model-button");
    expect(loadModelButton).toBeInTheDocument();
  });

  it("should not display load model button when model is loaded", () => {
    render(<GlobalHeader modelLoaded={true} />);

    const loadModelButton = screen.queryByTestId("load-model-button");
    expect(loadModelButton).not.toBeInTheDocument();
  });
});
