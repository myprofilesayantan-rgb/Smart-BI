# SMarBI Application Design System (appdesignsystem.md)

This document defines the component-level design system, typography, colors, and layout guidelines for the **SMarBI** Web App, aligning the design system with the purple-themed visual identity shown in the mockup.

---

## 1. Design Tokens & Foundations

### Colors
We use a premium, tech-forward purple/lavender color palette for primary elements, combined with clean slate backgrounds and highly readable text colors.

| Token | HSL / Hex | Usage |
| :--- | :--- | :--- |
| **Brand Primary** | `hsl(262, 70%, 50%)` / `#7c3bed` | Primary CTAs, active highlights, buttons, selected text |
| **Brand Light** | `hsl(262, 80%, 96%)` / `#f3e8ff` | Active backgrounds, hover fills, light lavender overlays |
| **Success** | `hsl(142, 70%, 45%)` / `#10b981` | Positive metric badges (+12.5%, etc.), upward trends |
| **Success Light** | `hsl(142, 75%, 95%)` / `#d1fae5` | Background fill for positive badges |
| **Danger** | `hsl(0, 72%, 50%)` / `#ef4444` | Negative metric badges (-0.4%), downward trends, warnings |
| **Danger Light** | `hsl(0, 75%, 96%)` / `#fee2e2` | Background fill for negative badges |
| **Background** | `hsl(240, 15%, 98%)` / `#f8f9ff` | Core canvas background |
| **Surface (Card)** | `hsl(0, 0%, 100%)` / `#ffffff` | Metric cards, chart containers |
| **Text Primary** | `hsl(222, 47%, 11%)` / `#0f172a` | Headers, body text, high-contrast labels |
| **Text Secondary**| `hsl(215, 16%, 47%)` / `#64748b` | Subheadings, footnotes, placeholders |
| **Outline** | `hsl(214, 32%, 91%)` / `#e2e8f0` | Borders, divider lines |

### Typography
- **Primary Interface Font**: **Inter** (via Google Fonts) for body copy, table text, metadata, and buttons.
- **Display / Header Font**: **Space Grotesk** or **Outfit** for main hero titles, metrics numbers, and major section headings.

---

## 2. Reusable UI Components

To ensure high maintainability, SMarBI is constructed from the following decoupled, component-level building blocks:

### Component Reusability & Matching Strategy
- **Storage & Reuse**: All layout sections, page elements, and interactive components (e.g., navigation bars, dashboards, detail views, custom charts) must be built as modular, reusable components to avoid duplicate implementations.
- **Responsiveness**: All layout sections, components, and interactions must be designed to be responsive, adjusting gracefully across different screen sizes.
- **Full Match**: Reuse the saved component exactly when a design requirement is a complete match.
- **Close Match**: If a requirement closely matches a saved component, reuse the component and adjust (add, remove, or toggle) micro-elements (such as helper links, tags, or buttons) using props or conditional slots rather than building a new component.

### 2.1 Sidebar (`<Sidebar />`)
- **Desktop Layout**: Fixed width `260px`, spans 100% viewport height. Contains branding, navigation links, "+ New Analysis" button, and secondary actions (Help, Logout).
- **Tablet Layout**: Collapses to `80px` width. Only shows icons. Tooltips on hover.
- **Props**:
  - `activeTab`: `'dashboard' | 'insights' | 'sources' | 'settings'`
  - `onTabChange`: `(tab) => void`
  - `onNewAnalysis`: `() => void`

### 2.2 Header (`<Header />`)
- **Content**: Sub-navigation dropdown ("Main Dashboard"), global search input, notification bell (with active indicator), and user avatar.
- **Props**:
  - `title`: string (e.g., "Main Dashboard")
  - `onSearch`: `(query) => void`

### 2.3 Metric Card (`<MetricCard />`)
- **Content**: Icon, percentage change indicator (positive/negative badge), label, primary value, and status footer.
- **Visuals**: Soft drop shadow, `rounded-2xl` border, backdrop-blur support.
- **Animations**: Subtle vertical translation (`y: -4`) and border-highlight expansion on hover via GSAP.
- **Props**:
  - `title`: string (e.g., "Revenue")
  - `value`: string (e.g., "$124,523")
  - `change`: number (e.g., `12.5` or `-0.4`)
  - `footer`: string (e.g., "On track to beat Q2 target by 8%")
  - `icon`: React Node (Material Icon)

### 2.4 Reusable Bar Chart (`<BarChart />`)
- **Content**: Animated SVG or CSS Grid column chart representing trend data.
- **Visuals**: Rounded columns (`rounded-t-lg`), opacity grading (e.g., past quarters are semi-transparent, current/predicted is high opacity brand color), and interactive hover tooltips.
- **Animations**: GSAP `stagger` and `scaleY` grow animation on load.
- **Props**:
  - `data`: Array of `{ label: string, value: number, isActive?: boolean }`
  - `title`: string
  - `subtitle`: string

### 2.5 AI Conversational Hero (`<AIHero />`)
- **Content**: Prompt bar ("Ask AI" + input text) that transforms into a full AI Answer section upon submission.
- **States**:
  - `Initial`: Displays "Ask anything about your business", search input, and button.
  - `Loading`: Pulsing AI avatar with scanning text.
  - `Result`: Displays AI commentary, growth badges, chart projections, and follow-up chips.
- **Props**:
  - `onQuerySubmit`: `(query) => Promise<ResultData>`

### 2.6 Action Chip (`<ActionChip />`)
- **Content**: Circular pill buttons for suggested next steps or filtering.
- **Props**:
  - `label`: string
  - `icon`: Material Icon name
  - `onClick`: `() => void`

### 2.7 Detail Drawer / Slide-over (`<InsightsDrawer />`)
- **Content**: Slide-out panel from the right containing deep-dive analytics.
- **Animations**: GSAP sliding transition (`xPercent: [100, 0]`) and backdrop overlay fade-in.
- **Props**:
  - `isOpen`: boolean
  - `onClose`: `() => void`
  - `content`: React Node

---

## 3. GSAP Animation Specifications

All animations are implemented using `@gsap/react` for React safety.

1. **Dashboard Stagger Entrance**:
   - Selector: `.metric-card`, `.chart-container`, `.hero-container`
   - Config: `opacity: 0, y: 30, duration: 0.8, stagger: 0.15, ease: "power3.out"`
2. **Chart Bar Drawing**:
   - Selector: `.chart-bar`
   - Config: `scaleY: 0, transformOrigin: "bottom", duration: 1, ease: "elastic.out(1, 0.75)", stagger: 0.08`
3. **Hover Scaling**:
   - Selector: `button`, `.interactive-item`
   - Config: `scale: 1.03, duration: 0.2, ease: "power1.out"`
4. **Transition to AI Results**:
   - Elements: Fade out initial text, collapse search rail margin, fade/slide in result blocks.
   - Config: Timeline sequence with `stagger` on AI text reveals.

---

## 4. Confirmed Product Decisions

### 4.1 Dashboard Interaction Pattern (Active Workspace)
- **Active Workspace**: The dashboard selector at the top defines the active workspace.
- **BI Brain Widget Auto-Addition**: Every BI Brain conversation result is automatically added to the currently selected dashboard as a widget.
  - No pin prompts or confirmation popups are presented to the user during addition.
  - The result lands directly on the active canvas.
- **Workspace Management**: Users manage dashboard clutter by deleting widgets they do not need from the workspace.
- **Dashboard Independence**: Each dashboard is isolated and independent. Changing the dashboard selector switches the active canvas only.
- **Quiet Feedback**: When a widget is automatically added, the BI Brain panel displays a quiet inline status line: *"Added to [Dashboard name]."*

### 4.2 Insights Page (Conversation & Exploration Space)
- **Default Landing**: The Insights page is the default landing page for the application immediately after login.
- **Minimalist Layout**: The page contains only one centerpiece element: the BI Brain AI input rail.
  - No widgets, no dashboards, and no auxiliary panels are visible.
  - Design is centered entirely around pure conversation.
- **Inline Results**: When a user types a question, the response appears inline.
- **No Auto-Addition**: Results queried on the Insights page do *not* automatically add themselves to any dashboard.
- **Manual Pinning**: To save a result from the Insights page, a quiet *"Pin to →"* action appears below the conversational response along with a dashboard selector. The user can explicitly pick a dashboard, and the widget will be placed there.
- **Session Longevity**: Unpinned queries and results are ephemeral and live only during the active conversation session.

### 4.3 Mental Model Summary
- **Insights**: An exploration and thinking space. Users query, converse, and selectively pin what matters.
- **Dashboard**: A curated workspace that auto-builds on queries, allowing users to prune and delete widgets they do not need.
- **Navigation Flow**: Left navigation menu remains persistent. Users can switch between Insights and Dashboards at any time. Insights is the default landing page.

---

## 5. Rich Dashboard Customization Features

To ensure a premium executive experience, SMarBI supports the following dynamic customization workflows on the dashboard canvas:

### 5.1 Alternating Widget Visualizations
On consecutive query submissions, the layout engine cycles widget types sequentially (`index % 3`) to present diverse, high-density graphs:
1. **Strategic Progress Bar Chart**:
   - **Metrics**: Displays target performance metrics (e.g. ARR Growth of $1.42M, 108% of target).
   - **Visualization**: A progress indicator with an overlaying **Target Marker Line** denoting Q2 goals.
   - **Summary**: Includes an AI-generated Executive Summary paragraph explaining expansion success.
2. **Segmented Donut Pie Chart**:
   - **Metrics**: Showcases traffic channel distributions (e.g. Organic, Direct, Social).
   - **Visualization**: An SVG donut circle with exact segment slices calculated from a 100-base circumference (`r="15.915"`, `stroke-width="31.83"` centered at `32,32` to prevent clipping).
   - **Summary**: Renders a legend grid alongside organic traffic acquisition summaries.
3. **Trend Line Graph**:
   - **Metrics**: Tracks month-over-month performance indices (e.g. +14.3% MoM growth).
   - **Visualization**: A smooth SVG area line chart with gradient color fills and data-point circles overlaying a target baseline.
   - **Summary**: Summarizes recurring contracts and growth projections.

### 5.2 Inline Header Renaming
- **Trigger**: Double-clicking the widget section header label or hovering and clicking the edit pencil button replaces the label with an active input field.
- **Input Behavior**: Auto-selects and focuses current title text.
- **Validation**: Pressing **Enter** or clicking outside (blur) commits the title. Pressing **Escape** discards edits. Empty inputs fall back to *"Custom Widgets"*.
- **Workspace Isolation**: Titles are saved independently per dashboard workspace (`dashboardSectionNames`), loading only when that specific dashboard is selected.

### 5.3 Native Drag-and-Drop Grid Sorting
- **Grab Affordance**: Cards feature a grab cursor (`cursor-grab`) which transitions to grabbing (`active:cursor-grabbing`) on active hold.
- **Visual Feedback**: Dragging dims the card to `40%` opacity. Dragging over other card items highlights the potential drop zone by scaling the target card down to `0.98`, highlighting borders in purple, and adding a background tint.
- **GSAP dropped flash**: Dropping a card mutates the state array, reflows the grid, and triggers a brief purple outline flash on the placed card.

### 5.4 Inline Deletion Confirmation
- **Hover Affordance**: The delete button is hidden by default (`opacity-0`) and fades in smoothly (`group-hover:opacity-100`) on card hover to reduce clutter.
- **Inline Swap**: Clicking the trash icon swaps the button for inline **Cancel** and **Delete** options (sliding in via GSAP).
- **Resolution**: Clicking **Cancel** restores the trash button. Clicking **Delete** shrinks the card, removes it from memory, updates the active workspace canvas, and alerts the user.

### 5.5 Toast Notification Alerts
- **Visuals**: Premium glassmorphic cards (`bg-white/95 backdrop-blur-md`) that slide down from the top-right corner and auto-dismiss after 3 seconds.
- **Success Toast (Addition)**: Triggered on widget addition: *"Widget added to dashboard."* (Success green icon).
- **Success Toast (Removal)**: Deletion is a deliberate, intentional user task for workspace management. Therefore, it is treated as a success state: *"Widget removed from workspace."* (Success green icon). Every intentional user action will have a success notification.
