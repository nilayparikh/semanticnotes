import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

// Mock wa-sqlite for worker tests
vi.mock("wa-sqlite", () => ({
  Factory: vi.fn().mockReturnValue({
    open_v2: vi.fn().mockResolvedValue(1),
    exec: vi.fn().mockResolvedValue(0),
    execWithParams: vi.fn().mockResolvedValue({ rows: [], columns: [] }),
    run: vi.fn().mockResolvedValue(0),
  }),
}));

vi.mock("wa-sqlite/dist/wa-sqlite-async.mjs", () => ({
  default: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/workers/sqlite.worker?worker", () => ({
  default: class MockSqliteWorker {
    onmessage: ((e: MessageEvent) => void) | null = null;
    postMessage = vi.fn((data: any) => {
      setTimeout(() => {
        if (data.type === "MOUNT") {
          this.onmessage?.(new MessageEvent("message", { data: { type: "MOUNTED" } }));
        } else if (data.type === "QUERY") {
          this.onmessage?.(new MessageEvent("message", { data: { type: "RESULT", id: data.id, row: [] } }));
        }
      }, 0);
    });
    terminate = vi.fn();
    addEventListener = vi.fn((type: string, handler: (e: MessageEvent) => void) => {
      if (type === "message") this.onmessage = handler;
    });
    removeEventListener = vi.fn();
  },
}));

// Mock DbService to auto-resolve ready
vi.mock("@/hooks/useDbService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/useDbService")>();
  return {
    ...actual,
    DbService: class MockDbService {
      query = vi.fn().mockResolvedValue([]);
      initialize = vi.fn();
      terminate = vi.fn();
      ready = Promise.resolve();
    },
  };
});

vi.mock("@/hooks/useEmbeddingPipeline", () => ({
  useEmbeddingPipeline: () => ({
    embedNote: vi.fn(),
    isEmbedding: false,
    isModelReady: true,
    isModelLoading: false,
    modelError: null,
    lastResult: undefined,
  }),
}));

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

    // Verify context panel sections exist (Auto-Tags, Related Notes, Local AI Q&A, Vector Metrics)
    const autoTags = screen.getByText("Auto-Tags");
    expect(autoTags).toBeInTheDocument();
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
