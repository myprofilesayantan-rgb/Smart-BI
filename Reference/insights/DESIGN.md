---
name: Playful Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#400010'
  on-tertiary-container: '#da586c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#ffdadc'
  tertiary-fixed-dim: '#ffb2b9'
  on-tertiary-fixed: '#400010'
  on-tertiary-fixed-variant: '#891933'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is built on the philosophy of **Playful Precision**. It balances the rigor of data science with the approachability of conversational AI. The goal is to make complex business intelligence feel effortless and engaging without sacrificing the authority required for enterprise decision-making.

The visual style is **Modern Corporate** with a heavy emphasis on **Minimalism** and **Tactile** refinement. It utilizes high-contrast typography, generous negative space, and "squishy" interactive affordances to create a UI that feels responsive and alive. Surfaces are clean and breathable, ensuring that data—the hero of the application—remains the focal point.

**Target Audience:** Analysts, executives, and data-driven product teams who value speed, clarity, and a premium toolset.
**Emotional Response:** Confidence, clarity, and a sense of "intellectual ease."

## Colors

The palette is anchored by **Deep Navy** (`#0F172A`), providing a foundation of stability and professional trust. This is contrasted by a vibrant **Sunset Orange** (`#F97316`) and **Coral** (`#FB7185`) accent system used exclusively for high-priority calls to action and critical data highlights.

- **Primary (Navy):** Used for headers, primary navigation, and core brand elements.
- **Accent (Orange/Coral):** Reserved for interactive "Aha!" moments, active states, and primary buttons.
- **Surface & Background:** A tiered system of White (`#FFFFFF`) and Slate-tinted grays (`#F8FAFC`) to separate the conversational input from the data output layers.
- **Data Viz:** High-contrast scales starting from the Primary Navy and branching into the Secondary accents to ensure accessibility and immediate pattern recognition.

## Typography

The typographic system utilizes a dual-font approach to signal the "Playful Precision" ethos.

**Space Grotesk** is the voice of the system’s intelligence. Its technical, geometric character is used for headlines and key data points. It should always be set with tighter letter spacing at larger sizes to maintain a sleek, modern appearance.

**Inter** provides the functional backbone. It is used for all conversational text, body copy, and UI labels. Its high legibility ensures that complex queries and data descriptions remain readable even at small sizes. 

For mobile, headlines scale down aggressively to ensure no more than three words per line, maintaining the vertical rhythm of a conversational interface.

## Layout & Spacing

This design system uses a **Fluid-Fixed Hybrid Grid**. The sidebar and conversational input areas are fixed-width components, while the main data dashboard/results area scales fluidly to maximize information density.

- **Grid:** A 12-column layout for desktop with 24px gutters.
- **Rhythm:** An 8px linear scale guides all spatial relationships. Elements are grouped using 12px (small), 24px (medium), or 48px (large) stacks to create clear visual clusters.
- **Safe Areas:** On mobile, margins are reduced to 16px to prioritize screen real estate for charts, with elements reflowing into a single-column vertical stack.
- **The "Chat" Rail:** The conversational input is centered or anchored with significant horizontal padding (minimum 80px on large screens) to evoke a focused, distraction-free environment.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Ambient Shadows**. This design system avoids harsh borders in favor of depth.

1.  **Level 0 (Background):** Slate-50 (`#F8FAFC`). Flat and foundational.
2.  **Level 1 (Cards/Containers):** Pure White (`#FFFFFF`). These use a "Soft-Shadow" (0px 4px 20px rgba(15, 23, 42, 0.05)) to appear slightly lifted from the background.
3.  **Level 2 (Active/Floating):** Conversational bubbles and tooltips. These use a more pronounced shadow (0px 10px 30px rgba(15, 23, 42, 0.12)) to indicate immediate interaction and presence over the data.
4.  **The Glass Overlay:** For modals or filter panels, a 12px backdrop blur with a 70% white opacity is used to maintain context of the underlying data while focusing the user's attention.

## Shapes

The shape language is defined by **Soft Geometricity**. 

- **Standard Elements:** Buttons, inputs, and small widgets use a `0.5rem` (8px) radius.
- **Containers:** Data cards and chat bubbles use a `1rem` (16px) radius (`rounded-lg`).
- **Feature Cards:** Hero sections and large dashboard containers use the `1.5rem` (24px) `rounded-xl` setting to emphasize the "playful" and approachable side of the brand.

Interaction states should feel "elastic." When hovered, buttons may transition slightly in size or shadow depth to reinforce a tactile, responsive feel.

## Components

**Buttons:**
Primary buttons feature a solid Secondary Orange fill with white text. They use a subtle 2px bottom shadow to appear "pressable." Secondary buttons use the Navy Primary color in a ghost style (outline only) or as a light gray subtle fill.

**Chat Input:**
The central component of the design system. It should be a large, white, pill-shaped or highly rounded bar with a subtle shadow. It must feature a "glow" state when focused, using a 2px Orange ring.

**Data Cards:**
Cards must have a 1px Slate-200 border and no harsh shadows unless hovered. Headlines within cards use Space Grotesk. Padding inside cards should be generous (min 24px) to avoid visual clutter around charts.

**Chips & Filters:**
Used for data categories. They should be "pill-shaped" (`rounded-full`) with a light Navy tint background and Navy text. Active states toggle to the Accent Orange.

**Visualizations:**
Charts should avoid "thin" lines. Line charts use a 3px stroke width; bar charts use 4px corner radii on the top edges of bars. The color scale must always start with Navy to ensure the brand identity is woven into the data itself.