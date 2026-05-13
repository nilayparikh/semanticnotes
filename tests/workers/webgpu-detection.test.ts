import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  detectWebGPU,
  assessCapability,
  getRecommendations,
  getFallbackStrategy,
  WebGPUAssessment,
} from "@/utils/webgpu";

// ── Mock Helpers ─────────────────────────────────────────────────────────

function createMockAdapter(options: {
  scoreBase?: number;
  maxTextureDimension2D?: number;
  featuresSize?: number;
}): GPUAdapter {
  const scoreBase = options.scoreBase ?? 50;
  const maxDim = options.maxTextureDimension2D ?? 2048;
  const featuresSize = options.featuresSize ?? 2;

  return {
    requestDevice: vi.fn().mockResolvedValue(true),
    requestAdapter: vi.fn(),
    features: { size: featuresSize } as unknown as Set<string>,
    limits: {
      maxTextureDimension2D: maxDim,
    } as unknown as GPUAdapterLimits,
    getInfo: vi.fn().mockReturnValue({
      vendor: "mock",
      memory: scoreBase * 10,
    }),
  } as unknown as GPUAdapter;
}

// ── detectWebGPU (navigator.gpu present) ──────────────────────────────────

describe("detectWebGPU — navigator.gpu exists", () => {
  let mockAdapter: GPUAdapter;

  beforeEach(() => {
    mockAdapter = createMockAdapter({ scoreBase: 8 });
    (navigator as any).gpu = {
      requestAdapter: vi.fn().mockResolvedValue(mockAdapter),
    };
  });

  it("returns available: true when navigator.gpu exists", async () => {
    const result: WebGPUAssessment = await detectWebGPU();
    expect(result.available).toBe(true);
  });

  it("includes an adapter reference", async () => {
    const result = await detectWebGPU();
    expect(result.adapter).not.toBeNull();
  });

  it("populates features and fallback", async () => {
    const result = await detectWebGPU();
    expect(result.features).toBeDefined();
    expect(result.fallback).toBeDefined();
  });
});

// ── detectWebGPU (navigator.gpu absent) ───────────────────────────────────

describe("detectWebGPU — navigator.gpu is undefined", () => {
  beforeEach(() => {
    (navigator as any).gpu = undefined;
  });

  it("returns available: false", async () => {
    const result = await detectWebGPU();
    expect(result.available).toBe(false);
  });

  it("returns score of 0", async () => {
    const result = await detectWebGPU();
    expect(result.score).toBe(0);
  });

  it("recommends BM25 fallback", async () => {
    const result = await detectWebGPU();
    expect(result.features).toContain("bm25-fallback");
  });

  it("falls back to CPU", async () => {
    const result = await detectWebGPU();
    expect(result.fallback).toBe("cpu");
  });
});

// ── assessCapability ──────────────────────────────────────────────────────

describe("assessCapability", () => {
  it("returns a score between 0 and 100", async () => {
    const adapter = createMockAdapter({ scoreBase: 4 });
    const score = await assessCapability(adapter);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("returns higher scores for better adapters", async () => {
    const lowAdapter = createMockAdapter({
      scoreBase: 2,
      maxTextureDimension2D: 1024,
      featuresSize: 1,
    });
    const highAdapter = createMockAdapter({
      scoreBase: 50,
      maxTextureDimension2D: 4096,
      featuresSize: 4,
    });

    const lowScore = await assessCapability(lowAdapter);
    const highScore = await assessCapability(highAdapter);
    expect(highScore).toBeGreaterThan(lowScore);
  });

  it("returns minimum base score of 20 for a bare adapter", async () => {
    const adapter = createMockAdapter({
      scoreBase: 0,
      maxTextureDimension2D: 1024,
      featuresSize: 1,
    });
    const score = await assessCapability(adapter);
    expect(score).toBeGreaterThanOrEqual(20);
  });
});

// ── getRecommendations ────────────────────────────────────────────────────

describe("getRecommendations", () => {
  it("returns [webgpu, embedding, chat] for score >= 80", () => {
    expect(getRecommendations(80)).toEqual(["webgpu", "embedding", "chat"]);
    expect(getRecommendations(100)).toEqual(["webgpu", "embedding", "chat"]);
  });

  it("returns [webgpu, embedding] for score >= 50", () => {
    expect(getRecommendations(50)).toEqual(["webgpu", "embedding"]);
    expect(getRecommendations(65)).toEqual(["webgpu", "embedding"]);
  });

  it("returns [webgpu] for score >= 20", () => {
    expect(getRecommendations(20)).toEqual(["webgpu"]);
    expect(getRecommendations(35)).toEqual(["webgpu"]);
  });

  it("returns [bm25-fallback] for score < 20", () => {
    expect(getRecommendations(19)).toEqual(["bm25-fallback"]);
    expect(getRecommendations(5)).toEqual(["bm25-fallback"]);
  });
});

// ── getFallbackStrategy ───────────────────────────────────────────────────

describe("getFallbackStrategy", () => {
  it('returns "webgl" for scores >= 50', () => {
    expect(getFallbackStrategy(50)).toBe("webgl");
    expect(getFallbackStrategy(75)).toBe("webgl");
    expect(getFallbackStrategy(100)).toBe("webgl");
  });

  it('returns "cpu" for scores < 50', () => {
    expect(getFallbackStrategy(49)).toBe("cpu");
    expect(getFallbackStrategy(20)).toBe("cpu");
    expect(getFallbackStrategy(0)).toBe("cpu");
  });
});
