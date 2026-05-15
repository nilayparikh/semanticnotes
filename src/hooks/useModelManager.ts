/**
 * Model Manager
 *
 * Manages ONNX models via Transformers.js with WebGPU acceleration.
 * Sequential loading to minimize VRAM pressure.
 * Cross-compiled from `docs/architecture/03_model_runtime_spec.md`.
 */

import { Pipeline, ModelState, MODEL_CACHE_NAME } from "@/types/models";
import { DEFAULT_MODEL_CONFIG } from "@/types/models";

/**
 * ModelManager handles sequential loading of embedding and LLM models.
 * Only one model is loaded at a time to stay within VRAM budget.
 */
export class ModelManager {
  #embeddingPipeline: Pipeline | null = null;
  #llmPipeline: Pipeline | null = null;
  #embeddingState: ModelState = "idle";
  #llmState: ModelState = "idle";

  /** Load the embedding model (disposes LLM if active). */
  async loadEmbeddingModel(): Promise<Pipeline> {
    if (this.#embeddingPipeline) {
      return this.#embeddingPipeline;
    }

    this.#embeddingState = "loading";

    // Dispose LLM if loaded
    if (this.#llmPipeline) {
      await this.#llmPipeline.dispose();
      this.#llmPipeline = null;
      this.#llmState = "disposed";
    }

    try {
      const { pipeline } = await import("@xenova/transformers");
      this.#embeddingPipeline = await pipeline(
        DEFAULT_MODEL_CONFIG.embeddingModel.task,
        DEFAULT_MODEL_CONFIG.embeddingModel.path,
        {
          dtype: DEFAULT_MODEL_CONFIG.embeddingModel.dtype,
          device: DEFAULT_MODEL_CONFIG.embeddingModel.device,
        },
      );
      this.#embeddingState = "ready";
      return this.#embeddingPipeline;
    } catch (error) {
      this.#embeddingState = "error";
      throw error;
    }
  }

  /** Load the LLM model (disposes embedding if active). */
  async loadLLM(): Promise<Pipeline> {
    if (this.#llmPipeline) {
      return this.#llmPipeline;
    }

    this.#llmState = "loading";

    // Dispose embedding if loaded
    if (this.#embeddingPipeline) {
      await this.#embeddingPipeline.dispose();
      this.#embeddingPipeline = null;
      this.#embeddingState = "disposed";
    }

    try {
      const { pipeline } = await import("@xenova/transformers");
      this.#llmPipeline = await pipeline(
        DEFAULT_MODEL_CONFIG.llmModel.task,
        DEFAULT_MODEL_CONFIG.llmModel.path,
        {
          dtype: DEFAULT_MODEL_CONFIG.llmModel.dtype,
          device: DEFAULT_MODEL_CONFIG.llmModel.device,
        },
      );
      this.#llmState = "ready";
      return this.#llmPipeline;
    } catch (error) {
      this.#llmState = "error";
      throw error;
    }
  }

  /** Dispose all loaded models. */
  async disposeAll(): Promise<void> {
    if (this.#embeddingPipeline) {
      await this.#embeddingPipeline.dispose();
      this.#embeddingPipeline = null;
    }
    this.#embeddingState = "disposed";

    if (this.#llmPipeline) {
      await this.#llmPipeline.dispose();
      this.#llmPipeline = null;
    }
    this.#llmState = "disposed";
  }

  /** Get current embedding model state. */
  getEmbeddingState(): ModelState {
    return this.#embeddingState;
  }

  /** Get current LLM model state. */
  getLLMState(): ModelState {
    return this.#llmState;
  }

  /** Cache model files via Cache API. */
  async cacheModel(modelPath: string, modelFiles: string[]): Promise<void> {
    if (typeof caches === "undefined") return;

    const cache = await caches.open(MODEL_CACHE_NAME);
    for (const file of modelFiles) {
      const url = `https://huggingface.co/${modelPath}/resolve/main/${file}`;
      const response = await fetch(url, { cache: "force-cache" });
      await cache.put(url, response);
    }
  }

  /** Check if all model files are cached. */
  async getCachedModel(modelPath: string, modelFiles: string[]): Promise<boolean> {
    if (typeof caches === "undefined") return false;

    const cache = await caches.open(MODEL_CACHE_NAME);
    for (const file of modelFiles) {
      const url = `https://huggingface.co/${modelPath}/resolve/main/${file}`;
      const response = await cache.match(url);
      if (!response || !response.ok) return false;
    }
    return true;
  }
}
