# SemanticNotes AI

> A local-first, privacy-focused Markdown workspace running entirely inside the browser.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue)](#license)
[![WebGPU](https://img.shields.io/badge/Runtime-WebGPU-10B981)](#)
[![SQLite WASM](https://img.shields.io/badge/Storage-SQLite%20WASM-00F0FF)](#)
[![Embeddings](https://img.shields.io/badge/Model-all--MiniLM--L6--v2-purple)](#)

## Overview

SemanticNotes AI is a client-side Markdown workspace that combines:

- **SQLite WASM** over OPFS for persistent, low-latency document storage
- **WebGPU-accelerated text embeddings** for semantic search across notes
- **Local 4-bit quantized LLM** for context-aware Q&A over your documents

Zero external API keys. Zero server-side compute. Everything runs on-device.

## Architecture

```
     [ BROWSER UI LAYER ]
   (Vite + TypeScript + Tailwind)
           /            \
          /              \
         v                v
  [ SQLITE WASM WORKER ] [ WEBGPU TRANS-WORKER ]
  (wa-sqlite + OPFS)     (Transformers.js v3)
  - Text metadata Rows    - Embedding Pipeline
  - Float Vector Blobs    - Qwen 2.5 Coder 0.5B
```

## Key Features

- **Multi-column workspace layout** with document tree, dual-pane editor, and AI insights panel
- **Semantic search** powered by 384-dim vector embeddings computed on every keystroke
- **Context-aware local chat** using retrieval-augmented generation (RAG) over your notes
- **Real-time AI analysis** with auto-tags, semantic proximity scoring, and inline intelligence
- **Glassmorphic dark theme** optimized for developer workflows

## Tech Stack

| Layer           | Technology                               |
| --------------- | ---------------------------------------- |
| UI              | React + Vite + TypeScript + Tailwind CSS |
| Database        | wa-sqlite (WASM) + OPFS                  |
| Vector Engine   | Custom JS Cosine Similarity Loop         |
| AI Runtime      | Transformers.js v3 (ONNX Runtime WebGPU) |
| Embedding Model | all-MiniLM-L6-v2 (~350 MB)               |
| Chat Model      | Qwen2.5-Coder-0.5B-Instruct Q4 (~360 MB) |

## Project Structure

```
├── docs/              # Technical documentation
├── mock/              # Design system and visual mocks
├── public/            # Static assets
├── src/               # Application source code
│   ├── components/    # React UI components
│   ├── workers/       # Web Workers (SQLite, WebGPU)
│   ├── models/        # ONNX model configurations
│   ├── utils/         # Shared utilities
│   └── types/         # TypeScript type definitions
├── .github/            # Copilot instructions & agent skills
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite build configuration
```

## Getting Started

### Prerequisites

- Modern browser with **WebGPU** support (Chrome 114+, Edge 114+, Firefox 125+)
- Node.js 18+ and pnpm/npm
- GPU with at least **2 GB VRAM** for comfortable dual-model execution

### Installation

```bash
# Clone the repository
git clone https://github.com/<username>/semanticnotes-ai.git
cd semanticnotes-ai

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open `http://localhost:5173` in your browser and begin taking notes.

## Model Footprint

| Model                            | Dimensions    | Footprint   | Purpose             |
| -------------------------------- | ------------- | ----------- | ------------------- |
| all-MiniLM-L6-v2                 | 384           | ~350 MB     | Semantic embeddings |
| Qwen2.5-Coder-0.5B-Instruct (Q4) | 2,048 context | ~360 MB     | Local Q&A chat      |
| **Total**                        |               | **~710 MB** |                     |

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.
