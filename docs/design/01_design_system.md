# SemanticNotes.ai Design System

## Overview

SemanticNotes.ai uses a developer-centric design system engineered for high-performance cognition. The aesthetic is **Glassmorphism** — depth through transparency, smoked glass layers, and bioluminescent accent glows.

---

## Color Palette

### Background

| Token           | Value     |
| --------------- | --------- |
| Base Background | `#0A0A0A` |
| Surface         | `#131313` |

### Glass Panels

| Token                       | Value     |
| --------------------------- | --------- |
| Surface Container (Lowest)  | `#0E0E0E` |
| Surface Container (Low)     | `#1C1B1B` |
| Surface Container           | `#201F1F` |
| Surface Container (High)    | `#2A2A2A` |
| Surface Container (Highest) | `#353534` |

### Accents

| Token               | Value      | Usage              |
| ------------------- | ---------- | ------------------ |
| Surface Tint        | `#00DBE9`  | Primary glow       |
| Primary             | `#DBFCFF`  | Primary action     |
| Primary Container   | `#00F0FF`  | Active states      |
| Primary Fixed       | `#7DF4FF`  | Fixed UI elements  |
| Primary Fixed Dim   | `#00DBE9`  | Dimmed primary     |
| Secondary           | `#4ED EA3` | Success / active   |
| Secondary Container | `#00A572`  | Secondary surfaces |
| Tertiary            | `#F3F6FF`  | Tertiary accents   |
| Error               | `#FFB4AB`  | Error states       |

### Text

| Token              | Value     |
| ------------------ | --------- |
| On Surface         | `#E5E2E1` |
| On Surface Variant | `#B9CACB` |
| Outline            | `#849495` |
| Outline Variant    | `#3B494B` |

---

## Typography

### Font Families

| Role              | Font               | Usage                         |
| ----------------- | ------------------ | ----------------------------- |
| UI & Navigation   | **Geist**          | Menus, headers, buttons       |
| Editor & Metadata | **JetBrains Mono** | Editor text, tags, timestamps |

### Type Scale

| Token         | Size | Weight | Line Height | Letter Spacing |
| ------------- | ---- | ------ | ----------- | -------------- |
| `display-lg`  | 48px | 700    | 1.1         | -0.04em        |
| `headline-md` | 24px | 600    | 1.3         | -0.02em        |
| `body-base`   | 16px | 400    | 1.6         | 0em            |
| `code-editor` | 14px | 450    | 1.7         | 0em            |
| `label-caps`  | 11px | 600    | 1.2         | 0.1em          |
| `status-pill` | 12px | 500    | 1.0         | 0.02em         |

---

## Spacing & Layout

### Grid

- **Unit**: 4px base increment
- **Gutter**: 16px
- **Margin (Desktop)**: 32px
- **Sidebar Width**: 260px

### Layout Model

- **Fixed-Fluid Hybrid**: Sidebar panels are fixed-width; central editor is fluid.
- **3-Column Desktop**: Knowledge Base (left) → Editor (center) → Semantic Context (right).
- **Primary Editor**: Single-column centered container, max-width 800px.

---

## Elevation & Depth

Depth is communicated through backdrop blur and border luminance rather than shadows.

| Level            | Description      | Blur      | Border                |
| ---------------- | ---------------- | --------- | --------------------- |
| Level 0 (Base)   | Matte background | —         | `#0A0A0A`             |
| Level 1 (Panels) | Glass panels     | 20px blur | 1px solid `#FFFFFF10` |
| Level 2 (Modals) | Popovers         | 40px blur | 1px solid `#FFFFFF20` |
| Active State     | Inner glow       | —         | Cyan at 15% opacity   |

---

## Shapes

| Token     | Value    | Usage                  |
| --------- | -------- | ---------------------- |
| `sm`      | 0.125rem | Small components       |
| `DEFAULT` | 0.25rem  | Buttons, cards         |
| `md`      | 0.375rem | Medium components      |
| `lg`      | 0.5rem   | Large panels           |
| `xl`      | 0.75rem  | Extra large containers |
| `full`    | 9999px   | Status pills, badges   |

---

## Component Library

### Buttons

- Ghost-style by default with 1px borders
- Primary: Solid cyan fill with dark text
- Hover: Increased border opacity

### Pill Badges

- Fully rounded (999px radius)
- 4px solid status dot + text
- Used for: Active, Draft, Syncing

### Input Fields

- Borderless within glass panels
- 1px bottom-border on focus
- Soft cyan glow on focus

### Cards

- Frosted glass surfaces
- 1px `#FFFFFF10` border
- No shadows

### AI Context Bar

- Floating glass pill at editor bottom
- Persistent cyan outer glow
- Indicates AI "listening" or "processing"

### Lists

- No horizontal separators
- Hover: 5% white background fill, full-width

---

## CSS Utilities

```css
.glass-panel {
  background-color: rgba(28, 27, 27, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ai-glow {
  box-shadow: 0 0 15px rgba(0, 219, 233, 0.15);
}
```
