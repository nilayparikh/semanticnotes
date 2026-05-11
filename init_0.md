## Functional & Technical Specifications: SemanticNotes AI

---

## 1. Executive Summary & Design System

## 1.1 Project Objective

SemanticNotes AI is a privacy-first, local-only Markdown workspace. It operates strictly inside the browser client. It uses WebGPU for on-device embedding and LLM execution, paired with SQLite WASM for hybrid relational-vector storage. The system requires zero external API keys or server-side compute.

## 1.2 Design System

The user interface follows a clean, modern aesthetic with a focus on usability and clarity. Mocks are avaliable at `Y:\.sources\showcases\semanticnotes.ai\mock` and should be referenced for visual guidance.

The design.md file is at `Y:\.sources\showcases\semanticnotes.ai\mock\DESIGN.md`

## 2. Component Layout & Structural Specification

## 2.1 Global Header Area

- App Logo: Text identifier SemanticNotes AI aligned to the top left.
- Status Badges Container: Displays two active execution chips in the center-right.
- WebGPU Status Badge: Emits solid green (#10B981) text reading ● WebGPU Active upon verification of hardware acceleration access via navigator.gpu.
  - SQLite Status Badge: Emits slate-cyan border container displaying real-time operational file constraints (e.g., 💾 SQLite Connected: 24MB).
- Control Icons: Utility tray aligned to the top-right containing Workspace Settings and Documentation links.

## 2.2 Column 1: Document Tree & Navigation (Width: 20%)

- Semantic Search Bar: Native inline input field labeled 🔍 AI Semantic Search.... Listens to keystroke triggers to calculate search string embeddings.
- Note Hierarchy Tree: Active tracking element displaying a vertical list of documents.
- Active State: High-contrast highlight container detailing note title, accompanied by a dynamic relative timestamp indicator (e.g., Just now).
  - Inactive State: Medium-grey typography displaying secondary note objects (e.g., SQLite WASM Setup, Groceries List).
- Creation Action: Sticky absolute-positioned button anchored to the bottom-left boundary. Set in flat Cyan color text labeled + NEW NOTE.

## 2.3 Column 2: Dual-Pane Context Editor (Width: 55%)

- Active Document Header: Flat high-contrast label displaying the title text string (e.g., Project Ideas for 2026). Includes a toggled preview badge flag labeled Markdown.
- Pane A: Code Input Editor: Borderless textarea workspace wrapped in uniform padding. Displays raw syntax markup elements (#, ##, -, \*\*).
- Horizontal Workspace Divider: Thin separation banner labeled LIVE PREVIEW.
- Pane B: Rendered Layout Container: Automatically reads data string outputs from the raw input buffer, processing raw strings into structured DOM elements using standard formatting rules (headers, tables, paragraph dividers).
- Inline Intelligence Toolbar: Sticky menu element overlaying the base of the layout container. Contains two operation nodes:
- Status Message: Pulsing loading animation labeled ✨ AI is analyzing context....
  - Execution Controls: Dual button set labeled Summarize and Find Links.

## 2.4 Column 3: Local AI Insights Pane (Width: 25%)

- Panel Title: Icon accompanied by heading Local AI Insights.
- Module A (Auto-Tags Box): Dedicated layout container automatically filtering and appending metadata identifiers extracted via SQL queries (e.g., #webgpu, #sqlite, #ai).
- Module B (Semantic Proximity Box): Target array list populated via vector math comparisons. Displays close-match document records mapped with corresponding mathematical compliance percentages (e.g., SQLite WASM Setup | 94%, OPFS Caching Strategy | 82%).
- Module C (Local AI Q&A Container): Independent dialogue box component managing interactive user engagement.
- Configuration Selector: Interactive drop-down selector containing choice values for local models (Qwen 2.5 0.5B (Active)).
  - Task Progress Track: Metric loading percentage reading 100% Progress.
  - Chat Thread Stack: Dual block layout cleanly dividing user requests (What are my project ideas for 2026?) from localized model responses.
  - Input Prompt Box: Form input field labeled Ask anything about your notes... alongside an execution arrow.
- Module D (Database Vector Metrics Box): Lower metadata panel mapping internal operations pipeline records:
- Embed Time: Numerical performance tracker in milliseconds (42ms).
  - SQL Query Time: System compute performance tracker (3ms).
  - Total Vectors: Dynamic ledger summation count (1,482).

---

## 3. Storage & Native Compute Engine Specifications## 3.1 SQLite WASM Data Layer

All read and write events run inside a background Web Worker process leveraging the Origin Private File System (OPFS) for persistent, low-latency disk storage.

- Relational Storage Functions: Handles storage of raw Markdown note files, title objects, timestamps, and unstructured text blocks.
- Array Matching Vectors: Custom application routine matching rows with compiled vector calculations using mathematical calculation processes.

## 3.2 WebGPU AI Embedding Pipeline

- Operational Execution Model: Small footprint Text Embedding Model (e.g., all-MiniLM-L6-v2 or BGE-Micro).
- Execution Behavior: Monitors character modifications inside the workspace input editor via a 1000ms debounce loop. On pause, it transforms string blocks into multi-dimensional float arrays and updates the database record.

## 3.3 WebGPU Small Language Model (LLM) Pipeline

- Model Constraints: Supports local parameter models built underneath the < 0.8GB deployment footprint limit (e.g., Qwen 2.5 0.5B Instruct Quantized 4-Bit).
- Execution Engine: Compiles and streams text output inside the Chat Panel via WebGPU threads, parsing and rendering formatting instructions in real time.

---

## 4. Lifecycle Data Flows## 4.1 System Startup Lifecycle

[User Loads Page]
│
├──> [Check navigator.gpu] ──> SUCCESS ──> Initialize WebGPU Engine
│
└──> [Mount SQLite WASM] ────> OPFS Hook ──> Verify Vector Data Integrity

## 4.2 Document Sync & Vector Generation Loop

[User Types Text]
│
└──> (Debounce 1000ms) ──> [Save Text to SQLite]
│
└──> [Send Text to WebGPU Worker]
│
└──> [Save Vector Array to DB]

## 4.3 Chat Request Integration (Retrieval-Augmented Generation)

[User Submits Question]
│
├──> [Generate Question Vector]
│ │
│ └──> [Query Top Similar Notes via SQL Vector Loop]
│ │
│ └──> [Combine Text Context + Question]
│ │
│ └──> [Stream LLM Output to Screen]
