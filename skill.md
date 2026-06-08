# SmartBI Development Guide & Technical Stack (skill.md)

This document serves as the technical guideline, design spec, and development standard for the **SmartBI** BI Web App.

---

## Strict Development Boundaries

1. **Workspace Restriction**: Do not edit any files or folders outside the `BI Web APP` directory. All changes must be strictly contained within the project workspace.

---

## Prototype Development Workflow

1. **Project Scope**: Build 4 to 6 fully functional and linked HTML prototype pages. Each page represents a distinct design and purpose within the application workflow.
2. **Reference Inputs & KT (Knowledge Transfer)**: For each prototype, the reference directory (e.g., `Reference/dashboard/`) contains Knowledge Transfer assets to help you understand the task:
   - A `.md` file (design specification / `DESIGN.md`).
   - One working HTML page (used to understand the screen layout/structure, though not well-organized or coded).
   - One image of the design (`screen.png` mockup).
   - Any user-uploaded annotated reference images will be stored in the `ref_image` directory.
3. **Execution Plan**:
   - **Step 1**: When instructed to work on a page (e.g., `dashboard`), locate its specifications.
   - **Step 2**: Read all reference files (PNG screenshot, `DESIGN.md` spec, reference HTML page) under the respective folder (e.g., `Reference/dashboard/`).
   - **Step 3**: Develop the fresh, clean, and interactive page under the `Final HTML` directory (outside the `Reference` directory).
   - **Step 4**: Interlink all pages within `Final HTML` to form a cohesive, interactive workflow.
4. **Code Quality & Asset Structure**: Ensure that the CSS, JS, and any asset files are structured cleanly and modularly. The code must be production-ready, featuring semantic markup, clean styling configurations, and optimized interactions.
5. **Documentation of Created Pages (Final HTML MD)**: After creating pages (e.g., Dashboard HTML), extract a single `.md` file cataloging all HTML design pages and save it under a directory named `Final HTML MD` under the `Reference` directory (i.e., `Reference/Final HTML MD/`). The files inside this folder (including the catalog `Final HTML.md` and `styleguide.html`) must always be kept updated by the agent whenever design-level changes are made, or when the user requests an update. This ensures the style guide and registry remain a reliable reference for new page construction.

---

## Asset Sharing & Workflow Controls

### 1. Unified Assets & File Structure
- **Directory Layout**:
  - **HTML Files**: Place HTML files directly under the `Final HTML` directory (e.g., `Final HTML/dashboard.html`).
  - **Feature-Specific Folders**: Store page-specific JS, CSS, and other local assets inside a dedicated subfolder named after the feature (e.g., `Final HTML/dashboard/` for Dashboard's JS and CSS).
  - **Unified Images**: Store all images for all pages (Dashboard, Onboarding, etc.) in a single, shared image folder (e.g., `Final HTML/images/`).
  - **Global CSS**: Store global CSS shared across all pages directly under `Final HTML` (or a global CSS path) as a single source of truth.
- **No Duplication**: Do not copy or duplicate global styling or shared images into individual feature subfolders.

### 2. Lock & Unlock Logic (Rework Prevention)
- **Locking**: When the user says `"Lock [Section Name]"`, that section's files are immediately locked.
- **Protection**: The agent must not edit any files inside a locked section/folder. If changes are requested on a locked section, the agent will prompt the user to unlock it first.
- **Unlocking**: Editing can only resume once the user issues the command `"Unlock [Section Name]"`.

### 3. Change History & Undo (Photoshop-like Rollback)
- **History Tracking**: Keep a history of changes (e.g., via version control history, changelogs, or localized backups) so that the user can request to "undo" changes and revert a section or page back to a previous design state.

---

## Technical Stack & Versions

- **Frontend Framework**: React 18+ / React 19 (via Vite)
- **Styling**: Tailwind CSS v4.0 (for utilities and rapid layouts) + Vanilla CSS (for custom overrides)
- **Animations**: GSAP v3.12+ (latest version) & `@gsap/react` hook
- **Icons**: Material Design Icons (latest)
- **Backend**: Node.js & Express (latest)
- **State Management**: React Context & Hooks

---

## Design System & Themes

SmartBI uses a premium, modern design with glassmorphism, smooth gradients, and cohesive purple/lavender styling.

### HSL Color Palette
- **Primary / Brand Accent**: HSL `255, 68%, 60%` (Vibrant Purple `#7c3bed` / `#6366f1`)
- **Brand Light**: HSL `255, 90%, 96%` (Light Lavender `#f3e8ff`)
- **Success Accent**: HSL `142, 70%, 45%` (Emerald Green)
- **Danger Accent**: HSL `0, 72%, 50%` (Red-Coral)
- **Card Background**: White (semi-opaque with backdrop-blur)
- **Sidebar Background**: Custom Off-White / Pale Grey HSL `240, 15%, 98%`

---

## GSAP Animation Standards

To ensure smooth transitions, performant animations, and proper cleanups, follow these guidelines:

### 1. The `@gsap/react` Hook
Always use the `useGSAP` hook from `@gsap/react` for writing GSAP animations in React components. This automatically handles animation cleanup when the component unmounts.

```javascript
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Register plugins if needed
// gsap.registerPlugin(ScrollTrigger);

export default function MetricCard({ title, value }) {
  const containerRef = useRef(null);

  useGSAP(() => {
    // Animation logic
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power3.out'
    });
  }, { scope: containerRef }); // Use scope to prevent global class selectors

  return (
    <div ref={containerRef} className="card-class">
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}
```

### 2. Micro-Animations
- **Metric Cards**: Slight upward y-shift (`y: -4`) and shadow expansion on hover.
- **Buttons**: Scale up slightly on hover (`scale: 1.02`), scale down on active press (`scale: 0.98`).
- **AI Response**: Staggered text opacity and character reveals for chat outputs.
- **Chart Bars**: Entrance animation where height grows from 0 to target value using `scaleY` or height interpolation with `transform-origin: bottom`.

---

## Responsive & Layout Guidelines

The target minimum viewport resolution is **Tablet** (~768px). SmartBI does not require full mobile support (below 768px), but must adapt seamlessly to desktop and tablet sizes.

### Responsive Methodology (No Media Queries)
Avoid using traditional CSS `@media` viewport queries. Use the latest modern CSS technologies to achieve clean, fluid responsiveness:
- **CSS Grid (Auto-Placement)**: Implement fluid grids using auto-fit or auto-fill with `minmax()` boundaries (e.g., `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`).
- **Flexbox Wrapping**: Use `flex-wrap: wrap` combined with flexible bases (e.g., `flex: 1 1 300px`) to let items wrap naturally.
- **Fluid Math Functions**: Use `clamp()`, `min()`, and `max()` for responsive typography, spacing, and dimensions without breakpoint steps (e.g., `font-size: clamp(1.2rem, 3.5vw, 2.5rem)`).
- **Container Queries**: Utilize `@container` queries for component-level responsiveness that adapts to the parent container's size rather than the viewport size.

---

### Tablet Breakpoint Adaptations
- **Sidebar**:
  - Desktop: Expanded sidebar (width `260px`).
  - Tablet: Collapses to a compact icon-only sidebar (width `80px`) or a slide-in drawer.
- **Hero & Search Section**:
  - Title and subtitles wrap cleanly. Search input reduces in padding and the button fits on the same row or wraps elegantly.
- **Key Metrics Grid**:
  - Desktop: 4 columns.
  - Tablet: 2 columns × 2 rows.
- **Charts / Insights**:
  - Desktop: 2-column layout (70% quarterly chart, 30% opportunity card).
  - Tablet: 1-column layout (stacked vertically, quarterly chart first, then opportunity card).

---

## Backend REST API Patterns (Node.js)

The Express backend provides clean REST endpoints for analytics data:

1. **GET `/api/metrics`**: Returns current metric values, percentages, and footnotes.
2. **POST `/api/query`**: Resolves questions typed into the "Ask AI" search bar.
   - Example request: `{"query": "How was our Revenue last month?"}`
   - Response: `{"answer": "Revenue last month was $124,523, representing a +12.5% growth compared to the prior period, beating our Q2 targets.", "success": true}`
3. **POST `/api/analysis`**: Creates a new custom query or analysis.
   - Example request: `{"title": "Social Campaigns Conversion", "metric": "Conversion Rate", "dimension": "Campaign Source"}`
   - Response: `{"success": true, "id": "an_01234"}`

