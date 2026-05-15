import { describe, it, expect, beforeEach, vi, Mocked } from "vitest";
import { ModelManager } from "@/hooks/useModelManager";

// ── Mock Pipeline ────────────────────────────────────────────────────────

function createMockPipeline(name: string): Mocked<any> {
  return {
    name,
    dispose: vi.fn().mockResolvedValue(undefined),
    call: vi.fn().mockResolvedValue([]),
  };
}

// ── Mock pipeline factory ────────────────────────────────────────────────

const mockPipeline = vi.fn();

vi.mock("@xenova/transformers", () => ({
  pipeline: mockPipeline,
}));

// Need to import after mock
vi.mock("@/hooks/useModelManager", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual };
});

describe("ModelManager", () => {
  let manager: ModelManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new ModelManager();
  });

  it("should load embedding model", async () => {
    const mockModel = createMockPipeline("embedding");
    mockPipeline.mockResolvedValueOnce(mockModel);

    const result = await manager.loadEmbeddingModel();

    expect(result).toBe(mockModel);
    expect(mockPipeline).toHaveBeenCalledWith(
      "feature-extraction",
      "onnx-community/all-MiniLM-L6-v2",
      expect.objectContaining({ dtype: "float16", device: "webgpu" }),
    );
  });

  it("should dispose previous model before loading next", async () => {
    const llmModel = createMockPipeline("llm");
    const embeddingModel = createMockPipeline("embedding");
    mockPipeline
      .mockResolvedValueOnce(llmModel)
      .mockResolvedValueOnce(embeddingModel);

    await manager.loadLLM();
    await manager.loadEmbeddingModel();

    expect(llmModel.dispose).toHaveBeenCalled();
    expect(embeddingModel.dispose).not.toHaveBeenCalled();
  });

  it("should track model loading states independently", async () => {
    const mockModel = createMockPipeline("embedding");
    mockPipeline.mockResolvedValueOnce(mockModel);

    expect(manager.getEmbeddingState()).toBe("idle");

    // Start loading
    const loadPromise = manager.loadEmbeddingModel();
    expect(manager.getEmbeddingState()).toBe("loading");

    await loadPromise;
    expect(manager.getEmbeddingState()).toBe("ready");
  });

  it("should cache model files via Cache API", async () => {
    const mockCache = {
      put: vi.fn().mockResolvedValue(undefined),
    };
    const mockCaches = {
      open: vi.fn().mockResolvedValue(mockCache),
    };

    globalThis.caches = mockCaches as any;

    await manager.cacheModel("test-model", ["model.onnx", "config.json"]);

    expect(mockCaches.open).toHaveBeenCalledWith("semanticnotes-models-v1");
    expect(mockCache.put).toHaveBeenCalledTimes(2);
  });

  it("should check cached model availability", async () => {
    const mockResponse = new Response("ok", { status: 200 });
    const mockCache = {
      match: vi.fn().mockResolvedValue(mockResponse),
    };
    const mockCaches = {
      open: vi.fn().mockResolvedValue(mockCache),
    };

    globalThis.caches = mockCaches as any;

    const available = await manager.getCachedModel("test-model", [
      "model.onnx",
      "config.json",
    ]);

    expect(available).toBe(true);
  });

  it("should return false when cached model is incomplete", async () => {
    const mockCache = {
      match: vi.fn().mockResolvedValueOnce(null),
    };
    const mockCaches = {
      open: vi.fn().mockResolvedValue(mockCache),
    };

    globalThis.caches = mockCaches as any;

    const available = await manager.getCachedModel("test-model", [
      "model.onnx",
      "config.json",
    ]);

    expect(available).toBe(false);
  });

  it("should dispose all models on disposeAll", async () => {
    const embeddingModel = createMockPipeline("embedding");
    const llmModel = createMockPipeline("llm");
    mockPipeline
      .mockResolvedValueOnce(embeddingModel)
      .mockResolvedValueOnce(llmModel);

    await manager.loadEmbeddingModel();
    await manager.loadLLM();

    await manager.disposeAll();

    expect(embeddingModel.dispose).toHaveBeenCalled();
    expect(llmModel.dispose).toHaveBeenCalled();
  });
});
