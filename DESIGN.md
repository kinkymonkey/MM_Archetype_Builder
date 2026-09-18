---
name: Obsidian Synthetics
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363941'
  surface-container-lowest: '#0b0e15'
  surface-container-low: '#191b23'
  surface-container: '#1d1f27'
  surface-container-high: '#272a32'
  surface-container-highest: '#32353d'
  on-surface: '#e1e2ec'
  on-surface-variant: '#bdc8d1'
  inverse-surface: '#e1e2ec'
  inverse-on-surface: '#2d3038'
  outline: '#87929a'
  outline-variant: '#3e484f'
  surface-tint: '#7bd0ff'
  primary: '#8ed5ff'
  on-primary: '#00354a'
  primary-container: '#38bdf8'
  on-primary-container: '#004965'
  inverse-primary: '#00668a'
  secondary: '#bdc2ff'
  on-secondary: '#131e8c'
  secondary-container: '#2f3aa3'
  on-secondary-container: '#a8afff'
  tertiary: '#e1bfff'
  on-tertiary: '#490080'
  tertiary-container: '#ce9bff'
  on-tertiary-container: '#6400ac'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7bd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#e0e0ff'
  secondary-fixed-dim: '#bdc2ff'
  on-secondary-fixed: '#000767'
  on-secondary-fixed-variant: '#2f3aa3'
  tertiary-fixed: '#f0dbff'
  tertiary-fixed-dim: '#ddb7ff'
  on-tertiary-fixed: '#2c0051'
  on-tertiary-fixed-variant: '#6900b3'
  background: '#10131a'
  on-background: '#e1e2ec'
  surface-variant: '#32353d'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  code-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 22px
    letterSpacing: -0.01em
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
  label-badge:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-lg: 1.25rem
  margin: 1rem
  margin-lg: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system targets generative media creators, technical directors, and prompt engineers orchestrating frontier diffusion and transformer models (Midjourney v6, Flux.1, Stable Diffusion XL, Runway Gen-3, Sora, and Luma Dream Machine). 

The visual style blends **Technical Minimalism** with **Hyper-Refined Glassmorphism**:
- **Atmosphere:** Deep vacuum obsidian and slate canvas evoking professional hardware interfaces, calibrated color-grading monitors, and low-light production suites.
- **Personality:** Surgical precision, instantaneous computational feedback, dense yet scannable information hierarchy, and quiet power.
- **Emotional Response:** Complete operational command over complex multi-modal generative pipelines without cognitive fatigue during extended synthesis sessions.

## Colors

The palette relies on absolute chromatic discipline to preserve the legibility of rendered imagery and real-time generation outputs.

### Foundations & Surfaces
- **Canvas Base:** `#0a0d14` (Deep Space Obsidian) — The viewport substrate.
- **Surface Level 1 (Panels & Toolbars):** `#111726` (Midnight Slate) — Structural partitions and docked workbenches.
- **Surface Level 2 (Cards & Active Modules):** `#182234` (Abyssal Slate) — Floating parameter blocks and interactive clusters.
- **Surface Level 3 (Hover / Highlights):** `#1e2c42` (Elevated Luster) — Interactive micro-states.

### Accents & Signal Flow
- **Primary Accent (`#38bdf8` - Electric Cyan):** Model execution triggers, prompt parameter syntax tags, active toggle handles, and cursor indicators.
- **Secondary Accent (`#818cf8` - Soft Indigo):** Conditioning weights, LoRA influence thresholds, and CFG scale markers.
- **Tertiary Accent (`#a855f7` - Radiant Violet):** Seed numbers, aspect ratio flags, negative prompt delimiters, and latent space coordinates.

### Semantic Status
- **Success / Finished Latent:** `#10b981` (Emerald-400)
- **Queued / Processing:** `#f59e0b` (Amber-400)
- **VRAM / Generation Alert:** `#f43f5e` (Rose-500)
- **Subtle Borders:** `rgba(255, 255, 255, 0.07)` to `#334155` (Slate-700) for surgical delineations.

## Typography

Typography establishes an uncompromising split between human-readable interfaces and machine-level synthesis parameters:
- **Inter** handles narrative controls, workspace structure, modal instructions, and high-density tabular metadata with neutral legibility.
- **JetBrains Mono** governs prompt fields, parameter flags (`--ar 16:9`, `--v 6.1`, `--cfg 7.5`), seed readouts, generation timing benchmarks, and tensor memory payloads.
- **Pacing:** All labels for technical inputs use `label-caps` in full uppercase with expanded letter-spacing (`0.08em`) to enforce rapid lateral parsing across multi-column control sidebars.

## Layout & Spacing

The system implements an ultra-dense, responsive 12-column docked fluid workstation architecture:
- **Shell Model:** Three primary operational zones:
  - **Left Rail (Fixed 64px collapsed, 280px expanded):** Model switcher, presets, pipeline history.
  - **Center Canvas (Fluid):** Syntax-highlighted prompt orchestrator, canvas nodes, high-fidelity asset comparison viewer.
  - **Right Inspector (Fixed 320px / 360px):** Model weights, sampler steps, noise schedulers, camera trajectory rigs.
- **Rhythm & Grid:** Built on an absolute 4px base increment. Panel gaps maintain `gutter: 0.75rem` (12px) to maximize real-estate efficiency. Outer boundaries clamp to `margin: 1rem` on desktop displays.
- **Breakpoints:**
  - **Desktop (>= 1440px):** Complete three-panel workbench visible simultaneously.
  - **Compact Desktop / Tablet Landscape (1024px - 1439px):** Inspector defaults to collapsible overlay or bottom dock; center canvas prioritized.
  - **Mobile (< 1024px):** Single-column stacked mode with swipeable drawer execution bars and segmented model controls.

## Elevation & Depth

Visual hierarchy is attained through **luminescent boundary containment** rather than heavy drop shadows:

- **Level 0 (Base Canvas):** `#0a0d14` solid. No blur, no elevation.
- **Level 1 (Docked Shell Panels):** Background `#111726` at 85% opacity with `backdrop-filter: blur(16px)` and a 1px border of `rgba(255, 255, 255, 0.05)`.
- **Level 2 (Active Cards & Parameter Modules):** Background `#182234` at 70% opacity, `backdrop-filter: blur(12px)`, 1px border of `rgba(56, 189, 248, 0.15)`. Ambient back-glow using `box-shadow: 0 0 20px -8px rgba(56, 189, 248, 0.12)`.
- **Level 3 (Floating Command Palettes & Overlays):** Background `#111726` at 95% opacity, `backdrop-filter: blur(24px)`, 1px border `rgba(129, 140, 248, 0.35)`, cast shadow `0 16px 40px -10px rgba(0, 0, 0, 0.75)`.
- **Active Focus States:** When focusing on prompt token fields or parameter nodes, elevation is communicated via an intensified internal edge highlight (`inset 0 0 0 1px #38bdf8`) rather than geometric offsets.

## Shapes

The interface embraces an engineered, calibrated geometry with **Soft (0.25rem / 4px)** primary curvature:
- **Base Surfaces & Inputs:** 4px radius (`0.25rem`). Maintains the crispness of precision studio equipment and matches monospace glyph geometry.
- **Cards, Preview Modules, and Dialogs:** 8px radius (`0.5rem` / `rounded-lg`) for structural grouping without introducing organic softness.
- **Pill Exceptions:** Model tags, parameter argument chips (`--ar 16:9`), and status badges leverage a full capsule radius (9999px) to distinctly isolate syntax tokens from functional structural panels.

## Components

### Buttons
- **Primary (Execute / Synthesize):** High-energy electric cyan gradient (`linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)`), text `#0a0d14` in JetBrains Mono 12px 600 weight, 4px border radius. Hover introduces subtle outer cyan radiance (`0 0 16px rgba(56, 189, 248, 0.4)`).
- **Secondary (Queue / Parameter Presets):** Background `#182234`, border 1px `rgba(255,255,255,0.08)`, text `#f8fafc`. Hover switches border to `#38bdf8` at 40% opacity.
- **Ghost / Icon Actions:** Transparent background, text `#94a3b8`, hover text `#38bdf8` with `#182234` background fill.

### Syntax-Highlighted Prompt Tokens & Chips
- **Interactive Argument Pills:** Monospace (`code-sm`), pill-shaped (9999px), background `rgba(56, 189, 248, 0.08)`, border 1px `rgba(56, 189, 248, 0.25)`, text `#38bdf8`. Clicking opens inline slider popovers.
- **Negative Prompt Tokens:** Background `rgba(244, 63, 94, 0.08)`, border 1px `rgba(244, 63, 94, 0.25)`, text `#fb7185`.
- **Model Preset Chips:** JetBrains Mono 11px, background `#111726`, border 1px `rgba(255,255,255,0.08)`, subtle cyan dot indicator for active inference engine.

### Parameter Sliders
- **Track:** 4px height, background `#0a0d14`, border-radius 2px. Filled active progress bar in `#38bdf8` or `#818cf8`.
- **Thumb:** 14px x 14px square rotated 45 degrees or 12px circular pip in solid `#ffffff` with a cyan outer halo on hover. Numerical value readout rendered permanently in `code-sm` right-aligned to the track.

### Input Fields & Textareas
- **Prompt Master Engine:** Multi-line text container with `#0a0d14` base, inset border 1px `rgba(255,255,255,0.1)`. Real-time regex highlighting categorizes natural language descriptors, weights (`(cinematic lighting:1.3)`), and CLI flags (`--v 6.1 --stylize 250`).
- **Numeric Mini-Inputs:** Monospace, fixed-width, integrated increment/decrement arrows on hover, centered text alignment.

### Cards & Generation Viewports
- **Media Asset Matrix:** Card housing with 1px border `rgba(255, 255, 255, 0.06)`, dark slate background `#111726`. Includes embedded overlay action bar (Upscale, Vary Subtle/Strong, Inpaint, Transfer Seed) appearing on hover with frosted backdrop blur (`rgba(10, 13, 20, 0.75)`).
- **Metadata Drawer:** Slide-up bottom sheet over generated assets exposing step count, sampler model, guidance scale, and seed in `code-sm` JetBrains Mono.