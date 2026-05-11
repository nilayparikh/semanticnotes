# UI Layout & Wireframes

## Overview

SemanticNotes.ai uses a 3-column desktop-first layout with a global header. The layout is optimized for developer workflows with a fixed sidebar and fluid editor area.

---

## Layout Structure

```
┌───────────────────────────────────────────────────────────────────────┐
│ Global Header (64px)                                                 │
├─────────────┬──────────────────────────────┬────────────────────────┤
│             │                                │                      │
│ Knowledge   │ AI Markdown Editor           │ Semantic Context     │
│ Base        │                                │                      │
│ (20%)       │ (Fluid, min 500px)           │ (25%)               │
│             │                                │                      │
│ - Search    │ Top: Editor                    │ - AI Insights      │
│ - Note List │ Bottom: Live Preview           │ - Auto-Tags        │
│ - New Note  │ Floating AI Context Bar        │ - Related Notes    │
│             │                                │                    │
│             │                                │ Local AI Q&A       │
│             │                                │ - Chat Interface   │
│             │                                │                    │
│             │                                │ Database Metrics   │
└─────────────┴──────────────────────────────┴────────────────────────┘
```

---

## Global Header

- Height: 64px
- Background: Semi-transparent surface with backdrop blur
- Contains:
  - App logo + name (left)
  - Status badges (center): WebGPU Active, SQLite Connected
  - Settings / Help icons (right)

---

## Left Column: Knowledge Base

- Width: 20% (min 240px, max 320px)
- Glass panel background
- Contains:
  - AI Semantic Search input
  - Note list with icons and timestamps
  - "+ New Note" button at bottom

---

## Center Column: AI Markdown Editor

- Fluid width (min 500px)
- Contains:
  - Editor header with note title and format badge
  - Markdown text editor (top portion)
  - Divider with "Live Preview" label
  - Live Markdown preview (bottom portion)
  - Floating AI Context Bar (glass pill, centered at bottom)

### Floating AI Context Bar

- Positioned: Absolute, bottom 24px, centered
- Width: 75% of editor, max 576px
- Glass panel with AI glow effect
- Contains:
  - Pulsing AI icon + status text
  - Action buttons: "Summarize", "Find Links"

---

## Right Column: Semantic Context

- Width: 25% (min 280px, max 360px)
- Glass panel background
- Contains:
  - AI Insights header
  - Auto-generated tags (pill badges)
  - Semantically related notes with similarity scores
  - Local AI Q&A chat interface
  - Database vector metrics

---

## Status Indicators

| Status           | Color               | Usage               |
| ---------------- | ------------------- | ------------------- |
| WebGPU Active    | Secondary (Emerald) | GPU inference ready |
| SQLite Connected | Primary (Cyan)      | Database status     |
| Model Loaded     | Secondary dot       | Chat model ready    |
