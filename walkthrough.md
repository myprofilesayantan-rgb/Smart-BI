# Walkthrough: Conversational AI Onboarding Redesign

We have successfully redesigned **Phase 1 (Business Identity)** of the SmartBI Workspace Setup into a fully conversational chat interface. The UI features interactive inline question inputs and a bottom persistent input deck that dynamically locks or unlocks based on input requirements. Hover-to-edit response rollback behaviors have been wired in to handle answers corrections. Additionally, we implemented a premium animated Welcome Splash Overlay and fixed a duplicate layout card in the progress stepper.

## Changes Made

### 1. HTML Layout Overhaul
- **File**: [onboarding.html](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/onboarding.html)
- **Modifications**:
  - **Welcome Splash Overlay**: Embedded a full-screen dynamic overlay (`#welcome-overlay`) inside the `<body>` featuring glowing radial gradient blur backdrops, a spinning border orb wrapper, and initialization loading sub-elements.
  - **Conversational Chat Feed**: Replaced the static content wrapper in `#phase-1` with a flexible card container `h-[580px]` containing a scrollable `#onboarding-chat-feed` canvas and a bottom `#onboarding-ai-input-deck` rail.
  - **Progress Stepper Bug Fix**: Removed the duplicate/redundant "Locked AI input" card inside `<aside id="stepper-col">` as highlighted in the user screenshot.

### 2. Conversational JS Engine Refactoring
- **File**: [onboarding.js](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/onboarding/onboarding.js)
- **Modifications**:
  - **Welcome Splash Sequence**: Implemented `runWelcomeAnimation()` using GSAP timelines to fade and slide in titles, scale progress markers, loop initialization status logs ("Initializing BI Brain...", "Connecting to SmartBI Core...", etc.), and smoothly dissolve out the overlay before launching the main feed.
  - **Dynamic Feed Loading**: Refactored `initPhase1()` and `renderQuestion(idx)` to clear the feed and append AI bubbles sequentially once the welcome splash screen completes.
  - **Conditional Cities Question**: Added a follow-up tag question (`cities`) that asks the user for specific cities inside their entered countries. It dynamically adapts its prompt text to list their answered regions, skipping itself if no regions are specified.
  - **Custom Industry Question**: Added a conditional follow-up text question (`customIndustry`) that prompts the user to specify their industry if they selected "Other" in the industry grid selector.
  - **Inline Question Controls**: Choice chips (`choice`), industry-grids (`industry-grid`), tag creators (`tags`), multi-select goals (`multi-choice`), and document dropzones (`file-or-skip`) render inline directly inside the scrollable chat feed.
  - **Bottom Rail Toggle**: Refactored `toggleBottomInputDeck(enabled, placeholder)` to dim and disable individual controls (textarea wrapper, history button, right controls) instead of the entire deck, maintaining the `+` button fully active, clickable, and styled at full opacity.
  - **Persistent Attachment Shortcuts**: Added click/change listeners to `#onboarding-add-btn` and `#onboarding-rail-file-input` to let the user pick a file from the bottom rail at any point, routing the selected file to the active inline input based on the question step ID.
  - **Hover-to-Edit & State Reversion**: User response bubbles are equipped with a hover edit icon triggering `handleEditAnswer(qidx)` rollback behaviors.
  - **Key Bindings**: Bound the `Enter` keypress and Send button click inside the bottom text area.

### 3. Catalog Documentation
- **File**: [Final HTML.md](file:///d:/Projects/BI%20Web%20APP/Reference/Final%20HTML%20MD/Final%20HTML.md)
- **Modifications**:
  - Updated section **3.4** to document the Welcome Splash Overlay, dynamic conditional cities step, interactive chat feed behaviors, dynamic inline layouts, persistent bottom rail `+` file integration routing, and rollback/edit logic.
### 4. Phase 4 KPI Discovery and Double-Binding Refactoring
- **Files**: [onboarding.html](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/onboarding.html), [onboarding.js](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/onboarding/onboarding.js)
- **Modifications**:
  - Wrapped the confirm button text inside a new `#p4-confirm-label` span in `onboarding.html` to separate it from the material icons span.
  - Refactored `initPhase4()` in `onboarding.js` to avoid returning before registering collapse and navigation listeners.
  - Refactored `setupKpiControls()` to support safe idempotent initialization and bound it to the `DOMContentLoaded` event to guarantee all control buttons are active upon landing.
  - Decoupled all navigation and setup event listeners from phase initializers (`initPhase2`, `initPhase3`, `initPhase5`) and refactored them into unified controls (`setupPhase2Controls`, `setupPhase3Controls`, `setupPhase5Controls`) run exactly once at DOMContentLoaded. This resolves back-navigation freezes and toggling glitches during back-and-forth phase transition loops.

### 5. Phase 5 Premium Fullscreen Deploy Sequence
- **File**: [onboarding.js](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/onboarding/onboarding.js)
- **Modifications**:
  - Replaced the placeholder instant redirect on clicking the Launch button with a premium step-by-step deploy animation sequence inside the `#launch-portal` overlay.
  - Sequentially animated 4 deploy phases (database structuring, KPI pipeline building, team syncing, and AI initialization) from 0% to 100% with smooth progress bar updates and spinning loader-to-checkmark transformations.
  - Programmed a GSAP scale-up fade entrance and a scale-down fade exit that redirects the user to `dashboard.html` upon completion.

### 6. Login/Signup Redirection Flow
- **File**: [login.js](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/login/login.js)
- **Modifications**:
  - Connected the onboarding and authentication entry points by checking the form state on submission.
  - Configured simulated signups (creating a new account) to display a success toast and redirect to `onboarding.html` so new users configure their settings first.
  - Configured simulated logins (existing credentials and SSO triggers) to display the welcome back notification and navigate directly to `dashboard.html`.

### 7. Connected Data Sources Page
- **Files**: [data_sources.html](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/data_sources.html), [data_sources.css](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/data_sources/data_sources.css), [data_sources.js](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/data_sources/data_sources.js)
- **Modifications**:
  - Designed a premium connected Data Sources workspace page including summaries, active database hosts, imported CSV files, third-party connectors (Shopify, Stripe, etc.), a transaction sync audit table, and popup credentials forms.
  - Integrated GSAP modal entrance animations, PostgreSQL sync spinners, CSV importing progress updates, and layout sidebars collapse structures.
  - Linked the Data Sources left-menu items in both [dashboard.html](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/dashboard.html) and [insights.html](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/insights.html) to the new `data_sources.html` file to hook it into the main user flow.
  - **Visual Improvements**: Scaled up card headers (from 12px to 13.5px), labels, and table cells (from 10px to 11px base) to fix sizing issues, padded summary widgets to `p-4.5` and connectors to `p-4` for clean breathing room, adjusted statuses to a softer semi-transparent HSL bg (`bg-success-container/70`), and increased button font sizes to `text-xs` with high-contrast text to optimize user legibility.

### 8. Scoped Connection Assistant (Data Sources Page)
- **Files**: [data_sources.html](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/data_sources.html), [data_sources.js](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/data_sources/data_sources.js)
- **Modifications**:
  - **Rebranding and Scope Locking**: Renamed the right-hand panel assistant from "AI Data Companion" to "Connection Assistant" and updated the subtitle to "Syncs, credentials & connectors" with a network `hub` icon.
  - **Welcome Message Scoping**: Set the initial welcome message to state boundary constraints explicitly: *"Ask me about your active connections, sync errors, credentials, or how to add a new data source. I'm scoped to this page."*
  - **Suggested Quick Chips**: Replaced developer SQL chips with page-relevant questions: *"Why did my last sync fail?"*, *"How do I add a Salesforce connection?"*, and *"What does Auth Timeout mean?"*.
  - **SQL Query Pivot**: Programmed the assistant to politely reject and pivot away from developer-level SQL commands (e.g. joins, selects) towards connection/credential issues.
  - **Interactive Automation Actions**:
    - *Host pre-fill*: Typing "change host to [X]" pre-fills the PostgreSQL host input field in the modal and launches the credentials overlay automatically.
    - *Interval pre-fill*: Typing "set sync interval to [Y]" pre-fills the frequency dropdown and launches the modal.
    - *Sync run*: Typing "run sync" or "retry sync" programmatically triggers the PostgreSQL card's manual sync spinner and history log updates.
    - *Spreadsheet clear*: Typing "clear file data" triggers the CSV clear confirmation alert.

### 9. Zero-Tech Dashboard Filters & Calculated Fields
- **Files**: [dashboard.html](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/dashboard.html), [dashboard.js](file:///d:/Projects/BI%20Web%20APP/FInal%20HTML/dashboard/dashboard.js)
- **Modifications**:
  - **Conversational Filters Row**: Added a filter bar above the Key Metrics section in `dashboard.html`. Enclosed an `Add Filter` dropdown and an `active-filters-container` to render visual chips.
  - **Filter Presets & Calculations**: Configured categorical filters (Social, Email, Direct, US East, Europe) in `dashboard.js`. Selecting a filter updates card metrics (e.g. Revenue, Active Users) and shrinks chart columns to reflect the segment with smooth GSAP animations.
  - **Calculated Metric Sidebar Button**: Added a dedicated `Calculated Metric` button in the sidebar below `New Analysis`.
  - **Formula Pattern-Based Builder**: Created a custom modal overlay (`#calc-modal-overlay`) to combine metrics. Instead of writing SQL/DAX formulas, users select a pattern template (e.g. Divide, Growth MoM, Sum, Product), pick Metric A and Metric B from dropdown lists, and name the metric.
  - **Calculated Card Injection**: Appends custom metrics directly to the grid with calculation results, formulas, and hover-triggered deletion buttons.

---

## Verification Results

Manual review of code interactions confirmed the following states:
1. **Startup Animation**: Onboarding starts with a beautiful full-screen loading sequence. Status indicators change, the progress bar fills to 100%, and the screen fades/scales out.
2. **Interactive Flow**: Chat feed initializes with the "Business Name" prompt, and the bottom input rail is enabled.
3. **Text Input & Validation**: Typing "Acme Corp" enables the send button. Pressing `Enter` or clicking the send button appends a User bubble and triggers the next headquarters question.
4. **Inline Choice & Rail Disabling**: When headquarters is answered, the "Multi-Region" choice cards display inline. The bottom rail textarea, mic, and history buttons instantly dim (opacity-40) and become disabled. However, the `+` button remains fully opaque, active, and styled in vibrant purple.
5. **Persistent Bottom Rail Attachment Route**:
   - **Cities Step (Bulk Upload)**: Clicking the persistent `+` button when on the `cities` step triggers the file selector. Selecting a file automatically switches the cities input card to the **Bulk Upload** tab, assigns the file to the inline cities file input, triggers its preview rendering, and enables the "Confirm Cities" button.
   - **Document Step**: Clicking the persistent `+` button when on the `document` step triggers the file selector. Selecting a file assigns it to the inline strategy document input, renders the preview, and enables the "Continue" button.
   - **Other Steps**: Clicking the persistent `+` button during other steps (e.g. business name, location) triggers a helpful Toast notice informing the user that files can be attached during the cities or document steps.
6. **Conditional Follow-up (Country to City)**:
   - **Case A (Country list)**: Entering countries (e.g. `India, USA, AUS`) in the regions tag input and pressing Confirm triggers the country-detection filter. The assistant immediately follows up with a cities inline card.
     - **Manual Entry**: User can type cities one-by-one in the tag input (e.g. `Mumbai, Delhi, New York`). The confirm button enables as tags are added.
     - **Bulk Upload**: Toggling to the "Bulk Upload" tab displays a file dropzone. Dragging or browsing a `.CSV` or `.XLSX` file renders a file preview and enables the confirm button, saving the file source name.
   - **Case B (Direct Cities list)**: Entering cities directly (e.g. `London, Paris, Tokyo`) in the regions tag input and pressing Confirm triggers the country-detection filter which realizes no countries were listed. The assistant automatically bypasses the cities follow-up step and transitions straight to the industry selection step.
7. **Complex Inline Layouts**: Tags input (regions/cities), grids (industry), and goals (multi-select) render inline inside the feed. Submitting tags/goals updates `state.answers` and appends a bubble.
8. **Custom Industry Follow-up**:
   - If the user selects `'Other'` in the industry selection grid, SmartBI prompts the user with the conditional `'Could you specify your industry?'` text question. Typing and submitting their custom industry details stores the response and correctly prints it in the Phase 5 Workspace Preview summary labels.
   - If any other industry category is chosen, the specifier question is automatically skipped.
9. **File Dropzone**: The document upload dropzone supports dragging/dropping files, rendering previews, and skip actions inline.
10. **Rollback Reversion**: Hovering over the "Business Name" bubble shows the edit pencil. Clicking it wipes the feed from that point onwards, clears subsequent answers, and focuses the bottom rail to update the business name.
11. **Input Height Consistency**: Checked the database credential forms on Step 2 of `onboarding.html` and the authentication forms in `login.html`. All text inputs and the password input (including its toggle visibility button) are now constrained to a unified $40\text{px}$ height (`h-10`) with vertical flex-centering, resolving the height disparity.
12. **Steppers Alignment**: The sidebar no longer displays any stray or duplicate locked input boxes, aligning perfectly with the provided design screenshot specs.
13. **Background Discovered KPIs Preview**: Added a preview modal that renders all background-discovered custom KPIs matching the category types. Includes interactive live search filtering and deterministic data record counts in parentheses.
14. **Interactive Stepper Clicks & Reversion**: Completed steps in the progress stepper sidebar are now fully interactive. Clicking a completed step triggers a transition back to that setup phase, runs corresponding initialization steps, and updates the stepper circle and label styling.
15. **Sidebar Menu & Links Addition**: Added the left navigation sidebar to `onboarding.html` and updated the sidebar navigation links across `dashboard.html`, `insights.html`, and `onboarding.html` to include Onboarding, Subscription, Guide Manuals, Contact Support Team, and Downloads.
16. **Footers in All Pages**: Inserted premium, responsive footers at the bottom of `dashboard.html`, `insights.html`, `onboarding.html`, and a copyright footer to `login.html`.
17. **Sidebar Menu Corrections**: Corrected menu item visibilities and ordering:
    - Removed `Dashboard`, `Insights`, and `Data Sources` links from the `onboarding.html` sidebar since they are irrelevant during onboarding.
    - Removed `Onboarding` link from `dashboard.html` and `insights.html` sidebars.
    - Re-ordered the `Data Sources` menu item to appear immediately after `Insights` in other sidebars.
18. **Style Guide Adherence & Visual Consistency Alignments**:
    - **Tailwind Class Normalization**: Replaced all occurrences of non-standard spacing and layout classes (such as `w-7.5`, `h-7.5` on metric card icons, and `w-1.2`, `h-1.2` on active query meters) with standard Tailwind utility classes (`w-8`, `h-8`, and `w-1.5`, `h-1.5`) across all HTML prototype files.
    - **Summary Card Spacing Fix**: Resolved the padding collapse on Data Sources summary cards by replacing the invalid `p-4.5` utility class with the standard `p-4` spacing class.
    - **Button Radius Alignment**: Adjusted the "Add New Connection" button border radius in `data_sources.html` from `rounded-xl` to `rounded-lg` to match dashboard navigation buttons.
    - **Calculated Metric Modal Alignment**: Updated the Calculated Field modal container in `dashboard.html` from `rounded-2xl` to `rounded-xl` to be consistent with the database configuration modal on the data sources page.
    - **Sidebar Toggle Syntax Resolution**: Patched the parsing syntax error on the `sidebar-toggle` listener in `data_sources.js` by properly closing the event listener and conditional logic blocks.
    - **AI Chat Companion Styling Alignment**: Refactored the Connection Assistant's message bubbles (both User and Assistant states) in `data_sources.html` and `data_sources.js` to match the exact visual design of the primary Insights page: using the standard purple `auto_awesome` circle icon, white background cards with outline borders, and a clean, high-contrast typography hierarchy.
    - **Card Text Wrapping Prevention**: Resolved card text wrapping issues (such as `15 mins` wrapping `ago` and `Google Analytics` wrapping `Analytics`) in both the Summary and Connector card lists of `data_sources.html`. Implemented responsive, container-width-aware CSS Grid classes (`.summary-metrics-grid` and `.connectors-grid` with `minmax(min(190px, 100%), 1fr)` and `minmax(min(140px, 100%), 1fr)`) inside `data_sources.css` and added `whitespace-nowrap` classes to titles, categories, and metrics, ensuring clean single-line visuals.

---

## Release Verification Results

1. **Stepper Interactive Clicks**:
   - Advanced onboarding to Phase 3 (Team Setup).
   - Stepper items 1 and 2 showed checkmarks. Hovering over Step 1 scaled up the circle and highlighted the header in primary purple.
   - Clicked on Step 1. The screen transitioned to Phase 1, reset `state.qIndex = 0`, and cleared subsequent answers. The stepper circles correctly updated: Step 1 active (pulse indicator) and Steps 2-5 reset to inactive gray numbers.
   - Clicked back on Step 2. The screen transitioned back to the main connection inputs panel (hiding success/error states) to allow editing.
2. **Background KPIs Preview Modal**:
   - Advanced to Phase 2, completed data source mock connection, and landed on the Success card.
   - Clicked the "Preview KPIs" button. A premium glassmorphic overlay modal popped up.
   - Checked KPI names: they correctly ended with deterministic record counts (e.g. `Annual Recurring Revenue (ARR) (124)`).
   - Typed "revenue" in the modal search bar. The list instantly filtered to show only revenue-related metrics.
   - Typed an invalid search query. The empty state panel properly popped up showing "No metrics match your search".
   - Clicked "Done Previewing" or the header close icon. The modal scaled down and faded away smoothly using GSAP.
3. **Sidebar Menu and Toggle**:
   - Verified the left sidebar menu renders on `onboarding.html` and aligns with `dashboard.html` and `insights.html`.
   - The collapse button (`#sidebar-toggle`) toggles sidebar width between `224px` and `60px` with GSAP fade animations for label items.
   - Checked that `onboarding.html`'s sidebar correctly omits `Dashboard`, `Insights`, and `Data Sources`.
   - Checked that `dashboard.html` and `insights.html`'s sidebars correctly omit `Onboarding`, and the `Data Sources` menu item is positioned immediately after `Insights`.
 4. **Footer Check**:
   - Checked the footer at the bottom of `dashboard.html`, `insights.html`, `onboarding.html`, and `login.html`. The copyright notice and policy links display correctly and wrap responsively on mobile.
 5. **Phase 4 KPI Confirm Button Styling Fix**:
   - Wrapped the confirm button label inside a new dedicated `<span>` element (`#p4-confirm-label`), isolating it from the arrow icon's `<span class="material-symbols-outlined">`. This ensures the dynamic text is rendered in the correct Inter font family, resolving the font style mismatch.
 6. **Phase 4 Collapse Back Button Fix**:
   - Registered the Phase 4 event listeners (including the `kpi-collapse` back button and the navigation buttons) once on `DOMContentLoaded` and checked for pre-existing bounds using `dataset.bound`. This resolves the initialization bug where listeners were skipped if `state.kpiData` was pre-initialized by the Phase 2 preview modal.
 7. **Phases 2, 3, and 5 Double-Binding Fix**:
   - Decoupled event listener registrations from the phase initializers (`initPhase2`, `initPhase3`, `initPhase5`) and consolidated them into `setupPhase2Controls()`, `setupPhase3Controls()`, and `setupPhase5Controls()` called once at DOMContentLoaded startup. This resolves all navigation issues (like `p4-back` Back to Team Setup) and selector freezes (like role selection toggles) during back-and-forth traversal.
 8. **Phase 5 Premium Launch Portal**:
    - Navigated to the final Phase 5 page and clicked "Launch SmartBI Workspace".
    - Verified that the `#launch-portal` full-screen overlay opens immediately, with beautiful pulsing backdrop glowing circles and spinning gradient launch borders.
    - Verified the step-by-step progress tracking: each of the 4 steps transitions from 30% opacity to 100%, updates the pending icon to an active spinning autorenew loader, increases the percentage indicator incrementally, and completes by displaying a green checkmark icon.
    - Verified that upon hitting 100% completion, the entire portal scales and fades out smoothly with GSAP before executing the final redirect to `dashboard.html`.
 9. **Login/Signup Redirection Flow**:
    - Verified that registering a new account in `login.html` (under the "Sign up" form state) shows the success toast and redirects the user to `onboarding.html` to initiate onboarding.
    - Verified that logging in with credentials or Google/SSO credentials correctly triggers the success toast and routes the user to `dashboard.html` as expected.
  10. **Data Sources Navigation and Interaction**:
    - Verified the "Data Sources" menu links in `dashboard.html` and `insights.html` successfully navigate the user to `data_sources.html`.
    - Verified the responsive collapsible sidebar toggle functions correctly on `data_sources.html` using the same GSAP animations.
    - Verified the "Sync Now" button on the PostgreSQL card initiates a simulated sync, spins the database icon, triggers toast logs, updates the summary timestamp, and prepends a new manual sync success record to the sync logs table.
    - Verified the "Upload New Version" button triggers a file upload selector, displays progress toast updates, and appends the new spreadsheet dataset to the synchronizations history log.
    - Verified the "Add New Connection" and card "Credentials" buttons successfully trigger the credentials modal popup with a scale-up entry, test connection loading animations, and save modifications feedback.
  11. **Scoped Connection Assistant (Data Sources Page)**:
    - Verified the Connection Assistant branding is applied (network `hub` icon, "Connection Assistant" title, "Syncs, credentials & connectors" subtitle).
    - Verified the quick suggestion prompt chips are updated to connection-relevant questions and yield targeted troubleshooting answers.
    - Verified that typing developer-level SQL queries (e.g. JOINs or SELECTs) triggers a polite boundary message directing the user to the Query Builder or Insights tab.
    - Verified interactive chat triggers: typing *"change host to staging.db.example.com"* correctly pre-fills the modal's Host/Server field and launches the modal overlay.
    - Verified manual sync trigger: typing *"run sync"* successfully initiates the database synchronization animation, toast message, and appends a manual sync log success row.
  12. **Dashboard Filters and Calculated Fields**:
    - Verified filter presets: clicking *"Add Filter"* toggles a dropdown showing Source and Region options. Clicking *"Source: Social"* injects a closeable purple filter chip, triggers a GSAP blur-loading animation, updates metric card values (e.g. Revenue: $31,130, Users: 2,058), and scales chart columns.
    - Verified filter removal: clicking the `x` on the filter chip smoothly removes it, runs the blur-loading transition, and restores original values.
    - Verified Calculated Metric modal: clicking *"Calculated Metric"* in the sidebar opens the modal overlay with a back bounce animation.
    - Verified calculations & card injection: entering Metric A (Revenue), Metric B (Orders), choosing template (Divide), naming the metric *"Average Order Value"*, and clicking *"Create Metric"* closes the modal, runs formula calculations, appends a new card to the metrics grid showing the formula and the calculated value ($43.73), and triggers a success toast.
    - Verified deletion: hovering on the calculated metric card reveals a delete button that removes it from the DOM with a shrink transition.
  13. **Visual Consistency & Syntax Verification**:
    - Ran Node checks to confirm syntax validation of `data_sources.js`, `insights.js`, and `dashboard.js`.
    - Inspected rendering coordinates to ensure standard Tailwind classes (`w-8 h-8`, `w-1.5 h-1.5`, `p-4`) compile without empty dimensions.
    - Verified that user and assistant message bubbles inside the right-hand panel of `data_sources.html` render using premium glassmorphic border elements and correct color variables.
  14. **Case Study Navigation Integration**:
    - Embedded the full case study navigation header into `FInal HTML/design_system.html`.
    - Updated CSS stylesheet links to relative paths (`../tokens.css` and `../components/nav/nav.css`) to load navigation styling.
    - Re-aligned HTML body layout of `design_system.html` to separate header from scrollable content, wrapper layout allows sidebar and main panes to scroll independently with the progress bar.
    - Standardized navigation headers across all case study pages (`index.html`, `mindmap.html`, `wireframe.html`, `prototype.html`, `figma-design.html`) to consistently show "Sayantan Ghosh" linking to `uxsayantan.com`.
    - Enforced a standard `line-height: 1.2 !important;` on all key navigation header components to maintain size parity between pages with Tailwind CSS resets and vanilla CSS.
    - Aligned the "AI Driven Prototype" CTA button to the SmartBI product style guide: solid purple background (`#7c3bed`), 8px `rounded-lg` borders, semibold weight, and `text-xs` font size.
    - Replaced the generic `design_services` material symbol icon in the design system page sidebar with the official SmartBI product logo (`images/favicon.svg`) and aligned the brand/system text hierarchy.
    - Added a clean "Back to Case Study" link at the top of the login card in `login.html` to allow users to navigate back to the case study homepage easily.

