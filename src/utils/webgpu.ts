// ── Types ────────────────────────────────────────────────────────────────────────

export interface WebGPUAssessment {
  available: boolean;
  adapter: GPUAdapter | null;
  score: number;
  features: string[];
  fallback: "webgl" | "cpu";
}

// GPUAdapter type definition (WebGPU API)
interface GPUAdapter {
  requestDevice(): Promise<GPUDevice | null>;
  getInfo(): { vendor?: string; memory?: number };
  limits?: { maxBufferSize?: number; maxTextureDimension2D?: number };
}

interface GPUDevice {}

// ── Public API ───────────────────────────────────────────────────────────────────

/**
 * Detects WebGPU availability by checking `navigator.gpu` and requesting a
 * GPU adapter. Returns a structured assessment with a capability score.
 */
export async function detectWebGPU(): Promise<WebGPUAssessment> {
  const { gpu } = navigator as unknown as {
    gpu?: { requestAdapter(): Promise<GPUAdapter | null> };
  };

  if (!gpu) {
    return {
      available: false,
      adapter: null,
      score: 0,
      features: ["bm25-fallback"],
      fallback: "cpu",
    };
  }

  const adapter = await gpu.requestAdapter();
  const score = adapter ? await assessCapability(adapter) : 0;
  const features = getRecommendations(score);
  const fallback = getFallbackStrategy(score);

  return {
    available: true,
    adapter: adapter ?? null,
    score,
    features,
    fallback,
  };
}

/**
 * Calculates a capability score (0–100) for a WebGPU adapter.
 *
 * Scoring breakdown:
 *   - Base (adapter exists): 20
 *   - Device creation success: 20 (via requestDevice)
 *   - Memory size (up to 20)
 *   - Max dimensions (up to 20)
 *   - Rendering layers (up to 20)
 */
export async function assessCapability(adapter: GPUAdapter): Promise<number> {
  let score = 20; // Base score for adapter existence

  // Device creation via requestDevice (replaces getInfo)
  try {
    const device = await adapter.requestDevice();
    if (device) {
      score += 20;
      // Use device limits instead of adapter getInfo
      const limits = (device as unknown as { limits?: { maxBufferSize?: number } }).limits;
      const bufferSize = limits?.maxBufferSize ?? 0;
      score += Math.min(20, Math.round((bufferSize / (256 * 1024 * 1024)) * 20));
    }
  } catch {
    // Device creation failed; memory/dimension scores remain 0
  }

  // Max dimensions from adapter limits
  const limits = adapter.limits as {
    maxTextureDimension2D?: number;
  };
  const maxDim = limits?.maxTextureDimension2D ?? 0;
  score += Math.min(20, Math.round((maxDim / 4096) * 20));

  // Rendering layers (via features set size)
  const features = (adapter as unknown as { features?: unknown })
    .features as unknown as Set<string>;
  const layers = features?.size ?? 0;
  score += Math.min(20, Math.round((layers / 4) * 20));

  return Math.min(100, score);
}

/**
 * Returns feature recommendations based on the capability score.
 */
export function getRecommendations(score: number): string[] {
  if (score >= 80) return ["webgpu", "embedding", "chat"];
  if (score >= 50) return ["webgpu", "embedding"];
  if (score >= 20) return ["webgpu"];
  return ["bm25-fallback"];
}

/**
 * Returns the fallback strategy based on the capability score.
 */
export function getFallbackStrategy(score: number): "webgl" | "cpu" {
  return score >= 50 ? "webgl" : "cpu";
}
