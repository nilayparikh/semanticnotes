/**
 * Model Runtime Type Definitions
 *
 * Types for the Transformers.js WebGPU model runtime layer.
 * Cross-compiled from `docs/architecture/03_model_runtime_spec.md`.
 */

// ── Pipeline Type ─────────────────────────────────────────────────────────

export type Pipeline = any; // Will be properly typed when @xenova/transformers is installed

// ── Model States ──────────────────────────────────────────────────────────

export type ModelState = "idle" | "loading" | "ready" | "error" | "disposed";

// ── Model Info ────────────────────────────────────────────────────────────

export interface ModelInfo {
  name: string;
  dimensions: number;
  footprint: string;
  purpose: string;
  dtype: string;
}

// ── Model Manager Interface ───────────────────────────────────────────────

export interface ModelManagerInterface {
  loadEmbeddingModel(): Promise<Pipeline>;
  loadLLM(): Promise<Pipeline>;
  disposeAll(): Promise<void>;
  getEmbeddingState(): ModelState;
  getLLMState(): ModelState;
}

// ── Model Cache ───────────────────────────────────────────────────────────

export const MODEL_CACHE_NAME = "semanticnotes-models-v1";

export interface ModelCacheEntry {
  modelPath: string;
  files: string[];
  cached: boolean;
}

// ── Model Config ──────────────────────────────────────────────────────────

export interface ModelConfig {
  embeddingModel: {
    task: string;
    path: string;
    dtype: string;
    device: string;
  };
  llmModel: {
    task: string;
    path: string;
    dtype: string;
    device: string;
  };
}

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  embeddingModel: {
    task: "feature-extraction",
    path: "onnx-community/all-MiniLM-L6-v2",
    dtype: "float16",
    device: "webgpu",
  },
  llmModel: {
    task: "text-generation",
    path: "onnx-community/Qwen2.5-Coder-0.5B-Instruct",
    dtype: "q4",
    device: "webgpu",
  },
};
