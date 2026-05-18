/**
 * Embedding Pipeline Worker
 *
 * Generates text embeddings using Transformers.js.
 * Runs in a dedicated thread to avoid blocking the UI.
 * Cross-compiled from `docs/architecture/04_embedding_pipeline_spec.md`.
 */

import { pipeline } from "@xenova/transformers";

let embedder: any = null;

self.onmessage = async (e: MessageEvent) => {
  const { type } = e.data;

  switch (type) {
    case "INIT_MODEL": {
      const attempts = [
        {
          dtype: e.data.dtype || "float16",
          device: e.data.device || "webgpu",
        },
        {
          device: "wasm",
        },
        {},
      ];

      try {
        let lastError: unknown = null;

        for (const options of attempts) {
          try {
            embedder = await pipeline("feature-extraction", e.data.model, options as any);
            self.postMessage({ type: "MODEL_READY", device: options.device || "auto" });
            return;
          } catch (error: any) {
            lastError = error;
          }
        }

        throw lastError ?? new Error("Model init failed");
      } catch (error: any) {
        self.postMessage({
          type: "MODEL_ERROR",
          error: { message: error?.message || "Model init failed" },
        });
      }
      break;
    }

    case "EMBED": {
      try {
        if (!embedder) {
          throw new Error("Embedding model not initialized");
        }

        const { id, text } = e.data;
        const output = await embedder(text, { pooling: "mean", normalize: true });

        // Transformers.js v3: output.data is a TypedArray (Float32Array)
        // Shape is typically [1, 384] for single input with mean pooling
        const embeddings: Float32Array = output.data instanceof Float32Array
          ? output.data
          : new Float32Array(output.data);

        self.postMessage({ type: "EMBEDDING_READY", id, embeddings });
      } catch (error: any) {
        self.postMessage({
          type: "EMBEDDING_ERROR",
          id: e.data.id,
          error: { message: error?.message || "Embedding failed" },
        });
      }
      break;
    }
  }
};
