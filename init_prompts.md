## 📋 Prompt 1: Context Analysis & Gap Discovery

```
# Role & Context

You are an expert Principal AI Software Architect. We are building a local-first, privacy-focused Markdown workspace running entirely inside a browser client. It uses a WASM SQLite wrapper over OPFS for data storage, a local web worker for WebGPU text embeddings, and a 4-bit quantized local Small Language Model (SLM) for a context-aware chat interface.

# Task: Phase 1 (Analysis & Identification)

Read and thoroughly evaluate our application concepts. Do not generate configuration files or source code yet. Your goal is to identify missing architectural elements, structural edge cases, or potential browser-based runtime conflicts.

# Current Architectural Surface

1. UI Layer: A multi-column dark-themed workspace layout containing a note list, a Markdown text editor with an active preview split, and an AI insights side panel with a chat module.
2. Database Layer: A background Web Worker routing persistent records to the browser's Origin Private File System (OPFS). It stores raw text and vector embedding blobs, computing cosine similarity via an internal JavaScript loop.
3. Embedding Engine: A local web worker loading a tiny text embedding model via WebGPU, triggering on an editor keystroke debounce.
4. LLM Chat Layer: A WebGPU-accelerated text-generation worker using an ultra-lightweight text-generation model. Contextual notes are extracted via similarity scores and injected dynamically into a local system prompt context wrapper.

# Response Requirements

Analyze this configuration and output:

1. A categorized list of any technical or execution gaps (e.g., initial storage locks, multi-tab database concurrency management, WebGPU VRAM out-of-memory safety boundaries, or handling documents that exceed model context windows).
2. Five highly specific discovery questions regarding fallback actions, performance limits, and system behavior that I need to clarify before we move to Phase 2.
```

---

## 📋 Prompt 2: Metadata Authoring & Phased Planning

```
# Task: Phase 2 (Repository Blueprint Initialization)
Now that our architectural constraints are locked in, you must generate the complete repository configuration layout. Let the system decide the optimal directory paths and structural formatting, but you must author the complete text configurations for the following four foundational components:

1. Global Copilot AI Behavioral Instructions: Define global behavior profiles instructing all AI extensions to act strictly as front-end specialists. Explicitly ban server-side dependencies (Node.js, Express, cloud vector databases) and enforce strict background worker isolation protocols for data operations and AI execution loops.
2. Structured Agent Execution Plan: Define a step-by-step phased development plan mapping objectives, technical milestones, and target deliverables. Outline clear automated evaluation checkpoints for moving from data layer setup to the interface integration.
3. Headless Schema Checker Skill: Create an automated bash shell script with non-interactive metadata tags that scans the project directory to verify that the database table layouts match our configuration parameters.
4. Headless Model Footprint Verifier Skill: Create an automated bash script with non-interactive metadata tags that checks the codebase to ensure model sizes and quantization types stay within our strict local memory footprint constraints.

# Constraints
Do not output placeholders or brief examples. Provide the exact, production-ready configuration text blocks ready to write directly to disk.
```

---

## 📋 Prompt 3: Context Consolidation & Technical Documentation

```
# Task: Phase 3 (Context Consolidation & Technical Documentation)
To provide our headless coding agent with deep contextual awareness of our application layout, you must generate our core system engineering references. Determine the optimal file structure and write the complete, production-ready content for two primary internal manuals:

1. Technical Infrastructure Guide: Detail our isolated threading model dividing the UI View, the SQLite Data Worker, and the WebGPU Inference Worker. Describe exactly how data is shuttled between these environments using non-blocking asynchronous message passing pipelines.
2. Data & Vector Storage Blueprint: Document our complete database storage engine design. Define the schemas for our relational layers and vector binary blobs. Detail the complete mathematical matrix logic for our custom internal cosine similarity calculation loop, explaining how it scores local text documents against user query inputs.

# Execution Context
Write this technical documentation clearly and comprehensively. The downstream coding agent will read these files directly to write our features while staying within our exact design boundaries.
```

---

## 📋 Prompt 4: Headless Unattended Execution

```
# Task: Phase 4 (Headless Unattended Code Generation Execution)
You are now ready to build the complete, operational codebase for our local-first AI markdown application. You must operate completely headlessly—do not ask for interactive confirmation or pause for human feedback during this generation loop.

# Instructions
Read your global system parameters, follow the phases outlined in your agent development plan, and reference the exact technical stack rules written under your system documentation guides.

Analyze the entire workspace context and generate the complete source code for the following functional layers:
1. The Database Layer Worker: Initialize the SQLite WASM framework over OPFS, handling table setup, indexing, and the custom cosine similarity loop.
2. The WebGPU AI Worker: Initialize the inference pipeline to generate text embeddings and stream chat tokens from our quantized local text generation model.
3. The UI Controller & Main View: Build the responsive layout, state progress indicators, text areas, and chat layouts.

Ensure all package installation syntax usage and initialization scripts support an automated, unattended workspace execution loop.
```

---
