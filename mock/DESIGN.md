---
name: Developer-Centric AI Design System
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#849495'
  outline-variant: '#3b494b'
  surface-tint: '#00dbe9'
  primary: '#dbfcff'
  on-primary: '#00363a'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#006970'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#f3f6ff'
  on-tertiary: '#213145'
  tertiary-container: '#cadbf5'
  on-tertiary-container: '#506076'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.02em
  body-base:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  code-editor:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '450'
    lineHeight: '1.7'
    letterSpacing: 0em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.1em
  status-pill:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  sidebar-width: 260px
---

## Brand & Style
This design system is engineered for high-performance cognition, catering to developers and power users who require a focused, distraction-free environment for AI-assisted note-taking. The brand personality is clinical, precise, and sophisticated, leaning heavily into a refined **Glassmorphism** aesthetic.

The visual language emphasizes depth through transparency rather than traditional shadows. Surfaces are treated as physical layers of smoked glass, allowing subtle background hints to bleed through while maintaining legibility. This creates a sense of "lightness" despite the dark palette, evoking a futuristic, IDE-inspired workspace. The emotional response is one of calm control and technical mastery.

## Colors
The palette is rooted in a "Deep Charcoal" base to minimize eye strain during long sessions. 

- **Base Background:** A pure, matte #0A0A0A.
- **Translucent Overlays:** Slate-tinted transparencies (RGBA) are used for sidebars and panels to create the glass effect.
- **Accents:** High-vibrancy "Cyan Blue" (#00F0FF) is the primary action and syncing color, while "Emerald Green" (#10B981) denotes active states and success. 
- **Glows:** Accent colors are frequently used as soft, 10-20px radial blurs behind active elements to simulate bioluminescence.

## Typography
The system utilizes a dual-font strategy to distinguish between the interface and the content.

- **UI & Navigation:** **Geist** provides a modern, neutral, and highly legible sans-serif experience. It is used for all menus, headers, and buttons.
- **Editor & Metadata:** **JetBrains Mono** is the workhorse for the actual note-taking area and technical metadata (like tags or timestamps). This caters to the developer's mental model of "editing text."
- **Scale:** Typography scales minimally; desktop and mobile sizes remain consistent to maintain a "pro-tool" feel, though `display-lg` drops to 32px on mobile devices.

## Layout & Spacing
The layout follows a **Fixed-Fluid hybrid** model. Navigation and metadata panels have fixed widths to maintain a stable environment, while the central editor area is fluid to maximize focus.

- **Grid:** A 12-column grid is used for dashboard views, but the primary editor is a single-column centered container (max-width 800px).
- **Rhythm:** An 8px linear scale is used for vertical rhythm, while 4px increments are used for fine-tuning internal component spacing.
- **Safe Areas:** Generous inner padding (32px+) in the editor ensures content doesn't feel cramped against the glass panels.

## Elevation & Depth
Depth is communicated through **Backdrop Blurs** and **Border Luminance** rather than shadows.

- **Level 0 (Base):** #0A0A0A (Matte).
- **Level 1 (Panels):** Translucent Slate with a 20px backdrop-blur. Surface has a 1px solid border at 10% white opacity.
- **Level 2 (Modals/Popovers):** Higher transparency with a 40px backdrop-blur. The 1px border increases to 20% white opacity to "catch the light."
- **Active State:** Elements in focus gain a subtle "Inner Glow" using the primary Cyan color at 15% opacity, making the glass appear energized.

## Shapes
The system uses a **Soft (0.25rem)** base roundedness to maintain a professional, architectural feel. 

- **Standard Components:** Buttons and cards use the base 4px radius.
- **Status Elements:** Badges and "pill" indicators are the exception, utilizing a fully rounded (999px) radius to differentiate them as discrete status markers.
- **Selection States:** Focus rings are sharp, hugging the 4px radius with a 2px offset.

## Components
- **Buttons:** Ghost-style by default with 1px borders. Primary buttons utilize a solid Cyan fill with black text. All buttons feature a subtle transition that increases border opacity on hover.
- **Pill Badges:** Small, fully rounded chips used for "Active," "Draft," or "Syncing." They include a 4px solid dot of the status color alongside the text.
- **Input Fields:** Borderless by default within the glass panels. A subtle 1px bottom-border appears only on focus, accompanied by a soft Cyan glow.
- **Cards:** Smoked glass surfaces with "frosted" edges. No shadows; separation is achieved via backdrop-blur and a thin #FFFFFF10 border.
- **AI Context Bar:** A floating, glassmorphic pill at the bottom of the editor with a persistent Cyan outer glow to indicate the AI is "listening" or "processing."
- **Lists:** Clean rows with no horizontal separators; hover states are indicated by a 5% white background fill that spans the full width of the container.