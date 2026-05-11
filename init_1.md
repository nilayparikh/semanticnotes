## Technical Specifications V1.0: SemanticNotes AI

---

## 1. Concrete Core Technology Stack

This application runs strictly on-device inside a web browser client. The specific architectural frameworks, libraries, and models have been locked to guarantee maximum compatibility, fast load times, and a low memory footprint.

```
     [ BROWSER UI LAYER ]
   (Vite + TypeScript + Tailwind)
           /            \
          /              \
         v                v
  [ SQLITE WASM WORKER ] [ WEBGPU TRANS-WORKER ]
  (wa-sqlite + libsql)    (Transformers.js v3)
  - Text metadata Rows    - Embedding Pipeline
  - Float Vector Blobs    - Qwen 2.5 Coder 0.5B
```

- Text metadata Rows - Embedding Pipeline
- Float Vector Blobs - Qwen 2.5 Coder 0.5B

## 1.1 Locked Technology Selections

- Database Engine: wa-sqlite (WASM compilation) coupled with the Origin Private File System (OPFS) storage driver for persistence.
- AI Inference Runtime Engine: Transformers.js v3 powered by ONNX Runtime Web (onnxruntime-web) with native WebGPU acceleration execution flags.
- UI Construction Library: Vite + Vanilla TypeScript wrapped with Tailwind CSS for layouts. No heavy client-side structural dependencies are allowed.

---

## 2. Definitive Database Engine & Vector Storage

Rather than using complex external setups or cloud connections, the application uses a unified relational-vector implementation inside a standalone SQLite WASM Web Worker.

## 2.1 Complete Production Schema

The database uses two tables linked together by a standard Foreign Key relationship. Vector data is saved inside an optimized binary storage format. System Indexes for rapid list updates and text matchingCREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);

## 2.2 Inline Vector Array Mathematical Comparison Routine

Because standard browser-based SQLite WASM builds do not bundle complex vector extensions out of the box, matching computations run using an optimized JavaScript math loop directly within the database web worker cache:

---

## 3. Finalized On-Device AI Models

To fit into the tight under 0.8GB footprint constraints while delivering accurate local search capabilities and chat parsing, the application uses two specialized models from the Hugging Face ONNX Community library.

+-------------------------------------------------------------------------+

| DOWNLOAD OVERHEAD (TOTAL APP footprint: ~710 MB) |
| |
| [████████████████] Embedding: all-MiniLM-L6-v2 (ONNX) ~350 MB |
| [██████████████████] LLM: Qwen2.5-Coder-0.5B-Instruct (Q4) ~360 MB |
+-------------------------------------------------------------------------+

## 3.1 Text Embedding Model Selection

- Model ID: onnx-community/all-MiniLM-L6-v2
- Dimensions: 384 dimensions
- File Footprint on Disk: ~350 MB
- Purpose: Converts notes and search strings into vector matrices for real-time similarity calculations.

## 3.2 Chat & Q&A Large Language Model Selection

- Model ID: onnx-community/Qwen2.5-Coder-0.5B-Instruct
- Quantization Class: 4-bit integer weights (dtype: 'q4')
- File Footprint on Disk: ~360 MB
- Purpose: Feeds relevant context notes into a local chat thread to provide markdown analysis, content summarization, and direct Q&A interaction.

---

## 4. Complete Application Lifecycles## 4.1 Automated Content Indexing Workflow

```
[User Keystroke Input]
│
├──> (Wait for 1000ms debounce safety threshold)
│
├──> [Write text directly into SQLite 'notes' table via Worker]
│
├──> [Forward text chunk to WebGPU Worker via postMessage()]
│ │
│ └──> Compute 384-dimensional vector embedding
│
└──> [Write resulting Float32Array blob into 'note_embeddings' table]
```

## 4.2 Local Context Extraction Chat Workflow (RAG)

```
[User Presses Send on Chat UI Input]
│
├──> Generate vector embedding for user question string via WebGPU Worker
│
├──> [Run database worker query to pull all saved document vectors]
│ │
│ └──> Match vectors using computeCosineSimilarity() loop
│
├──> Isolate the top 2 highest scoring text context chunks
│
├──> Construct prompt combining the context notes and the question
│
└──> Stream token outputs directly from Qwen2.5-Coder into Chat Window
```

Ensure the models download at user's concent and stored persistently in OPFS for future sessions.
