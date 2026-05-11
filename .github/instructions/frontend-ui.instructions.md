---
name: "Frontend UI Layer"
description: "Strict React component rules for the frontend view layout layer. Applies to all TSX/JSX files in src/components."
applyTo: "src/components/**/*.{tsx,ts,jsx,js}"
---

# Frontend View Layout Layer — Instruction Profile

## Scope

These instructions apply to all files under `src/components/` — the React UI rendering layer.

## Core Constraints

### Component Architecture

- **Functional components only**: Use `React.FC` or explicit return type annotations. No class components.
- **Single Responsibility**: Each component renders one logical UI unit. Max 150 lines per component file.
- **Props interface**: Every component defines a typed `Props` interface at the top of the file.
- **Controlled inputs only**: No uncontrolled React inputs unless explicitly documented with a `useEffect` sync.

### State Boundaries

- **Local state**: `useState` for UI-only state (toggle, hover, focus).
- **Shared state**: `useReducer` + `AppContext` for cross-component data (notes, search results).
- **Derived state**: `useMemo` for computed values (filtered lists, sorted arrays).
- **Avoid prop drilling**: Use `useContext` for state deeper than 3 levels.

### Rendering Rules

- **Keyed lists**: Every mapped array uses a stable `key` prop (prefer ID over index).
- **Memoization**: Wrap components with `React.memo()` when parent re-renders frequently.
- **Conditional rendering**: Prefer `&&` operator or ternary over `if` blocks inside JSX.

### Tailwind CSS Conventions

- **Utility-first**: Prefer Tailwind classes over custom CSS for layout.
- **Responsive breakpoints**: `sm:`, `md:`, `lg:`, `xl:` — mobile-first.
- **Dark mode**: `dark:` prefix on all color properties.
- **Spacing scale**: `2`, `4`, `6`, `8`, `12`, `16` (2px, 8px, 24px, 32px, 48px, 64px).

### Accessibility

- **Semantic HTML**: `<article>` for notes, `<nav>` for sidebar, `<main>` for content.
- **ARIA labels**: `aria-label` on all icon buttons and inputs.
- **Keyboard navigation**: `tabIndex`, `onKeyDown` for interactive elements.

## Component File Structure

```tsx
import { ReactNode } from "react";

interface ComponentNameProps {
  title: string;
  children?: ReactNode;
}

export function ComponentName({ title, children }: ComponentNameProps) {
  return (
    <article className="p-4 bg-white dark:bg-gray-800 rounded-lg">
      <h2>{title}</h2>
      {children}
    </article>
  );
}
```

## Testing Requirements

- Every component gets a test in `tests/components/`.
- Test rendering, props, state transitions, and user interactions.
- Use `@testing-library/react` with `render`, `screen`, `fireEvent`.
