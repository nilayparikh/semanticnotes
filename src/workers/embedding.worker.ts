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
      try {
        embedder = await pipeline("feature-extraction", e.data.model, {
          dtype: e.data.dtype || "float16",
          device: e.data.device || "webgpu",
        });
        self.postMessage({ type: "MODEL_READY" });
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

        // Extract Float32Array from output
        const embeddings: Float32Array = new Float32Array(
          output.data.shape[1],
        );
        for (let i = 0; i < output.data.shape[1]; i++) {
          embeddings[i] = output.data[0][i];
        }

        self.postMessage(
          { type: "EMBEDDING_READY", id, embeddings },
          [embeddings.buffer],
        );
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
