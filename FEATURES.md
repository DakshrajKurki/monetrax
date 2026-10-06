# Monetrax Feature Verification Checklist

## Theme & Visual Foundation
- [x] Near-black page canvas (`#050706`)
- [x] Rounded glass stage frame (`#0B0F0D`, 32px radius, `1px rgba(255,255,255,0.08)` border)
- [x] Soft drifting sage/grey-green gradient glows (`#3E4F45`, `#7F9488`, `#C4D2C8`), 40-60s loop behind content with `pointer-events: none`
- [x] Centered floating pill nav
- [x] Light-weight "Inter Tight" font (300-500)
- [x] Glass panels (`rgba(255,255,255,0.03)`, `blur(18px)`, 24px radius)
- [x] Pill buttons: solid white + dark glass
- [x] Small glass chips joined by thin curved lines with travelling dots
- [x] Risk tokens used only on real risk (Amber `#E8A33D`, Red `#E5484D`, Mint `#7EE0B0`)
- [x] Exact CSS variable tokens in `index.css` and `tailwind.config.js`

---

## Wave 0: Data Foundation
- [x] Zustand unified typed store feeding all screens
- [x] ~2,000 historical transactions, ~80 accounts, 12 banks, ~25 countries (simulated geography labelled), 6 payment formats
- [x] ~150 flagged cases spread across 30 days
- [x] Live stream generator injecting 1 transaction every 1.5–3 seconds
- [x] Labelled typologies: Structuring (<$10k smurfing), Cyclic Flow (A->B->C->A), Mule Fan-In/Fan-Out, Rapid Pass-Through, Dormant-Then-Burst
- [x] SHAP factors with real feature names: `structuring_score`, `cyclic_flow_score`, `peer_cohort_zscore`, `from_count_24h`, `benford_deviation`, `flow_imbalance`, `log_amount`
- [x] Formatting helpers: currency ($ and commas), compact (1.2K, 3.4M), relative time with exact time tooltip, tabular-nums, percentages to 1 decimal
- [x] Reusable table capabilities: sticky header, click-to-sort columns, pagination (25/page), row density toggle, column show/hide, CSV export, hover states, skeleton rows, empty states
- [x] Reusable chart rules: labelled axes with units, tooltips, legends, low-opacity gridlines, animated draw-ins, data window caption ("last 24 hours, simulated data")
- [x] Store-computed KPIs with sparklines and period deltas, clicking pre-filters Case Queue
- [x] Global filter bar (time range, risk band, typology, country, status) synced to URL with removable chips
- [x] Live indicator with heartbeat pulse, events/min, last event timestamp, pause/resume toggle

---

## Wave 1: Shell, Scrolling, Transitions
- [x] Every view scrolls freely (wheel, trackpad, keyboard), no overflow hidden on body, custom thin scrollbar
- [x] 3D canvases in bounded containers with OrbitControls zoom toggle button to prevent scroll interception
- [x] Framer Motion `AnimatePresence mode="wait"` keyed by `location.pathname` with blur and translation
- [x] Staggered 60ms reveal transitions, whileInView animations
- [x] Header nav active indicator with Framer Motion `layoutId="activeNavPill"`
- [x] Shared element `layoutId` on case cards and detail views
- [x] Number count-up components and animated circular score dials
- [x] Command Palette (`Cmd+K` / `Ctrl+K`) to jump to pages, cases, accounts
- [x] Toast notification system for analyst feedback
- [x] Notification center dropdown with unread badge count
- [x] `prefers-reduced-motion` compliance

---

## Wave 2: Core Screens
- [x] **Command Center**:
  - [x] Hero headline, dual pill buttons, drifting atmospheric glow
  - [x] 4 corner AI agent chips (Structuring, Cycle, Mule, Sanctions) with live counts and pulsing connectors
  - [x] KPI row with live sparklines and delta indicators
  - [x] Live transaction ticker and activity feed
  - [x] Typology breakdown bar/area chart
  - [x] Risk-distribution donut chart
  - [x] Alerts-by-hour heatmap (hour x weekday)
  - [x] Top-10 riskiest accounts leaderboard
  - [x] Mini world map of flagged activity
  - [x] Streaming AI Situation Brief
- [x] **Case Queue**:
  - [x] AI-priority ranking with explicit "why ranked here" reasoning
  - [x] Natural language search parsed into removable filter chips
  - [x] Saved views (High Risk, Unassigned, SLA Urgent, etc.)
  - [x] Bulk multi-select actions (Auto-triage, Escalate, Assign)
  - [x] Table vs Kanban view toggle (New, Under Review, Escalated, SAR Filed, Cleared) with drag-and-drop
  - [x] SLA countdown badges
  - [x] AI-suggested action chips
  - [x] Bulk AI auto-triage modal with confirmation step
- [x] **Case Detail**:
  - [x] Animated SVG risk dial (0 to score)
  - [x] Real SHAP feature attribution bars with baseline comparisons
  - [x] Streamed AI investigative narrative
  - [x] Interactive Counterfactual "What-If" sliders (Amount, Velocity) recomputing risk dynamically
  - [x] Peer-cohort scatter plot with entity outlier highlighting
  - [x] Related transaction chronological timeline
  - [x] Sanctions & PEP screening verification panel
  - [x] Entity overview card and investigator notes
  - [x] Timestamped immutable audit trail
  - [x] "Generate SAR draft" action button
  - [x] "Show on Globe" deep link
- [x] **Global Surveillance Globe**:
  - [x] Bounded 3D globe with Orthographic Radar Fallback
  - [x] Pulsing geo-markers for flagged entities
  - [x] Animated Quadratic Bezier settlement arcs with travelling particles
  - [x] Camera fly-to animation (rotate then zoom, 1.5–2.5s) on click
  - [x] Slide-out glass inspection side panel
  - [x] "Back to world view" reset camera button
  - [x] Geographic filtering and country volume heatmap toggle

---

## Wave 3: Investigation Features
- [x] **Network Graph**:
  - [x] Interactive 2D force-directed / canvas graph & 3D sphere space toggle
  - [x] Click node to expand counterparties and highlight suspicious clusters in red
  - [x] Node and edge inspect tooltips and side drawer
  - [x] Typology Replay (Structuring, Cyclic loop, Mule fan-in/out) with play/pause/scrub
- [x] **Account 360 Pages** (`/account/:id`):
  - [x] Account risk history sparkline and score
  - [x] Behavior baseline vs last 7 days (baseline drift analysis)
  - [x] Direct counterparties breakdown table
  - [x] In/Out net flow volume balance
  - [x] Linked compliance cases list
  - [x] Sanctions and PEP watchlist check status
- [x] **Typology Library** (`/typologies`):
  - [x] Deep-dive cards for each typology (Structuring, Cyclic Flow, Mule, Rapid Pass-Through, Dormant Burst)
  - [x] Plain-language mechanism breakdown and algorithmic detection features
  - [x] Real-time incident counts from live stream
  - [x] "View Examples" button pre-filtering Case Queue
- [x] **Sanctions & PEP Screening** (`/sanctions`):
  - [x] Fuzzy search over mock OFAC/UN/EU watchlist
  - [x] Match confidence percentage score and alias inspection
  - [x] Real-time screening audit log
- [x] **SAR Center** (`/sar`):
  - [x] Active SAR drafts list with submission deadlines
  - [x] FinCEN-style formatted narrative preview
  - [x] Export to PDF / print formatted document
- [x] **Analytics & Reports** (`/analytics`):
  - [x] False-positive rate (FPR) trend over time
  - [x] Alerts vs Cleared vs Escalated funnel
  - [x] Mean time to triage (MTTT) and SLA compliance
  - [x] Compliance analyst workload distribution
  - [x] Cross-border corridor flow breakdown
  - [x] Exportable executive compliance summary

---

## Wave 4: Model Lab & Live Monitoring
- [x] **Model Lab** (`/model`):
  - [x] Multi-model ensemble architecture diagram (XGBoost + Isolation Forest + Autoencoder + Logistic Meta-Learner + GNN planned)
  - [x] Precision-Recall AUC (PR-AUC: 0.78 / 0.66 / 0.83) & Precision@20 (~85%)
  - [x] Interactive Decision Threshold slider with live Confusion Matrix and F1 calculation
  - [x] "Accuracy Trap" educational callout
  - [x] Global SHAP feature importance breakdown
  - [x] Model comparison benchmark table (Decision Tree, Random Forest, KNN, SVM, XGBoost)
  - [x] Demographic & cohort fairness audit across bank tiers
  - [x] Academic concepts applied table with Built / Future Work tags
- [x] **System Health & Pipeline** (`/system`):
  - [x] Ingestion throughput (tx/sec) and processing latency (ms)
  - [x] Model drift monitor (Population Stability Index / PSI per feature)
  - [x] Alert queue backlog gauge
  - [x] Stream health and worker status
- [x] **Settings Modal / View** (`/settings`):
  - [x] Dynamic risk alert threshold
  - [x] Stream simulation speed adjustment (Fast, Normal, Slow)
  - [x] Motion level preference (Full, Reduced)
  - [x] AI operational mode toggle (Live Gemini API vs Offline Mock)
  - [x] Reset demo data store action

---

## Wave 5: "Risky" AI Assistant & End-to-End AI
- [x] Persistent floating glass launcher with soft pulse
- [x] Slide-out chat panel aware of current route, active case, and filter context
- [x] Contextual suggested prompts that update per view
- [x] Streaming response simulation / Gemini integration
- [x] Thinking state indicator and source attribution chips
- [x] Defensible compliance wording ("indicators consistent with...", never accusatory)
- [x] Tool / Function Calling:
  - [x] `open_case(id)`
  - [x] `fly_to_location(lat, lng)`
  - [x] `replay_typology(typology)`
  - [x] `generate_sar(caseId)`
  - [x] `run_auto_triage()`
  - [x] `summarize_window()`
  - [x] `filter_cases(query)`
  - [x] `open_account(accountId)`
  - [x] `screen_name(name)`
- [x] Express proxy (`/api/ai`) with Flash-tier model, `.env` key isolation, and offline fallback mode
- [x] "AI-generated - verify before action" labels on all AI outputs
- [x] Mandatory analyst confirmation for all destructive actions

---

## Wave 6: "Fly to Location" Globe-to-Real-Map Dive Feature
- [x] **Universal Trigger Points (`/globe?case=ID&view=map`)**:
  - [x] Case Detail ("Show on Globe" navigates to `/globe?case=ID&view=map`)
  - [x] Case Queue rows (Globe button navigates to `/globe?case=ID&view=map`)
  - [x] Live Feed Ticker ("Show on Globe" navigates to `/globe?case=ID&view=map`)
  - [x] Notification Bell (Notification fly-to button navigates to `/globe?case=ID&view=map`)
  - [x] Risky Copilot (`fly_to_location` tool navigates to `/globe?case=ID&view=map`)
  - [x] Dashboard Mini-Map (Corridor arcs and nodes navigate to `/globe?case=ID&view=map`)
  - [x] Account 360 (Linked cases table globe button navigates to `/globe?case=ID&view=map`)
  - [x] Global Corridors Table ("Fly to Location" row button navigates to `/globe?case=ID&view=map`)
  - [x] Shareable URL: Direct navigation to `/globe?case=ID&view=map` plays full dive sequence
- [x] **4-Second Continuous Dive Sequence**:
  - [x] 0.0s – 1.8s: 3D globe camera eases to location, ripples marker, draws settlement arc
  - [x] 1.6s – 2.6s: Cross-fade from globe to real map (globe scales 1->1.12 & fades out; map fades in & zooms 4->15)
  - [x] 2.6s – 4.0s: Settle on location, drop pulsed marker, 500m activity perimeter circle, slide in glass side panel
  - [x] "Skip Animation" pill button and `Esc` key listener for instant bypass
  - [x] "Back to 3D Globe" button and browser Back reverses smoothly to globe mode
- [x] **Unified Map Architecture & Dual Engine**:
  - [x] Google Maps JS API (@googlemaps/js-api-loader) with vector `mapId`, dark roadmap, and Advanced Markers
  - [x] MapLibre GL JS fallback with free Esri Dark Gray Canvas & Esri World Imagery satellite tiles (watermark-free)
  - [x] Fallback map chip indicator
  - [x] Controls: Roadmap / Hybrid / Satellite toggle (default Hybrid)
  - [x] Focus controls: Destination / Origin / Both (fitBounds on endpoints with connecting polyline)
  - [x] Zoom +/- buttons, Reset view, Fullscreen toggle
  - [x] Non-blocking cooperative gestures (`gestureHandling: 'cooperative'` & `cooperativeGestures: true`)
  - [x] Toggleable layers for simulated nearby accounts and bank branches with tooltip linking to `/account/:id`
  - [x] "Simulated location — not a real transaction" disclaimer chip
  - [x] Haversine origin-to-destination distance calculation
  - [x] Environment variables configured in `.env` and `.env.example`
  - [x] Setup documented in `README.md`

---

## Wave 7: Visual Perfection & Refinements (Verified with Screenshots)
- [x] **1. Cursor Spotlight Effect**:
  - Fixed full-viewport div rendered at app root with `z-index: 20` and `pointer-events: none`
  - RAF-throttled update of `--cx` and `--cy` CSS variables in pixels on mousemove
  - `radial-gradient(600px circle at var(--cx) var(--cy), rgba(127,148,136,0.16), transparent 70%)` with `mix-blend-mode: screen`
  - 100ms smooth transition trailing cursor
  - Disabled on touch (`@media (hover: none)`) and under `prefers-reduced-motion`
  - Verified: `proof_1_spotlight_pos1.png` and `proof_1_spotlight_pos2.png`
- [x] **2. Page Transitions & Motion Architecture**:
  - Route wrapper with `<AnimatePresence mode="wait">` keyed by `location.pathname`
  - Page enter: opacity 0->1, y 24->0, blur(8px)->blur(0), 450ms, ease `[0.22, 1, 0.36, 1]`
  - Page exit reversed: opacity 1->0, y 0->24, blur(0)->blur(8px), 450ms, ease `[0.64, 0, 0.78, 0]`
  - Nav active-item highlight slides with framer-motion `layoutId="activeNavPill"`
  - Case card to detail uses shared `layoutId="case-card-${id}"`
  - Verified mid-transition frame: `proof_2_mid_transition.png`
- [x] **3. Specialized Modules Dropdown (Investigation Menu)**:
  - Portaled directly to `document.body` via `createPortal`
  - Opaque background `rgba(10,14,12,0.96)`, `backdrop-filter: blur(24px) saturate(140%)`, 1px border, 20px radius, shadow `0 24px 60px rgba(0,0,0,0.6)`
  - Dedicated `--z-dropdown: 1100`, nav at 1000, page content at 0-40
  - `isolation: isolate` on header to preserve stacking context
  - Verified: `proof_3_investigation_dropdown.png`
- [x] **4. Globe Zero-Scroll Layout**:
  - Globe section is the first element directly under fixed nav
  - Sized to fill remaining viewport height (`calc(100vh - 140px)`)
  - Supporting content stays below the globe reachable by scrolling down
  - `window.scrollTo(0, 0)` on mount
  - Verified: `proof_4_globe_zero_scroll.png` (`window.scrollY === 0`)
- [x] **5. Compact Heatmap Grid & Raised Leaderboard**:
  - Literal CSS `.heatmap-grid` (`44px repeat(24, minmax(0, 1fr))`, `grid-auto-rows: 22px`, `gap: 3px`)
  - Total component height ~200px (strictly <= 260px)
  - Color scale capped: strictly top 5% (8 cells) red, next 20% (34 cells) amber, and 75% sage shades
  - Section below (Global Threat Vector Map and Top Riskiest Accounts Leaderboard) sits in view without blank space
  - Verified: `proof_5_compact_heatmap_and_leaderboard.png`
- [x] **6. High-Contrast Chatbot Sent Bubbles**:
  - User message bubble styled with solid `var(--sage-2)` (`#7F9488`), `#0A0D0C` text, full opacity, right-aligned, `rounded-2xl rounded-br-sm`
  - Risky message styled as glass-panel left-aligned with high-contrast timestamp
  - Verified: `proof_6_chat_bubble_contrast.png`
- [x] **7. User Profile Dropdown Panel**:
  - Dedicated trigger button `button[data-testid="profile-btn"]` opening portaled dropdown (`--z-dropdown: 1100`)
  - Displays "DS" avatar, "Dakshraj Singh Chandawat", "AML Analyst", "ANALYST-0142", "Financial Crime Unit"
  - Store-backed performance metrics: Reviewed, SARs Filed, Avg Triage
  - Menu items: Settings & Preferences, Appearance: Dark Glass, Sign Out
  - Verified: `proof_7_profile_panel_open.png`
- [x] **8. Fictional Entities & Global Banks Diversity**:
  - 84 unique fictional entity names generated with zero repeats
  - 12 fictional international bank institutions in `GLOBAL_BANKS`
