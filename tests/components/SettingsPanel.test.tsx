import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SettingsPanel } from "@/components/SettingsPanel";

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({
    theme: "dark" as const,
    isDark: true,
    setTheme: vi.fn(),
    glassClasses: "backdrop-blur-xl bg-white/10 border border-white/20",
  }),
}));

describe("SettingsPanel", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when closed", () => {
    render(<SettingsPanel open={false} onClose={mockOnClose} />);

    const panel = screen.queryByTestId("settings-panel");
    expect(panel).not.toBeInTheDocument();
  });

  it("should render when open", () => {
    render(<SettingsPanel open={true} onClose={mockOnClose} />);

    const panel = screen.getByTestId("settings-panel");
    expect(panel).toBeInTheDocument();
  });

  it("should close on close button click", () => {
    render(<SettingsPanel open={true} onClose={mockOnClose} />);

    const closeButton = screen.getByRole("button", { name: /close settings/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should display theme options", () => {
    render(<SettingsPanel open={true} onClose={mockOnClose} />);

    expect(screen.getByText("Light")).toBeInTheDocument();
    expect(screen.getByText("Dark")).toBeInTheDocument();
    expect(screen.getByText("System")).toBeInTheDocument();
  });

  it("should display model selection dropdown", () => {
    render(<SettingsPanel open={true} onClose={mockOnClose} />);

    const select = screen.getByRole("combobox", {
      name: /embedding model selection/i,
    });
    expect(select).toBeInTheDocument();
  });

  it("should display storage usage", () => {
    render(<SettingsPanel open={true} onClose={mockOnClose} />);

    expect(screen.getByText("24MB")).toBeInTheDocument();
    expect(screen.getByText("SQLite Usage")).toBeInTheDocument();
  });

  it("should show error message when embedding model load fails", async () => {
    render(<SettingsPanel open={true} onClose={mockOnClose} />);

    // Click the "Load Model" button for embedding
    const loadButtons = screen.getAllByText("Load Model");
    const embeddingButton = loadButtons[0];
    fireEvent.click(embeddingButton);

    // After loading, should show an error indicator (not just silent "error" state)
    await waitFor(() => {
      const errorIndicators = screen.getAllByText(/error|failed/i);
      expect(errorIndicators.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("should show error message when LLM model load fails", async () => {
    render(<SettingsPanel open={true} onClose={mockOnClose} />);

    // Click the "Load Model" button for LLM
    const loadButtons = screen.getAllByText("Load Model");
    const llmButton = loadButtons[1];
    fireEvent.click(llmButton);

    // After loading, should show an error indicator (not just silent "error" state)
    await waitFor(() => {
      const errorIndicators = screen.getAllByText(/error|failed/i);
      expect(errorIndicators.length).toBeGreaterThanOrEqual(1);
    });
  });
});
