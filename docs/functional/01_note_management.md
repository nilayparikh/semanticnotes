# Functional Spec: Note Management

## Overview

SemanticNotes AI provides a local-first Markdown note management system. Notes are stored in wa-sqlite over OPFS and rendered in a dual-pane editor with live Markdown preview.

## Features

### 1.1 Note Creation

- User can create a new note via the "+ NEW NOTE" button anchored at the bottom of the sidebar.
- Each note gets a unique ID, title, content, and `updated_at` timestamp.
- Notes are persisted to the `notes` table in the SQLite database.

### 1.2 Note Editing

- The main editor pane provides a borderless textarea for raw Markdown input.
- A live preview pane renders the Markdown into structured DOM elements (headers, tables, paragraphs).
- Changes are saved to SQLite on a 1000ms debounce interval.

### 1.3 Note Listing

- The sidebar displays a hierarchical list of notes.
- The active note is highlighted with a high-contrast container and a relative timestamp indicator (e.g., "Just now").
- Inactive notes use medium-grey typography.

### 1.4 Note Metadata

- Each note stores: `id`, `title`, `content`, `updated_at`.
- Auto-generated tags are extracted via SQL queries and displayed in the AI Insights panel (e.g., `#webgpu`, `#sqlite`, `#ai`).

## Data Model

```sql
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  updated_at DATETIME DEFAULT (datetime('now'))
);
```

## References

- [Storage Layer Spec](../architecture/02_storage_layer_spec.md)
- [UI State Management Spec](../architecture/07_ui_state_management_spec.md)
