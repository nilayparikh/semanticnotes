---
name: ui-layout-integration
description: "Visual mock integration and UI layout skill using Google Stitch methodology. Use when implementing visual layouts from mock-ups or design specs."
allowed-tools: shell
---

# Visual Mock Integration & UI Layout Skill

## When to Use

Use this skill when implementing visual layouts from mock-ups in the `mock/` directory or design specs in `docs/design/`.

## Google Stitch Methodology

Follow Google's Stitch approach for consistent UI layouts:

1. **Grid System**: Use CSS Grid with `grid-template-columns` and `grid-template-rows`.
2. **Spacing Scale**: Base unit of 8px (`2`), multiples: `4`, `6`, `8`, `12`, `16`.
3. **Typography Scale**: Small (12px), Medium (18-20px), Large (28-30px).
4. **Color Palette**: Use semantic colors (`--color-primary`, `--color-accent`) with dark mode variants.

## Layout Implementation Steps

1. **Analyze the mock**: Open the visual mock in `mock/DESIGN.md` or `mock/code.html`.
2. **Identify grid structure**: Map the layout to CSS Grid areas.
3. **Define spacing**: Use Tailwind classes for consistent spacing.
4. **Implement components**: Create React components for each UI unit.
5. **Verify against mock**: Compare the rendered UI with the mock-up.

## Tailwind Grid Example

```tsx
export function Layout() {
  return (
    <div className="grid grid-cols-[250px_1fr_300px] gap-4 h-screen">
      <aside className="bg-gray-100 dark:bg-gray-800">
        <h2>Sidebar</h2>
      </aside>
      <main className="bg-white dark:bg-gray-900">
        <article>Note Content</article>
      </main>
      <aside className="bg-gray-50 dark:bg-gray-850">
        <h3>Properties</h3>
      </aside>
    </div>
```
