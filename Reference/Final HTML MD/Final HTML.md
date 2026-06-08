# SMarBI Final HTML Catalog

This document serves as the central registry and template catalog for all production-ready, fully responsive, and animated HTML prototype pages created for the **SMarBI** BI Web App workflow.

---

## 1. Prototype Directory Structure

All files are organized outside the `Reference` directory inside the `Final HTML` folder (note the exact directory casing `FInal HTML` is used):
- **Global styles**: `FInal HTML/global.css` (single source of truth for variables, fonts, and global overrides)
- **Shared images**: `FInal HTML/images/` (unified image folder)
- **Page layouts**: HTML templates are placed in the root of the folder, and page-specific JS/CSS assets are placed in dedicated subfolders.

```
BI Web APP/
├── FInal HTML/
│   ├── global.css
│   ├── dashboard.html
│   ├── images/
│   │   └── .gitkeep
│   └── dashboard/
│       ├── dashboard.css
│       └── dashboard.js
```

---

## 2. Pages Catalog

| Page Name | HTML File | Style (CSS) | Logic (JS) | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Dashboard** | [dashboard.html](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/dashboard.html) | [dashboard.css](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/dashboard/dashboard.css) | [dashboard.js](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/dashboard/dashboard.js) | Main dashboard landing page featuring a responsive Sidebar, dashboard switcher, ClickUp Brain-inspired conversational AI deck, high-density metrics, and animated bar chart. |
| **Insights** | [insights.html](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/insights.html) | [insights.css](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/insights/insights.css) | [insights.js](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/insights/insights.js) | Conversational landing page containing a sticky AI conversational input rail, interactive loading indicators, alternating data visualizations, and an overlaying dashboard select pinning selector writing to localStorage. |
| **Data Sources** | [data_sources.html](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/data_sources.html) | [data_sources.css](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/data_sources/data_sources.css) | [data_sources.js](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/data_sources/data_sources.js) | Connected data source management workspace containing credentials forms, sync logs, CSV file import tracking, and a Connection Assistant chatbot scoped strictly to connection and credentials sync errors. |
| **Login / Signup** | [login.html](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/login.html) | [login.css](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/login/login.css) | [login.js](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/login/login.js) | Interactive user authentication page featuring clean brand logo components, Google SSO simulated access cards, input validation guards, and smooth GSAP state card toggling. |
| **Onboarding** | [onboarding.html](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/onboarding.html) | [onboarding.css](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/onboarding/onboarding.css) | [onboarding.js](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/onboarding/onboarding.js) | Dynamic onboarding connection setup wizard featuring AI guide bubbles, secure database validation fields, workspace role cards, email tags chips list, and vertical progress step tracking. |
| **Style Guide** | [styleguide.html / design_system.html](file:///d:/Projects/BI%20Web%20APP/Reference/Final%20HTML%20MD/styleguide.html) | Relative links to global CSS and dashboard CSS | Live rendering and components showcase | Interactive corporate style guide displaying SMarBI brand tokens, HSL colors, compact typography hierarchy, elevations, and UI components. |

---

## 3. Page Details & Implementation Guidelines

### 3.1 Dashboard
- **HTML Template**: [dashboard.html](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/dashboard.html)
- **Component Breakdown**:
  - **Top Aura background blur**: Linear/radial gradient blurs (orange-pink and blue) at the top of the canvas that fade into the page background.
  - **Sidebar Component**: Floating sidebar that adopts the corporate style guide's typography scale (compact `text-xs` font size, `16px` icon size, and `py-1.5` padding) and collapses to a thin `60px` icon-only strip on screens narrower than `1024px` using smooth CSS transition effects, completely avoiding media queries.
  - **Top App Bar**: Dashboard select dropdown (triggers interactive loading pulses and mock data swaps on click), notification panel popover, search input, and user avatar dropdown menu (with billing and account settings).
  - **Conversational AI Hero**: Center-focused input rail:
    - **Logo Centerpiece**: Center-aligned ClickUp Brain styled SVG icon next to the "BI Brain" logo text.
    - **Conversational Card**: Custom `.ai-input-wrapper` animating gradient stroke and glowing blur overlay on focus, textarea input, and a bottom action bar with Add Context (`+`) and History (clock) actions on the left, and Voice Input (mic, with pulse simulation) and Send (arrow) actions on the right.
    - **History & Favorites popover**: Dynamically rendered list dropdown persisted in `localStorage`. Allows managing query history and adding queries to **Favorites** (toggled via a star icon in the AI response). Clicking any query item immediately fills and executes the search.
    - **Horizontal Suggestion Cards**: Clean prompt chips showing BI-specific questions (e.g., "How did we do last month?", "Which product is underperforming?", "Predict next quarter's revenue", "Summarize my active data sources") to align with conversational BI purity.
  - **Key Metrics Grid**: A 4-column responsive grid showcasing compact KPIs (Revenue, Users, Conversions, Orders) using HSL trend badges and info tooltips.
  - **Quarterly Revenue Trajectory**: An interactive CSS Grid column chart animated with GSAP `scaleY` grow triggers on load and custom highlight tooltip states on hover.
  - **High Impact Opportunity**: Call-to-action block highlighting targeted behavioral conversions.
  - **Operations & Resources Panel**: A 2-column widget panel showing active user-friendly data sources (Sales Spreadsheet, Shopify Store, Marketing CSV Export) and recent business activity / insights updates ("What happened while you were away").

### 3.2 Insights (Conversational Space)
- **HTML Template**: [insights.html](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/insights.html)
- **Component Breakdown**:
  - **Aura Gradient Blurs**: Consistent pastel orange/pink/blue radial glows at the top of the canvas.
  - **SideNavBar & TopAppBar**: Persistent side navigation (collapsing layout) and app header.
  - **Conversational Input Rail**: ClickUp-style animating gradient input rail with context selectors, voice recording simulations, and history popovers.
  - **Interactive Chat Stream**: Scrollable feed displaying user message bubbles and AI response cards.
  - **Alternating Data Visualizations**: Sequential rendering of Strategic Progress bars (with target markers), Segmented Donut charts (precise HSL segments), and Trend Line charts (gradient area fills).
  - **Dashboard Pinning Overlay**: "Pin to" dropdown option allowing the user to select one of the four active dashboards, saving the widget object to local storage and outputting a success toast notification.
  - **Toaster alerts**: Premium glassmorphic success and info notification banners.

### 3.3 Login / Signup
- **HTML Template**: [login.html](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/login.html)
- **Component Breakdown**:
  - **Ambient blurred circles**: Three soft purple/pink/blue gradient radial glows placed absolute behind the login card to provide deep depth layering.
  - **SMarBI favicon logo**: Clean SMarBI vector brand mark positioned at the card header.
  - **SSO Containers**: Card components styling the Google Login ("Continue as San" with user avatar and SVG Google mark) and corporate SSO buttons.
  - **Credentials Form**: Input groups styling the Name (faded in Signup state), Email, and Password (incorporating visibility eye toggles) fields.
  - **State togglers**: Dynamic GSAP transitions that switch between login and signup modes without screen refreshes.

### 3.4 Onboarding (Connect Data Wizard)
- **HTML Template**: [onboarding.html](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/onboarding.html)
- **Component Breakdown**:
  - **Conversational Phase 1 (Business Identity)**: Redesigned as an interactive, scrollable chat feed featuring:
    - **Welcome Splash Overlay**: A full-screen welcome overlay featuring pulsing rings, an animating gradient orb wrapper, and an active loading progress bar indicating "BI Brain" assistant initialization steps. The welcome screen dissolves (via GSAP scale/opacity fades) to introduce the chat stream.
    - **AI Guide & User Bubbles**: Prompts are delivered dynamically as AI bubbles in the chat stream, and user answers are appended as User response bubbles.
    - **Conditional Cities Question**: If the user operates globally and specifies countries (detected via a case-insensitive country-name keyword heuristic) in the regions step, the assistant dynamically inserts a follow-up cities prompt. This card houses two tabs: **Manual Entry** (allows typing cities individually) and **Bulk Upload** (enables dropping/browsing a .CSV or .XLSX file). If the user enters cities directly in the regions step, this follow-up cities prompt is automatically bypassed.
    - **Custom Industry specifier**: If the user selects "Other" in the industry selector grid, SMarBI prompts the user with a specifier text question. Submitting the custom industry details displays them in the final Workspace Preview summary labels. Standard industry choices automatically skip this step.
    - **Inline Inputs**: Interactive controls (choice chips, industry grids, tag creators, and document upload dropzones) render inline directly inside the scrollable chat feed under the active question.
    - **Persistent Bottom Input Deck**: A purple-pink-blue gradient border container containing textarea, attachment, history, and voice inputs. While secondary controls are disabled and dimmed when inline inputs are required, the `+` (add) attachment button remains active, styled in primary purple with `pointer-events-auto`. Clicking it triggers a file selector:
      - During the **cities step** (with the Bulk Upload tab active), it forwards the file directly to the inline cities upload dropzone.
      - During the final **document step**, it forwards the file to the inline strategy document upload input.
      - During other steps, it triggers a friendly Toast notification showing where uploads are supported.
    - **Hover-to-Edit & Reversion Rollback**: User response bubbles display a pencil edit icon on hover. Clicking it deletes subsequent answers in `state.answers`, rolls back the progress stepper, purges subsequent bubbles from the DOM, and re-prompts the user with the correct focused input.
  - **Step 2 (Credentials)**: Input fields capturing Host, Database Name, Username, and Password, alongside a simulated connection checker spinner.
  - **Step 3 (Team Roles)**: Access cards mapping Admin, Analyst, and Viewer permissions with check marks.
  - **Step 4 (Invite Team)**: Teammate tag chip list displaying coworker emails with remove controls.
  - **Step 5 (Finalize)**: Complete verification checkmark with a workspace launcher button.
  - **Progress Stepper Panel**: A vertical stepper timeline detailing 5 configuration stages, incorporating active pulsing status nodes, completed check circles, and progress percentage scales.

### 3.5 Data Sources & Scoped Connection Assistant
- **HTML Template**: [data_sources.html](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/data_sources.html)
- **Component Breakdown**:
  - **Workspace Metrics Row**: Summarizes active database hosts, uploaded spreadsheet counts, connection health (100% online), and last successful sync execution indicators.
  - **Data Integration Cards**: Grid featuring active/inactive storage nodes (PostgreSQL with live status pill, Shopify connector, Stripe integration status card, and a CSV Spreadsheet uploader).
  - **Manual Trigger Controls**: Synchronize Now button on database cards triggering inline loading animations and UI state switches.
  - **Audit Logs Table**: Responsive history table listing data sync states, record counts, and failure warnings (e.g. June 7 Auth Timeout).
  - **Scoped Connection Assistant chatbot**: Right-side panel (using a network `hub` icon) with welcome messaging explicitly detailing boundaries. Handles interactive commands:
    - *Host Configuration pre-fill*: Fills modal input field and opens PostgreSQL configuration popup.
    - *Interval Updates pre-fill*: Fills target sync frequency and triggers configuration modal.
    - *Run Sync trigger*: Programmatically spins the PostgreSQL database connector card and inserts success rows.
    - *Clear file alert*: Initiates warnings when spreadsheet deletion commands are received.
    - *Developer SQL pivot redirection*: Polite boundary message directing database logic questions towards dashboard metrics.

### 3.6 Dashboard Visual Filters & Non-Technical Calculated Metrics
- **HTML Template**: [dashboard.html](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/dashboard.html)
- **Component Breakdown**:
  - **Add Filter Dropdown**: Above key metrics, houses multi-category filters (Traffic Source, Geographic Regions).
  - **Active Filters Container**: Dynamically inserts and animates HSL-colored filter chips (e.g. `Source: Social`) with integrated remove buttons.
  - **Visual Data Re-aggregation**: Applying a filter chip blurs numeric metrics momentarily using GSAP and reduces counts to simulate segmentation, scaling down the core charts' CSS grid bars correspondingly. Removing the chip restores normal values.
  - **Calculated Metrics Sidebar Button**: Sidebar button launching the custom formula modal builder.
  - **Non-Technical Formula Builder Modal (`#calc-modal-overlay`)**: A visual creator modal letting users combine metrics using pre-defined pattern templates (Divide A by B, Growth rate of A MoM, Sum, Product) and simple dropdown selects (e.g. Revenue, Users).
  - **Metric Card Injection**: Form submissions insert new custom key metrics cards at the grid bottom detailing calculating formulas, values ($43.73), and hover-triggered DOM deletion controls.
