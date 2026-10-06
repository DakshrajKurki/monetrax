# Monetrax — AI-Native Anti-Money Laundering (AML) Command Center

Monetrax is an AI-native financial crime command center designed for compliance officers and financial crime investigators. Built to pair-program compliance investigations with **Risky**, an autonomous AI copilot that investigates suspicious activity, drafts FinCEN SAR narratives, inspects entity networks, and performs spatial vector analysis.

---

## Key Features

1. **"Fly to Location" Seamless Globe-to-Map Dive**:
   - Continuous 4-second sequence transitioning from a Three.js 3D global surveillance sphere into a high-resolution dark surveillance map.
   - **Phase 1 (0.0s – 1.8s)**: 3D globe camera eases to target settlement vector; origin-to-destination settlement arc animates.
   - **Phase 2 (1.6s – 2.6s)**: Cross-fade transition; globe scales `1 -> 1.12` and fades out; real map fades in at the exact coordinates and zooms smoothly from `4 -> 15` via `requestAnimationFrame` easeInOut cubic.
   - **Phase 3 (2.6s – 4.0s+)**: Settles on location with custom pulsing HTML pins, 500m activity perimeter circle, nearby beneficiary accounts, clearing branches, and sliding glass side panel with Haversine distance and AI narrative.
   - **Skippable**: Click "Skip Animation" pill or press `Esc`.
   - **Reverse**: Click "Back to 3D Globe" or use browser Back to smoothly return to global surveillance.
   - **Shareable URLs**: Direct navigation to `/globe?case=TXN-84200&view=map` plays the identical continuous dive sequence.

2. **Dual-Engine Unified Map Architecture (Zero Breakage Fallback)**:
   - **Primary Engine**: Google Maps JavaScript API via `@googlemaps/js-api-loader` with vector `mapId`, dark roadmap styling, and Advanced Markers.
   - **Fallback Engine**: MapLibre GL JS with free Dark Matter (CartoDB) & Esri World Imagery tiles. Automatically activates whenever the Google Maps API key is omitted, unauthorized, or offline.
   - **Non-Blocking Gestures**: Configured with cooperative gestures (`gestureHandling: 'cooperative'` / `cooperativeGestures: true`) so trackpad and mouse wheel page scrolling is never blocked.

3. **Universal Trigger Points**:
   - Case Detail (`/detail/:id`): "Show on Globe"
   - Case Queue (`/queue`): Row action globe button
   - Live Alert Ticker (`/`): "Show on Globe" button
   - Dashboard Mini-Map (`/`): Interactive settlement arcs and coordinate nodes
   - Top Header Notification Bell: Quick-dive globe button for every flagged threat
   - Risky Copilot: `fly_to_location` tool execution
   - Account 360 (`/account/:id`): Linked cases table globe button
   - Command Palette (`Cmd+K` / `Ctrl+K`): Case item quick-dive button
   - Global Corridors Table (`/globe`): "Fly to Location" action buttons

4. **Near-Black Sage-Glass UI**:
   - Near-black canvas `#050706` with rounded glass stage `#0B0F0D` (radius 32px, 1px subtle border).
   - Drifting sage gradient glow orbs behind content.
   - Floating pill navigation bar and light-weight sans typography (Inter Tight).

---

## Map Configuration Guide

### 1. Google Maps JS API (Optional)
To use Google Maps Vector Maps:
1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Maps JavaScript API**.
3. Create an API Key in Credentials.
4. Under **Map Management**, create a **Vector Map ID** with Dark Roadmap or custom styling.
5. In your `.env` file (copied from `.env.example`):
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=AIzaSy...your_key_here
   VITE_GOOGLE_MAP_ID=your_vector_map_id_here
   ```

### 2. MapLibre GL Fallback (Zero Setup Required)
If `VITE_GOOGLE_MAPS_API_KEY` is not provided, is left as the placeholder, or fails loading:
- Monetrax automatically falls back to MapLibre GL JS.
- Utilizes free CartoDB Dark Matter tiles and Esri World Imagery satellite tiles.
- Displays a subtle `"Fallback Map (MapLibre GL)"` badge in the map toolbar.
- Fully functional without any API keys or credit cards required.

---

## Development & Verification

### Running the App

1. Start the Gemini AI Express backend:
   ```bash
   node server.cjs
   ```
   (Runs on `http://127.0.0.1:3001`)

2. Start the Vite development server:
   ```bash
   npx vite --port 5173 --host
   ```
   (Runs on `http://localhost:5173`)

3. Run the automated headless browser verification suite:
   ```bash
   node verify_views.cjs
   ```
