# Non-Functional Spec: Technical Constraints & Stack

## Overview

This document defines the locked technical stack, performance budgets, and non-functional constraints for SemanticNotes AI.

## 1. Locked Technology Stack

| Layer           | Technology                               | Constraints                                                      |
| --------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| UI              | React + Vite + TypeScript + Tailwind CSS | No server-side dependencies (Node.js, Express, cloud vector DBs) |
| Database        | wa-sqlite (WASM) + OPFS                  | Isolated background Web Worker only                              |
| Vector Engine   | Custom JavaScript cosine similarity loop | No external vector DB extensions                                 |
| AI Runtime      | Transformers.js v3 + ONNX Runtime Web    | WebGPU acceleration required                                     |
| Embedding Model | all-MiniLM-L6-v2                         | 384-dim, ~350 MB, ONNX                                           |
| Chat Model      | Qwen2.5-Coder-0.5B-Instruct              | 4-bit quantized, ~360 MB, < 0.8 GB total                         |
| Workers         | HTML5 Web Workers                        | Background isolation, no main-thread blocking                    |

## 2. Performance Budgets

| Metric                                     | Target                      |
| ------------------------------------------ | --------------------------- |
| Total model footprint                      | < 0.8 GB                    |
| Cold start (3G)                            | ~15 seconds (710 MB models) |
| Warm start (Cache API)                     | ~2 seconds                  |
| Embedding compute (256-token chunk)        | ~50ms on WebGPU             |
| Cosine similarity (1,000 notes × 384 dims) | ~8ms                        |
| LLM token generation                       | ~12 tokens/sec              |
| Peak VRAM (sequential loading)             | ~360 MB                     |
| SQLite DB (100 notes)                      | ~200 KB                     |
| Vector store (100 notes × 384 dims)        | ~150 KB                     |

## 3. Security Constraints

- **Local-first**: Zero external API keys required.
- **OPFS-backed storage**: All data persists in the browser's Origin Private File System.
- **Background worker isolation**: Database and AI execution run in isolated Web Workers.
- **Model consent**: Models download with explicit user consent and are cached persistently.

## 4. Browser Support

The application requires:

- Chrome 114+, Firefox 125+, Safari 15.4+, Edge 114+
- WebGPU, OPFS, Web Locks API, SharedArrayBuffer, Cache API

## References

- [System Overview](../architecture/01_system-overview.md)
- [Architecture Index](../architecture/00_index.md)
