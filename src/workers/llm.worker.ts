/**
 * LLM Inference Worker
 *
 * Handles text generation using Transformers.js.
 * Runs in a dedicated thread to avoid blocking the UI.
 * Cross-compiled from `docs/architecture/03_model_runtime_spec.md`.
 */

import { pipeline } from "@xenova/transformers";

let generator: any = null;

self.onmessage = async (e: MessageEvent) => {
  const { type } = e.data;

  switch (type) {
    case "INIT_MODEL": {
      try {
        generator = await pipeline("text-generation", e.data.model, {
          dtype: e.data.dtype || "q4",
          device: e.data.device || "webgpu",
        } as any);
        self.postMessage({ type: "MODEL_READY" });
      } catch (error: any) {
        self.postMessage({
          type: "MODEL_ERROR",
          error: { message: error?.message || "Model init failed" },
        });
      }
      break;
    }

    case "GENERATE": {
      try {
        if (!generator) {
          throw new Error("LLM model not initialized");
        }

        const { id, prompt, maxTokens } = e.data;
        const output = await generator(prompt, {
          max_new_tokens: maxTokens || 256,
        });

        self.postMessage({ type: "GENERATION_READY", id, output });
      } catch (error: any) {
        self.postMessage({
          type: "GENERATION_ERROR",
          id: e.data.id,
          error: { message: error?.message || "Generation failed" },
        });
      }
      break;
    }
  }
};
