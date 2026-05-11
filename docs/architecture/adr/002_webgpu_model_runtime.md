---
name: WebGPU & Model Runtime Strategy
status: proposed
date: 2026-05-11
context: >
  SemanticNotes.ai uses Transformers.js v3 (ONNX Runtime Web) with native WebGPU
  acceleration for two local models: all-MiniLM-L6-v2 (~350 MB) for text embeddings
  and Qwen2.5-Coder-0.5B-Instruct Q4 (~360 MB) for local chat. The combined ~710 MB
  footprint creates four gaps: dual-model VRAM collisions on integrated GPUs,
  incomplete WebGPU feature detection, no model download caching, and no WebGPU
  device lifecycle recovery when the tab is backgrounded.
decision: >
  Implement sequential model loading with explicit unload/purge between inference
  cycles, full WebGPU feature detection with GPUAdapterInfo fallback, Cache API
  persistence for ONNX model downloads, and GPUDevice.lost() recovery with automatic
  model reload.
consequences: >
  - VRAM pressure on Intel Iris Xe drops from ~710 MB simultaneous to ~360 MB peak.
  - Feature detection reduces "silent fallback" to CPU on older GPUs.
  - Model downloads cached via Cache API, reducing cold-load fetch to ~2.5 seconds
    (vs. ~15 seconds on 3G).
  - Tab backgrounding no longer silently kills the WebGPU device.
---

# ADR-002: WebGPU & Model Runtime Strategy

## Problem

SemanticNotes.ai runs two ONNX models on WebGPU via Transformers.js v3. Four gaps
threaten runtime stability:

1. **Dual-Model VRAM Collision (High)** — The embedding model (~350 MB) and the LLM
   (~360 MB) load simultaneously. On integrated GPUs (e.g., Intel Iris Xe with ~2 GB
   shared VRAM), the combined footprint risks `OutOfMemory` during inference.
2. **WebGPU Feature Detection Gaps (Medium)** — `navigator.gpu` exists but doesn't
   guarantee full compute pipeline support. No `GPUAdapterInfo` fallback is defined,
   meaning older GPUs may silently fall back to CPU with no user-facing indicator.
3. **Model Download & Caching (High)** — Two ~710 MB ONNX models are fetched on every
   cold load with no `Cache API` or `IndexedDB` persistence. On a 3G connection, the
   user waits ~15 seconds for models to re-fetch.
4. **Worker-to-WebGPU Context Loss (Medium)** — When a tab is backgrounded, the browser
   may suspend the WebGPU device. No `GPUDevice.lost()` event listener is defined,
   meaning the model reload is silent and the user sees a "frozen" chat panel.

---

## Options Considered

### Gap 1: Dual-Model VRAM Collision

| Option                                      | Pros                                       | Cons                                                   |
| ------------------------------------------- | ------------------------------------------ | ------------------------------------------------------ |
| **A. Sequential Load/Unload**               | Peak VRAM = max(model_A, model_B), not sum | Requires explicit `model.dispose()` between inferences |
| **B. Model Quantization (Q4 → Q8)**         | Reduces per-model footprint                | Trade-off: embedding accuracy vs. LLM token quality    |
| **C. Single Combined ONNX Graph**           | Both models share a single `GPUBuffer`     | Complex graph merge, less flexibility for model swaps  |
| **D. Lazy LLM Loading (load on chat open)** | LLM only in VRAM when actively chatting    | First-chat latency spike (~2-3 seconds)                |

### Gap 2: WebGPU Feature Detection

| Option                                       | Pros                                       | Cons                                                   |
| -------------------------------------------- | ------------------------------------------ | ------------------------------------------------------ |
| **A. Full `GPUAdapterInfo` probe**           | Reads vendor, device, and name properties  | Requires `requestAdapter` → `requestDevice` round-trip |
| **B. `GPUFeatureNames` array check**         | Checks for `float16`, `bgra8unorm` support | Doesn't guarantee compute shader performance           |
| **C. Benchmark a 384-dim vector at runtime** | Real-world measurement                     | Adds ~500 ms to initial load                           |

### Gap 3: Model Download Caching

| Option                                       | Pros                                  | Cons                                                       |
| -------------------------------------------- | ------------------------------------- | ---------------------------------------------------------- |
| \*\*A. Cache API (`caches.open("models")`)   | Native, HTTP-layer caching, versioned | Requires models to be served with `ETag` / `Last-Modified` |
| \*\*B. IndexedDB (`IDBKeyedStore`)           | Binary-friendly, versioned            | Requires `IDBTransaction` setup                            |
| **C. `localStorage` (JSON-encoded weights)** | Simple                                | Size limit ~5 MB per origin, too small for 710 MB          |
| **D. OPFS File Cache**                       | Same filesystem as SQLite             | Requires `FileSystemHandle` lifecycle management           |

### Gap 4: WebGPU Device Lifecycle

| Option                                        | Pros                                        | Cons                                                 |
| --------------------------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| **A. `GPUDevice.lost()` event listener**      | Native, automatic device tracking           | Requires model re-instantiation on `lost` event      |
| **B. `VisibilityChange` + manual reload**     | Simple, leverages `document.hidden`         | Misses non-visibility-related suspensions            |
| **C. WebGPU `GPUComputePipeline` recreation** | Rebuilds pipeline without full model reload | Requires ONNX Runtime Web `InferenceSession` rebuild |

---

## Recommended Approach

### Gap 1: Sequential Model Loading with Explicit Unload

Load the embedding model, perform inference, then `dispose()` before loading the LLM.
This ensures peak VRAM never exceeds the size of the larger single model.

```typescript
// workers/model-manager.ts
import { pipeline, Pipeline } from "@huggingface/transformers";

interface ModelConfig {
  id: string;
  path: string;
  dtype: "q4" | "float16" | "float32";
}

const EMBEDDING_MODEL: ModelConfig = {
  id: "all-MiniLM-L6-v2",
  path: "onnx-community/all-MiniLM-L6-v2",
  dtype: "float16",
};

const LLM_MODEL: ModelConfig = {
  id: "Qwen2.5-Coder-0.5B-Instruct",
  path: "onnx-community/Qwen2.5-Coder-0.5B-Instruct",
  dtype: "q4",
};

export class ModelManager {
  #embeddingPipeline: Pipeline | null = null;
  #llmPipeline: Pipeline | null = null;

  async loadEmbeddingModel(): Promise<Pipeline> {
    if (!this.#embeddingPipeline) {
      // Unload LLM first to free VRAM
      if (this.#llmPipeline) {
        await this.#llmPipeline.dispose();
        this.#llmPipeline = null;
      }
      this.#embeddingPipeline = await pipeline(
        "text-classification",
        EMBEDDING_MODEL.path,
        { dtype: EMBEDDING_MODEL.dtype, device: "webgpu" },
      );
    }
    return this.#embeddingPipeline;
  }

  async loadLLM(): Promise<Pipeline> {
    if (!this.#llmPipeline) {
      // Unload embedding model first to free VRAM
      if (this.#embeddingPipeline) {
        await this.#embeddingPipeline.dispose();
        this.#embeddingPipeline = null;
      }
      this.#llmPipeline = await pipeline("text-generation", LLM_MODEL.path, {
        dtype: LLM_MODEL.dtype,
        device: "webgpu",
      });
    }
    return this.#llmPipeline;
  }

  async disposeAll(): Promise<void> {
    if (this.#embeddingPipeline) {
      await this.#embeddingPipeline.dispose();
      this.#embeddingPipeline = null;
    }
    if (this.#llmPipeline) {
      await this.#llmPipeline.dispose();
      this.#llmPipeline = null;
    }
  }
}
```

**VRAM budget:**

| Scenario                          | Peak VRAM                       | Notes                            |
| --------------------------------- | ------------------------------- | -------------------------------- |
| Both models loaded simultaneously | ~710 MB                         | Risk of `OutOfMemory` on Iris Xe |
| Sequential (unload before load)   | ~360 MB                         | Safe margin on Iris Xe (~2 GB)   |
| Lazy LLM (load on chat open)      | ~350 MB (embed) → ~360 MB (LLM) | Best for idle tabs               |

### Gap 2: Full WebGPU Feature Detection

Probe the GPU adapter and expose a fallback indicator:

```typescript
// utils/webgpu-detector.ts
interface WebGPUFeature {
  hasNavigatorGpu: boolean;
  adapterInfo: GPUAdapterInfo | undefined;
  featureNames: string[];
  hasFloat16: boolean;
  hasBgra8Unorm: boolean;
  maxBufferCount: number;
  recommended: boolean;
}

export async function detectWebGPU(): Promise<WebGPUFeature> {
  const hasNavigatorGpu = "gpu" in navigator;

  if (!hasNavigatorGpu) {
    return {
      hasNavigatorGpu,
      adapterInfo: undefined,
      featureNames: [],
      hasFloat16: false,
      hasBgra8Unorm: false,
      maxBufferCount: 0,
      recommended: false,
    };
  }

  const adapter = await navigator.gpu.requestAdapter();
  const info = adapter?.requestAdapterInfo() ?? {};
  const features = adapter?.enumerateFeatures() ?? [];
  const maxBuffers = adapter?.limits?.maxBufferCount ?? 0;

  return {
    hasNavigatorGpu,
    adapterInfo: info,
    featureNames: features,
    hasFloat16: features.includes("float16"),
    hasBgra8Unorm: features.includes("bgra8unorm"),
    maxBufferCount: maxBuffers,
    recommended: features.includes("float16") && maxBuffers > 100,
  };
}
```

**UI indicator:**

```tsx
// components/WebGpuBadge.tsx
function WebGpuBadge({ feature }: { feature: WebGPUFeature }) {
  if (!feature.hasNavigatorGpu)
    return <Badge color="slate">CPU Fallback</Badge>;
  if (!feature.recommended) return <Badge color="amber">WebGPU (Basic)</Badge>;
  return <Badge color="emerald">WebGPU ({feature.adapterInfo?.device})</Badge>;
}
```

### Gap 3: Cache API for Model Downloads

Cache ONNX model files in the browser's Cache API to avoid re-fetching on cold loads:

```typescript
// utils/model-cache.ts
const CACHE_NAME = "semanticnotes-models-v1";

export async function cacheModel(
  modelPath: string,
  modelFiles: string[],
): Promise<void> {
  const cache = await caches.open(CACHE_NAME);

  for (const file of modelFiles) {
    const url = `https://huggingface.co/${modelPath}/resolve/main/${file}`;
    const response = await fetch(url, { cache: "force-cache" });
    await cache.put(url, response);
  }
}

export async function getCachedModel(
  modelPath: string,
  modelFiles: string[],
): Promise<boolean> {
  const cache = await caches.open(CACHE_NAME);
  for (const file of modelFiles) {
    const url = `https://huggingface.co/${modelPath}/resolve/main/${file}`;
    const response = await cache.match(url);
    if (!response || !response.ok) return false;
  }
  return true;
}

export async function clearModelCache(): Promise<void> {
  const cache = await caches.open(CACHE_NAME);
  await cache.keys().then((requests) => {
    requests.forEach((req) => cache.delete(req));
  });
}
```

**Model download flow:**

```typescript
// workers/model-loader.ts
const EMBEDDING_FILES = ["model.onnx", "config.json", "vocab.json"];
const LLM_FILES = ["model.onnx", "config.json", "tokenizer.json"];

async function loadModelsWithCache(): Promise<void> {
  // Check cache for embedding model
  const hasEmbedding = await getCachedModel(
    "onnx-community/all-MiniLM-L6-v2",
    EMBEDDING_FILES,
  );
  if (!hasEmbedding) {
    await cacheModel("onnx-community/all-MiniLM-L6-v2", EMBEDDING_FILES);
  }

  // Check cache for LLM
  const hasLLM = await getCachedModel(
    "onnx-community/Qwen2.5-Coder-0.5B-Instruct",
    LLM_FILES,
  );
  if (!hasLLM) {
    await cacheModel("onnx-community/Qwen2.5-Coder-0.5B-Instruct", LLM_FILES);
  }
}
```

**Cache performance:**

| Scenario               | Load Time    | Notes                       |
| ---------------------- | ------------ | --------------------------- |
| Cold (no cache, 3G)    | ~15 seconds  | 710 MB / 50 KB/s            |
| Cold (no cache, WiFi)  | ~3 seconds   | 710 MB / 250 KB/s           |
| Warm (Cache API, 3G)   | ~2 seconds   | Cache hit, minimal re-fetch |
| Warm (Cache API, WiFi) | ~0.5 seconds | Near-instant                |

### Gap 4: WebGPU Device Lifecycle Recovery

Listen for `GPUDevice.lost()` and automatically reload the active model:

```typescript
// workers/webgpu-lifecycle.ts
interface DeviceState {
  device: GPUDevice;
  lostReason: string;
  lostMessage: string;
  isLost: boolean;
}

export class WebGPULifecycle {
  #device: GPUDevice | null = null;
  #state: DeviceState = {
    device: null,
    lostReason: "uninitialized",
    lostMessage: "",
    isLost: false,
  };

  async initialize(): Promise<GPUDevice> {
    const adapter = await navigator.gpu.requestAdapter();
    this.#device = await adapter!.requestDevice();
    this.#state.device = this.#device;

    this.#device.loset((info) => {
      this.#state.isLost = true;
      this.#state.lostReason = info.reason;
      this.#state.lostMessage = info.message;
      this.#device = null;
      this.#onDeviceLost();
    });

    return this.#device;
  }

  #onDeviceLost(): void {
    console.warn(
      `WebGPU device lost: ${this.#state.lostReason} — ${this.#state.lostMessage}`,
    );
    // Notify UI to show "WebGPU Reconnecting..."
    broadcastChannel.postMessage({
      type: "GPU_LOST",
      reason: this.#state.lostReason,
    });
  }

  async recover(): Promise<GPUDevice> {
    return this.initialize();
  }

  getState(): DeviceState {
    return this.#state;
  }
}
```

**Recovery flow in the model manager:**

```typescript
// workers/model-manager.ts (extended)
import { WebGPULifecycle } from "./webgpu-lifecycle";

class ModelManager {
  #lifecycle: WebGPULifecycle;

  constructor() {
    this.#lifecycle = new WebGPULifecycle();
  }

  async loadEmbeddingModel(): Promise<Pipeline> {
    // Check if device was lost during tab background
    const state = this.#lifecycle.getState();
    if (state.isLost) {
      await this.disposeAll();
      await this.#lifecycle.recover();
    }
    // ... load model
  }
}
```

**UI recovery indicator:**

```tsx
// components/WebGpuBadge.tsx (extended)
function WebGpuBadge({ state }: { state: DeviceState }) {
  if (state.isLost) {
    return <Badge color="amber">WebGPU Reconnecting...</Badge>;
  }
  return <Badge color="emerald">WebGPU Active</Badge>;
}
```

---

## Trade-offs

| Decision                    | Trade-off                                       |
| --------------------------- | ----------------------------------------------- |
| Sequential model loading    | First-chat latency spike vs. VRAM safety        |
| Full GPU feature detection  | ~50 ms probe overhead vs. silent CPU fallback   |
| Cache API for models        | Requires HTTP-layer caching vs. OPFS complexity |
| `GPUDevice.lost()` recovery | Automatic reload vs. manual `VisibilityChange`  |

---

## Open Questions

1. Should we add a `WebGPU` context benchmark on initial load to determine if the GPU
   can handle the LLM without `OutOfMemory` (e.g., a 384-dim compute pass)?

[Nilay - 11/05/2026] - This is a good idea, call it assessment, and recommend if the user should enable semantic search, llm or simple text search if the webgpu performance is poor.

Assessment will establish, feasibility and user experiance with Semantic Search and LLM Features. The fallback will be text search (BM25 - Keyword Search) over SQLite capabilities.

2. Should we implement a "model swap" UI that lets the user choose between the
   embedding model and the LLM, with explicit "Load LLM" and "Unload LLM" buttons?

[Nilay - 11/05/2026] - Model swap is not in the scope for intial release, but ensure design can support in future. However, allow user to have control over unloading the models to freeup VRAM.

3. Should we use `navigator.gpu.getPreferredCanvas()` to select the optimal GPU for
   multi-GPU laptops (e.g., Intel Iris Xe + NVIDIA RTX)?

[Nilay - 11/05/2026] - Use built in capabilities of browser and only use webgpu and keep underlaying hardware transparent.

---

# Status

# Status

## 11/05/2026

- All recommendations are accepted.
- Open questions are answered.

## References

- [MDN: WebGPU API](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API)
- [Transformers.js GitHub](https://github.com/huggingface/transformers.js)
- [ONNX Runtime WebGPU](https://github.com/microsoft/onnxruntime-web)
- [WebGPU Device Lifecycle](https://www.w3.org/TR/webgpu/#device-lifecycle)
- [Hugging Face Model Cache](https://huggingface.co/docs/transformers.js/cache)
