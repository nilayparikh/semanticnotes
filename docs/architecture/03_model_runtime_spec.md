# Model Runtime Specification

## 1. Overview

The model runtime manages two ONNX models via **Transformers.js v3** with **WebGPU** acceleration. Models are loaded sequentially to minimize VRAM pressure, cached via the Cache API, and recovered automatically on WebGPU device lifecycle events.

## 2. Model Inventory

| Model                       | Dimensions    | Footprint   | Purpose             | Dtype   |
| --------------------------- | ------------- | ----------- | ------------------- | ------- |
| all-MiniLM-L6-v2            | 384           | ~350 MB     | Semantic embeddings | float16 |
| Qwen2.5-Coder-0.5B-Instruct | 2,048 context | ~360 MB     | Local Q&A chat      | q4      |
| **Total**                   |               | **~710 MB** |                     |         |

## 3. Model Loading Strategy

### 3.1 Sequential Loading

Models are loaded one at a time. The active model is `dispose()`d before loading the next, ensuring peak VRAM never exceeds the larger single model.

```typescript
export class ModelManager {
  #embeddingPipeline: Pipeline | null = null;
  #llmPipeline: Pipeline | null = null;

  async loadEmbeddingModel(): Promise<Pipeline> {
    if (!this.#embeddingPipeline) {
      if (this.#llmPipeline) {
        await this.#llmPipeline.dispose();
        this.#llmPipeline = null;
      }
      this.#embeddingPipeline = await pipeline(
        "text-classification",
        "onnx-community/all-MiniLM-L6-v2",
        { dtype: "float16", device: "webgpu" },
      );
    }
    return this.#embeddingPipeline;
  }

  async loadLLM(): Promise<Pipeline> {
    if (!this.#llmPipeline) {
      if (this.#embeddingPipeline) {
        await this.#embeddingPipeline.dispose();
        this.#embeddingPipeline = null;
      }
      this.#llmPipeline = await pipeline(
        "text-generation",
        "onnx-community/Qwen2.5-Coder-0.5B-Instruct",
        { dtype: "q4", device: "webgpu" },
      );
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

### 3.2 VRAM Budget

| Scenario                        | Peak VRAM         | Notes                          |
| ------------------------------- | ----------------- | ------------------------------ |
| Both loaded simultaneously      | ~710 MB           | Risk of OutOfMemory on Iris Xe |
| Sequential (unload before load) | ~360 MB           | Safe margin on Iris Xe (~2 GB) |
| Lazy LLM (load on chat open)    | ~350 MB → ~360 MB | Best for idle tabs             |

## 4. WebGPU Feature Detection

```typescript
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

## 5. Capability Assessment

### 5.1 Assessment Flow

The assessment determines user's GPU capability and recommends feature availability:

```typescript
interface AssessmentResult {
  score: number; // 0-100
  recommendedFeatures: FeatureSet;
  fallback: "semantic" | "keyword" | "text";
}

interface FeatureSet {
  semanticSearch: boolean;
  llmChat: boolean;
  bm25Fallback: boolean;
}
```

### 5.2 Assessment Criteria

| Score Range | GPU Capability                     | Recommended Features                 |
| ----------- | ---------------------------------- | ------------------------------------ |
| 0-30        | Basic (integrated, <1 GB VRAM)     | BM25 keyword search only             |
| 31-60       | Moderate (integrated, 1-2 GB VRAM) | Semantic search, optional LLM        |
| 61-80       | Good (dedicated, 2-4 GB VRAM)      | Full semantic search + LLM           |
| 81-100      | Excellent (dedicated, 4+ GB VRAM)  | All features, high-frequency updates |

### 5.3 Fallback: BM25 Keyword Search

When WebGPU performance is insufficient, fall back to SQLite FTS5 for BM25 keyword search:

```sql
CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
  title, content,
  content = 'notes',
  content_rowid = 'id'
);
```

## 6. Model Cache

```typescript
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
```

### 6.1 Cache Performance

| Scenario               | Load Time    | Notes             |
| ---------------------- | ------------ | ----------------- |
| Cold (no cache, 3G)    | ~15 seconds  | 710 MB / 50 KB/s  |
| Cold (no cache, WiFi)  | ~3 seconds   | 710 MB / 250 KB/s |
| Warm (Cache API, 3G)   | ~2 seconds   | Cache hit         |
| Warm (Cache API, WiFi) | ~0.5 seconds | Near-instant      |

## 7. WebGPU Device Lifecycle

```typescript
interface DeviceState {
  device: GPUDevice | null;
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

    this.#device.lost += (info) => {
      this.#state.isLost = true;
      this.#state.lostReason = info.reason;
      this.#state.lostMessage = info.message;
      this.#device = null;
      this.#onDeviceLost();
    };

    return this.#device;
  }

  #onDeviceLost(): void {
    console.warn(
      `WebGPU device lost: ${this.#state.lostReason} — ${this.#state.lostMessage}`,
    );
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

## 8. Model Unload Control

User-facing control to unload models and free VRAM:

```typescript
interface ModelControl {
  isEmbeddingLoaded: boolean;
  isLLMLoaded: boolean;
  unloadEmbedding: () => Promise<void>;
  unloadLLM: () => Promise<void>;
  unloadAll: () => Promise<void>;
}
```

## 9. Error Handling

| Error                | Recovery                 |
| -------------------- | ------------------------ |
| OutOfMemory          | Unload one model, retry  |
| GPUDevice.lost()     | Auto-recover with reload |
| Model download fail  | Cache API fallback       |
| WebGPU not supported | CPU fallback indicator   |

## 10. References

- ADR-002: WebGPU & Model Runtime Strategy
- [Transformers.js GitHub](https://github.com/huggingface/transformers.js)
- [ONNX Runtime WebGPU](https://github.com/microsoft/onnxruntime-web)
- [WebGPU Device Lifecycle](https://www.w3.org/TR/webgpu/#device-lifecycle)
