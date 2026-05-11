# Functional Spec: UI Layout & Status Indicators

## Overview

SemanticNotes AI provides a 3-column desktop-first layout with real-time status indicators for system components (WebGPU, SQLite, Workers).

## Features

### 4.1 Global Header

- App logo ("SemanticNotes AI") aligned top-left.
- Status badges in center-right:
  - WebGPU Status: Green indicator ("● WebGPU Active") when `navigator.gpu` is available.
  - SQLite Status: Cyan border indicator showing real-time file size (e.g., "💾 SQLite Connected: 24MB").
- Control icons top-right: Workspace Settings and Documentation links.

### 4.2 3-Column Layout

The application uses a CSS Grid layout with three columns:

| Column       | Width | Content                          |
| ------------ | ----- | -------------------------------- |
| 1 (Sidebar)  | 20%   | Document tree, search, note list |
| 2 (Editor)   | 55%   | Markdown editor, live preview    |
| 3 (Insights) | 25%   | AI insights, chat, metrics       |

### 4.3 Loading Overlay

- A blocking overlay displays during system initialization.
- Shows component states: WebGPU, SQLite, Embedding Worker, LLM Worker.
- Each component transitions through: `idle` → `loading` → `ready` / `error`.
- A retry button appears if any component reports an error.

### 4.4 Performance Metrics Display

The AI Insights panel displays real-time metrics:

- Embed Time: Milliseconds for vector computation (e.g., 42ms).
- SQL Query Time: Database query duration (e.g., 3ms).
- Total Vectors: Count of stored embedding vectors (e.g., 1,482).

### 4.5 Glassmorphic Theme

- Dark theme with glass-card styling: `rgba(30, 30, 42, 0.6)` background, 12px backdrop blur.
- Card hover effects: 2px vertical translation, 32px box-shadow.
- 12px border radius, 16px internal padding.

## References

- [UI State Management Spec](../architecture/07_ui_state_management_spec.md)
- [Worker Threading Spec](../architecture/06_worker_threading_spec.md)
