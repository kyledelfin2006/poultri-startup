# Poultri mobile UI/UX instructions for Claude

## Goal

Use [poultri-ui-reference.png](poultri-ui-reference.png) as the visual source for the three main app screens: **Home**, **Temperature history**, and **Poultri Buddy**. Recreate the same structure, content, visual order, labels, palette, and navigation, then improve fit and finish. “Enhanced” means better spacing, hierarchy, typography, readability, touch feedback, accessibility, and responsive behavior. Do not change the product or introduce content that is absent from the reference or current app.

Use `mvp-requirements.md` for current demo behavior and `build-requirements.md` for architecture and the bridge contract. Keep the existing House 1 detail and Bridge setup flows. Do not change the Wokwi or bridge behavior to make the screens look right.

## Main navigation and screen map

The three main destinations shown in the reference are **Home**, **History**, and **Buddy**, with a bottom navigation bar on each main screen and the active destination clearly selected.

- **Home** is the existing House overview (`/`).
- **History** is the requested separate 24-hour temperature view.
- **Buddy** is the requested chicken-companion concept screen.
- Keep the existing House 1 detail (`/house-1`) and Bridge setup (`/bridge-setup`) as linked secondary screens. “View House 1” opens the existing detail screen. Keep the current bridge setup accessible without adding a separate settings product or workflow.
- The Home `24h history` action opens History. The buddy card opens Buddy. The History `Ask Buddy about this trend` action opens Buddy.

Do not add additional tabs, onboarding, accounts, farm or house pickers, dashboards, or settings screens.

## Home screen

Match the first phone in the reference:

- Show the exact official Poultri logo and wordmark in the small white brand area, with the existing settings/connection entry icon at the right.
- Use the heading **House overview**, its short supporting line, and a visible source label. Show **Local ESP32 + DHT22** for physical readings, **Wokwi simulated data** for Wokwi readings, and a waiting label before the first sample.
- Show one prominent House 1 card. Keep the house name, connection state, sample age, large current temperature and unit, and a small temperature trend together. Do not show a demo-setpoint badge on Home or House 1 detail.
- In the two compact lower metrics, show **Airflow (simulated)** as a qualitative status (the reference shows **Moderate**) and **Fan speed (simulated)** as a percentage. Derive both from the existing `fanSpeedPct`; airflow is not a measured sensor value. Keep the humidity sensor reading available on the existing House 1 detail screen.
- Place the **View House 1** and **24h history** actions below the main reading area as shown.
- Include the **Your Poultri buddy** teaser with the simple chicken character and short invitation to explore the readings.
- Finish with the Home / History / Buddy navigation dock.

All readings, timestamps, status, trend lines, and percentages must come from available local bridge samples, with the source shown accurately. Values drawn in the reference, including 26.1°C and 50%, are examples for layout and must not be hard-coded as live readings.

## Temperature history screen

Match the second phone in the reference:

- Title **Temperature history**, subtitle **House 1 · [current source]**, and a compact sample-status label that distinguishes physical readings from simulation.
- Lead with **Last 24 hours**, the latest temperature sample, and its timestamp context.
- Show a readable temperature line chart with a time axis covering the selected window and a clearly labeled **Demo setpoint 25°C** reference line.
- Include the 6h / 12h / 24h range selector shown in the reference, with 24h selected initially.
- Under the chart show **Min**, **Average**, and **Max** summaries, then a short note describing locally received sample history and its availability.
- Include the **Ask Buddy about this trend** card and the shared Home / History / Buddy navigation dock.

The app currently receives the latest sample from the bridge. Never create or display a fabricated temperature series, min/average/max, timestamp, or full 24-hour coverage. Use actual samples received by the app. When the selected period has too little or no data, preserve the chart layout and show a clear collecting / unavailable state. Keep history local to the demo; do not add a cloud service or invent a long-term retention policy.

## Poultri Buddy screen

Match the third phone in the reference:

- Header title **Poultri Buddy** and a small **AI concept preview** badge.
- Use one simple, friendly chicken character: cream/white body, dark green dot eyes, yellow beak, simple rounded wings, and a red crest matching the Poultri mark. Keep the illustration simple and uncluttered.
- In a white message card show **Hi! I’m your Poultri buddy.** and **Ask me about the simulated readings.**
- Include the three prompt cards shown: **Explain this reading**, **Summarize the last 24 hours**, and **How does the demo work?**
- Include the message composer with **Ask your buddy…**, a send affordance, a small **Conversation preview** label, and the shared Home / History / Buddy navigation dock.

Keep this screen clearly marked as a concept preview. The app has no AI service or defined response behavior. Do not add a model, backend, fabricated answers, diagnosis, husbandry advice, or claims that the buddy is analyzing real farm conditions. Keep the pictured controls as UI affordances until a response implementation is explicitly specified.

## Existing House 1 and bridge behavior

Keep the current House 1 detail content and interactions: source-aware temperature and humidity, the inspection behavior driven by the demo setpoint without displaying its numeric threshold, connection and sample age, reference reading, inspection prompt with acknowledgement expiring after 60 seconds, recovery, and the Bridge setup entry. If the fresh reading is below setpoint at acknowledgement expiry, clear the acknowledged prompt; if still active, return to INSPECT. For physical ESP32 samples, show the GPIO 26 fan-relay command as ON/OFF; for Wokwi samples, keep the simulated fan percentage. The vent remains an app-only visual. Keep the bridge setup URL, connection status, connect/reconnect, and Reset session actions.

Preserve shared demo-session state and the existing bridge contract. Preserve waiting, connected, stale, disconnected, active prompt, acknowledged, recovered, and reset states. Missing readings remain unavailable and use a dash with an explanation. Last-known values remain clearly marked stale or disconnected.

## Visual rules

- Follow the reference’s **light** appearance: warm white and pale sage surfaces, evergreen text and large reading areas, leaf green, and bright lime accents. Keep red for the buddy crest and official brand artwork only; do not introduce red/orange interface panels.
- Preserve the official Poultri artwork exactly using the supplied assets. Never redraw, tint, recolor, crop into a replacement logo, or change the wordmark.
- Keep rounded cards, clear spacing, compact supporting labels, and strong contrast. Improve typography and alignment without changing the screen composition or copy hierarchy.
- Retain the existing dark theme where supported, adapting the same palette relationships without changing screen contents.
- Use existing React Native primitives and installed dependencies. Do not add font, chart, icon, or animation packages for appearance alone.
- Respect larger text, narrow phones, landscape, screen-reader order and labels, and comfortable touch targets. Use text as well as color for connection and inspection states.

## Scope guardrails

- Make visual and navigation changes needed to match the reference and the three requested main destinations only.
- Do not add extra metrics, time ranges beyond those pictured, charts for other readings, alerts, controls, sensors, farm records, camera features, or new workflows.
- Do not change the bridge API, Wokwi firmware rules, setpoint, alert lifecycle, or existing House 1 / bridge behavior for this UI task.
- Keep the 25°C inspection setpoint and 32°C fan-relay threshold identified as demo behavior, never as farm settings or poultry-health limits. The app reports the physical relay command but does not control it or verify fan rotation; Wokwi fan values remain simulated.
- Do not copy illustrative values from the reference into app state or imply that mockup content is recorded data.

## Technical workflow

- Use Expo Router for navigation. Screen files live in `mobile/src/app/`; shared UI and state stay outside the route directory.
- Before changing an Expo, EAS, or React Native API, check the installed Expo version and consult its matching official documentation.
- Preserve Expo Go development and the existing EAS APK profile. Keep generated native projects under the existing config/plugin workflow.
- Keep `README.md`, `mvp-requirements.md`, `build-requirements.md`, and `implementation.md` aligned with any behavior or setup change. Run the mobile lint and TypeScript checks before reporting code changes complete.

## Visual acceptance

- Home, Temperature history, and Poultri Buddy follow the reference’s content, layout, and shared bottom navigation, with light-mode styling as the primary target.
- The Home fan metric shows ESP32 relay ON/OFF for physical readings and simulated percentage for Wokwi; actual humidity remains accessible on House 1 detail.
- The history chart and summaries only show actual samples and clearly describe any missing coverage.
- Buddy remains a clearly labeled concept preview with the requested simple red-crest chicken and no invented AI answers.
- House 1 detail, bridge connection, prompt acknowledgement/recovery, and Reset session continue to retain their current behavior.
