# Functional Spec: AI Chat (RAG)

## Overview

SemanticNotes AI provides a local chat interface powered by a quantized Small Language Model (SLM). Chat uses Retrieval-Augmented Generation (RAG) to inject contextually relevant notes into the model's system prompt.

## Features

### 3.1 Chat Interface

- The AI Insights panel (Column 3) contains a chat module with:
  - Model selector dropdown (e.g., "Qwen 2.5 0.5B (Active)")
  - Chat thread stack displaying user questions and model responses
  - Input prompt box labeled "Ask anything about your notes..."
  - Progress indicator showing task completion percentage

### 3.2 RAG Pipeline

When a user submits a question:

1. The query string is embedded into a 384-dimensional vector via WebGPU.
2. The database worker retrieves all stored note vectors.
3. Cosine similarity scores are computed to rank notes by relevance.
4. The top 2 most similar notes are extracted.
5. A system prompt is constructed combining the context notes and the user's question.
6. The LLM streams tokens to the chat interface in real time.

### 3.3 Model Constraints

- Model: `Qwen2.5-Coder-0.5B-Instruct` (4-bit quantized, ~360 MB)
- Context window: 2,048 tokens
- Total model footprint: < 0.8 GB (both models combined)
- Models are loaded sequentially to minimize VRAM usage

### 3.4 Model Loading Control

- Models are downloaded with user consent and stored persistently in OPFS.
- Users can unload models to free VRAM.
- The system tracks model loading states (embedding, LLM) independently.

## References

- [Context Window Spec](../architecture/05_context_window_spec.md)
- [Model Runtime Spec](../architecture/03_model_runtime_spec.md)
- [Embedding Pipeline Spec](../architecture/04_embedding_pipeline_spec.md)
