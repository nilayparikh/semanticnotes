## 🛠️ Locked Technical Stack Specification (React Framework)

| Layer                | Technology                               | Implementation Details                                                                                                                                                           |
| -------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend UI Core     | React + Vite + TypeScript + Tailwind CSS | Component-driven UI. Uses React state and layout boundaries. Multi-column grid interface without server-side layouts.                                                            |
| Database Engine      | wa-sqlite (WASM) + OPFS                  | Persistent text and document storage handled via an isolated background Web Worker. Saves database files directly to the browser's native Origin Private File System [1.1, 1.2]. |
| Vector Engine        | Custom Inline JS Loop                    | Array manipulation loop computing Cosine Similarity math against raw binary Float32Array blobs within the database worker cache.                                                 |
| AI Runtime Engine    | Transformers.js v3                       | Browser-based execution layer powered by ONNX Runtime Web using native browser WebGPU hardware hooks.                                                                            |
| Text Embedding Model | all-MiniLM-L6-v2                         | ONNX configuration running locally. Compresses note strings into 384-dimensional mathematical arrays (~350 MB footprint).                                                        |
| Chat Language Model  | Qwen2.5-Coder-0.5B-Instruct              | 4-bit integer quantized (dtype: 'q4') small language model. Optimized for code and markdown formatting (~360 MB footprint; under 0.8 GB strict limit).                           |
| Execution Sandbox    | HTML5 Web Workers                        | Structural background processing. Offloads database reads and AI token generation to independent threads so React rendering frames never stutter.                                |

Ensure you query and find latest versions of all dependencies, as the JavaScript AI ecosystem is rapidly evolving. Always check for the most recent stable releases and security patches before finalizing your stack.
