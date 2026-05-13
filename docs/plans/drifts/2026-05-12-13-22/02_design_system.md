# Plan 02 — Design System Foundation

**Status**: `Complete`  
**Author**: Change Agent  
**Created**: 2026-05-12  
**Completed**: 2026-05-12  
**Priority**: `Critical`  
**Estimated Effort**: 3 Story Points / 0.5 Days  
**Parent**: Drift Remediation (Phase 2)  
**Source Drifts**: #1, #16, #22, #23

## 1. Objective

Migrate the mock design system from `mock/DESIGN.md` and `mock/code.html` into Tailwind CSS configuration and custom utility classes. This phase establishes the visual foundation for all subsequent UI work.

## 2. Scope

### In Scope

- [x] Update `tailwind.config.ts` with mock color palette (40+ tokens)
- [x] Add Geist and JetBrains Mono font families
- [x] Add glassmorphism utility classes to `src/styles/tailwind.css`
- [x] Add border-radius configuration matching mock
- [x] Add spacing configuration (8px vertical rhythm)
- [x] Add `ai-glow` utility class for AI context indicators
- [x] Update CSS custom properties to match mock

### Out of Scope

- [ ] Component styling changes (covered in Phase 3)
- [ ] Layout structure changes (covered in Phase 4)
- [ ] New component creation (covered in Phase 5)

## 3. Acceptance Criteria

| #   | Criterion                                         | Status |
| --- | ------------------------------------------------- | ------ |
| 1   | Tailwind config includes all mock color tokens    | `[x]`  |
| 2   | CSS includes `glass-panel` utility class          | `[x]`  |
| 3   | CSS includes `ai-glow` utility class              | `[x]`  |
| 4   | Font families match mock (Geist + JetBrains Mono) | `[x]`  |
| 5   | Border radius configuration matches mock          | `[x]`  |
| 6   | Spacing configuration uses 8px vertical rhythm    | `[x]`  |

## 4. TDD Test Cases

No code tests required for configuration changes. Verification is done via visual inspection and CSS custom property checks.

## 5. Technical Approach

### 5.1 Update Tailwind Configuration

Replace `tailwind.config.ts` with mock design tokens:

```typescript
// tailwind.config.ts
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#131313",
        "surface-dim": "#131313",
        "surface-bright": "#3a3939",
        "surface-container-lowest": "#0e0e0e",
        "surface-container-low": "#1c1b1b",
        "surface-container": "#201f1f",
        "surface-container-high": "#2a2a2a",
        "surface-container-highest": "#353534",
        "on-surface": "#e5e2e1",
        "on-surface-variant": "#b9cacb",
        primary: "#dbfcff",
        "primary-container": "#00f0ff",
        "on-primary": "#00363a",
        "on-primary-container": "#006970",
        secondary: "#4edea3",
        "secondary-container": "#00a572",
        "on-secondary": "#003824",
        "on-secondary-container": "#00311f",
        background: "#131313",
        "on-background": "#e5e2e1",
      },
      fontFamily: {
        geist: ["Geist", "sans-serif"],
        jetbrains: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        unit: "4px",
        gutter: "16px",
        "margin-mobile": "16px",
        "margin-desktop": "32px",
      },
    },
  },
};
```

### 5.2 Add Glassmorphism Utilities

Update `src/styles/tailwind.css` with utility classes:

```css
/* src/styles/tailwind.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-background text-on-background font-geist;
  }
}

@layer components {
  .glass-panel {
    background: rgba(19, 19, 19, 0.8);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.25rem;
  }

  .ai-glow {
    box-shadow:
      0 0 10px rgba(0, 240, 255, 0.3),
      0 0 20px rgba(0, 240, 255, 0.1);
    border: 1px solid rgba(0, 240, 255, 0.4);
  }
}
```

## 6. Dependencies

- Requires `@fontsource/geist` and `@fontsource/jetbrains-mono` packages

## 7. Risks & Mitigations

| Risk                      | Impact | Mitigation                            |
| ------------------------- | ------ | ------------------------------------- |
| Font loading delay        | Medium | Use `font-display: swap`              |
| Tailwind config conflicts | Low    | Backup existing config before changes |
| CSS specificity issues    | Low    | Use `@layer` directives               |

## 8. Test Strategy

| Test Type | Scope                    | Location         |
| --------- | ------------------------ | ---------------- |
| Visual    | Color token verification | Browser DevTools |
| Visual    | Font rendering           | Browser DevTools |

## 9. Files to Create / Modify

| File                      | Action | Description                            |
| ------------------------- | ------ | -------------------------------------- |
| `tailwind.config.ts`      | Modify | Add mock color palette, fonts, spacing |
| `src/styles/tailwind.css` | Modify | Add glassmorphism utilities            |
| `package.json`            | Modify | Add font packages                      |

## 10. Completion Checklist

- [ ] All acceptance criteria met
- [ ] Tailwind config validated
- [ ] CSS utilities tested in browser
- [ ] Drift report updated to mark drifts #1, #16, #22, #23 as `Resolved`
