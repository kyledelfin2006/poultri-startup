# Poultri prototype implementation brief

## Current baseline

The repository contains a branded Expo / React Native TypeScript app in `mobile/`, an Arduino IDE sketch for a physical ESP32/DHT22 in `arduino/`, the Wokwi simulator in `wokwi/`, and a standard-library Node bridge in `bridge/`. Either sensor source posts to the bridge, and the app shows the current source, reading, and illustrative inspection prompt. Expo Go support and an EAS Android APK profile are included.

## Current limits

This is a demonstration prototype, not a farm-monitoring product. A local DHT22 can provide physical readings, or Wokwi can simulate them; neither path is farm-validated. The physical ESP32 switches a fan through a GPIO 26 relay at a demo 32°C threshold and reports the relay command to the app. The app does not control the relay or verify fan rotation; the vent remains an app-only visual. There is no camera analysis, ammonia/CO₂ measurement, SMS, production data, validated rule, offline-operation proof, or farm trial. Do not describe it as a deployed or farm-validated system.

## Implemented in this build

- `mobile/src/app/index.tsx` and `mobile/src/app/house-1.tsx`: House 1 overview and detail screens. The overview presents temperature, humidity, source-aware fan state, data status, and prompt state in a deep evergreen card with a decorative house line drawing. Physical samples show the ESP32 relay command as ON/OFF; Wokwi samples show simulated percentage. The detail presents a temperature hero, sample age, inspection state, a fan drawing that follows relay/simulation state, an app-only vent visual, and a compact bridge entry. Both inspection logic and the physical relay use 32°C, without a demo-setpoint badge on either screen. The fan drawing stops for stale/disconnected data and reduced motion.
- `mobile/src/app/bridge-setup.tsx`: redirects to Settings, which holds the bridge URL, connection status and controls, and the confirmed session reset (merged from `ui-visual-accessibility`).
- `mobile/src/demo-session.tsx`: shared bridge polling and session state, so navigation retains readings, the reference sample, acknowledgement, recovery, and reset state.
- `mobile/src/ui.tsx`: shared light and dark palettes, the type scale (Nunito ExtraBold headings), Ionicons-based chevron and status icons, unchanged logo and wordmark, and common screen controls.
- `bridge/server.mjs`: sends `access-control-allow-origin: *` and answers `OPTIONS` preflight so the Expo web preview (`npx.cmd expo start --web`) can reach the bridge from the browser.
- `mobile/app.json` and `mobile/src/app/_layout.tsx`: support portrait and landscape, enable Android predictive Back, and configure the SDK-matched Expo System UI module for automatic appearance.
- `mobile/plugins/with-local-bridge-http.js`: Expo config plugin for Android local-LAN HTTP in the preview APK.
- `bridge/server.mjs`: dependency-free Node HTTP bridge on port 4174 with health, latest-reading, and input validation for sensor readings, setpoint, alert state, and fan percentage.
- `arduino/PoultriESP32/PoultriESP32.ino`: Arduino IDE sketch for a physical DHT22 on GPIO 4 and relay command on GPIO 26. The inspection prompt and relay both switch ON at 32°C or above and OFF below 32°C; readings are sent to the local bridge every 2.5 seconds over Wi-Fi. `bridge/serial-forwarder.ps1` provides a USB serial route when Wi-Fi is not configured.
- `wokwi/`: ESP32/DHT22/LED PlatformIO project, diagram, and firmware. The firmware samples every two seconds and mirrors the same 32°C prompt/fan threshold with a simulated 0/100% LED, then posts readings through Wokwi networking to the local bridge.
- Demo features: open the House 1 overview and detail to show physical or simulated temperature/humidity, the shared 32°C inspection/fan threshold, relay ON/OFF status or Wokwi simulated fan state, and live/stale state. Use Bridge setup to connect or reset the app session. The fan drawing follows the reported state, while the vent remains app-only; acknowledge a prompt, see its acknowledgement expire after one minute while active, and show recovery below 32°C. The official logo and wordmark are included from supplied assets unchanged.
- The README uses `assets/poultri_full_logo.png` and documents the physical Arduino, local bridge, Wokwi fallback, mobile, and repeat-demo setup.
- `mvp-requirements.md`: scope, acceptance criteria, and the under-two-minute presenter flow.
- `build-requirements.md`: mobile/Arduino/Wokwi/bridge architecture, setup, data contract, run instructions, verification sequence, and a future AI-chatbot plan. Chat is documented for later and is not implemented in this demo.

The supplied Poultri logo and wordmark are used as existing image assets without modification. No desktop simulator, account system, cloud broker, database, push notifications, camera, gas sensor, farm records, physical vent, servo, or AI service is included. The fan relay and inspection prompt share a user-chosen 32°C demo threshold, not farm guidance. The app receives the relay command but has no fan-rotation feedback. The proposed offline-operation, pilot, alert-timing, and detection targets remain future evaluation work.

The generated Android project was refreshed from Expo config. Its manifest enables HTTP for the private-LAN bridge and removes old Firebase/notification metadata; Expo's permission-removal directives block unused storage, overlay, and vibration permissions from the final merged manifest.

## Verification — 2026-11-12

- Added the Arduino IDE hardware sender and a source field in bridge readings; the app labels physical ESP32/DHT22 versus Wokwi data. The Wokwi firmware remains compatible through the bridge's legacy source default.
- Aligned the inspection prompt with the ESP32 relay at 35°C. The Arduino sketch compiled in Arduino IDE, uploaded to COM7, and passed esptool hash verification. The USB forwarder, Wokwi source, README, MVP, and build guide use the shared threshold. At a fresh 30.2°C reading, the Android app showed Connected, fan relay OFF, and No inspection prompt after clearing the prior recovered session state.
- Removed the visible `DEMO SETPOINT 25.0°C` badge and threshold-specific explanatory sentence from the Home and House 1 detail cards. Acknowledgement lasts 60 seconds; at expiry, a fresh below-setpoint reading clears the prompt, while an active prompt returns to INSPECT. Lint and TypeScript checks passed, and both screens were verified in the running Android emulator.
- Passed: `npm.cmd run lint`, `npx.cmd tsc --noEmit`, `node --check bridge/server.mjs`, and `git diff --check`.
- The current ESP32 firmware compiled successfully with Arduino CLI for `esp32:esp32:esp32` (ESP32 Dev Module) and reflashed to COM7; esptool verified the written hashes. The USB serial forwarder and Android emulator received fresh ESP32 readings (about 30.4°C / 82.2% RH) and displayed the 35°C threshold and relay command OFF. The 35°C relay activation has not been observed because the reported temperature is below threshold. The user reported overheating the DHT22 with a lighter, so its accuracy needs rechecking and it should be replaced if visibly melted or deformed. Wi-Fi delivery and a new Android APK are unverified.

- The demo threshold was subsequently lowered to 32°C in the Arduino, Wokwi, USB-forwarder, and requirements source. The app keeps the numeric threshold hidden. The last recorded COM7 firmware upload above used 35°C; the board must be reflashed with this revised sketch before its physical relay uses 32°C.

## Verification — 2026-11-01

The green-led overview and detail redesign uses the platform system sans-serif and keeps the supplied logo and wordmark unchanged. TypeScript, ESLint on the changed screen and shared UI files, and `git diff --check` passed. The Android emulator visually showed the House 1 detail screen in portrait at narrow phone width, including the waiting reading state, inspection panel, and airflow visuals. At the time of that review, bridge controls were still on the detail screen; they were moved to the separate route below. The bridge had no current sample, so connected/stale/disconnected samples, dark appearance, landscape, Expo Go on a physical phone, and a new EAS APK build were not rechecked.

The bridge setup screen was split from House 1 detail into its own Expo Router route, with a compact entry button on House 1. Connection and demo state remain above the route stack. TypeScript, targeted ESLint, and `git diff --check` passed. The emulator showed the compact entry on House 1; the separate route and form were not visually checked in this pass.

Pinterest dashboard references informed a typography pass across all app screens: a built-in condensed display face for titles, section headings, and readings, paired with the system sans-serif for copy and controls. No font package or asset was added. TypeScript, targeted ESLint, and `git diff --check` passed; the updated typography has not yet had an emulator visual review.

## Earlier verification — 2026-10-21

The visual redesign passed TypeScript, ESLint, and `git diff --check`. The Android emulator showed both screens with waiting and connected Wokwi data, the active inspection prompt, 100% fan, fully open vent, and the local bridge controls. Light and dark appearances were inspected; the app was returned to light appearance. A physical-phone Expo Go session and a new EAS APK build were not run for this visual change.

## Verification — 2026-10-20

For the new fan drawing, TypeScript, ESLint, and `git diff --check` passed using the bundled Node runtime. The running Android emulator was reloaded from Metro, reconnected to the local bridge, and visually showed the app-only fan drawing at a current 0% Wokwi reading alongside the closed vent. The 50/100% animation, stale/disconnected stop, reduced-motion appearance, physical-phone Expo Go session, and a new EAS APK build were not rerun for this change.

The green-only color pass was reviewed on the Android emulator in light and dark appearance with a fresh Wokwi reading. Both screens retained their navigation and connected state. The logo and wordmark assets were not edited. ESLint, TypeScript, and `git diff --check` passed. This color pass did not rerun a physical-phone Expo Go session or build a new APK.

The House 1 vent rendered its waiting dash on the Android emulator. With Wokwi-equivalent samples posted to the local bridge, 24.9°C/0% showed closed louvers, 25°C/50% showed half-open, and 27°C/100% showed fully open. When samples stopped, the retained 100% position was labeled last known and stale; after the bridge stopped, it was labeled disconnected. Larger text and dark appearance were readable. TypeScript, ESLint, and `git diff --check` passed; the existing EAS preview profile still targets an APK. This run used posted local bridge samples, not new Wokwi firmware or a physical vent. Expo Go on a physical phone, landscape, and a new EAS APK build were not rerun for this UI-only change.

## Earlier verification — 2026-10-19

- Passed on an Android emulator with the current Metro bundle: fresh launch opens the styled House 1 overview; tapping the card opens the boxed detail screen; Android Back returns to the overview without clearing the active reading or prompt.
- Passed against an isolated copy of the local bridge: 24.9°C/0% fan and no prompt; 25.0°C/50% fan with an inspection prompt; 27.0°C/100% fan with acknowledgement retained; below 25°C/0% fan with the acknowledged prompt marked recovered; Reset Demo clears the prompt and reference, and the next fresh sample becomes the new reference.
- Passed: stale sample age and disconnected bridge status remain visible on the overview. Narrow width with larger text, landscape, and system dark appearance were checked on the emulator. TypeScript, ESLint, and `git diff --check` passed.
- The Android run used posted simulated samples on a local test bridge. A new EAS APK build and a physical-phone run were not performed in this verification.

## Earlier recorded verification — 2026-10-15

These historical results are retained for context; they were not all rerun on 2026-10-19.

- Passed for the updated build: `npm.cmd run lint`, `npx.cmd tsc --noEmit`, `node --check bridge/server.mjs`, Wokwi diagram JSON parsing, and `git diff --check`.
- Passed: PlatformIO built the updated `esp32dev` firmware with Espressif32 7.1.3 and DHT library 1.19.0. Build reported 14.0% RAM and 60.9% flash use; generated firmware is under `wokwi/.pio/build/esp32dev/`.
- Passed: local bridge contract check for health, empty reading, 24.9°C/25°C/27°C/below-setpoint readings, alert/fan fields, and invalid fan percentage rejection.
- Not verified in that update: Wokwi's live PWM LED behavior, full Wokwi → bridge → phone delivery, physical-phone alert rendering, and EAS APK creation. The Wokwi run recorded then could not connect to `ws://localhost:9011`; this is a historical observation and does not establish the gateway's current state.

On 2026-10-18, the explicit external gateway override was removed from `wokwi.toml`. After stopping and starting Wokwi for VS Code 4.0, its terminal showed repeated `Bridge POST status: 201`; the bridge returned the 42.6°C/60% sample; and the Android emulator displayed that sample, 100% simulated fan, and the inspection prompt. This verifies live Wokwi-to-emulator delivery for that run. Physical-phone delivery, sensor slider transitions, and EAS APK creation remain unverified.

The Android bundle export used Expo's `--no-bytecode` option because the sandbox denied Hermes bytecode output to its temporary directory. This validates Metro bundling, not the final APK build.

## Tabs, history, and Buddy (branch `ui-visual-accessibility`)

Added: Home, History, and Buddy tabs plus a Settings screen; bridge `/api/history` with an in-memory 24-hour record (`bridge/history.mjs`); a bar-chart History screen with 6h/12h/24h and min/average/max; an airflow label derived from fan percentage; and a scripted Buddy (`mobile/src/buddy.ts`, no AI model). Checked: `tsc`, `expo lint`, `npm test` in `bridge/` and `mobile/`, an Android bundle export, and the history endpoint against a local bridge. Not checked: any screen on an emulator or phone, and a run against the live Wokwi simulation.

## Replay demo data (branch `ui-visual-accessibility`)

Added: `bridge/seed.mjs` (`npm run seed`) posts a fixed 24-hour simulated sequence (288 points, one per 5 minutes) to `POST /api/history/replay`; `--clear` calls `DELETE /api/history/replay`. The bridge tags every history point `live` or `replay`. History shows "Includes replayed sample data" with the replayed count whenever replayed points are in range, and Buddy's summary says how many points are replayed. Unlabeled points from an older bridge are treated as replayed. Checked 2026-11-12: `npm test` in `bridge/` (6 tests) and `mobile/` (6 tests), `tsc`, `expo lint`, and the replay, label, Buddy summary, and clear in the web preview. Not checked on a phone or emulator.

## Chart, icons, font, and copy (branch `ui-visual-accessibility`)

Approved packages: `react-native-svg` (History line and area chart; gaps in data break the line instead of bridging it), `@expo/vector-icons` (Ionicons for the tab, settings, chevron, and status icons), and `@expo-google-fonts/nunito` (Nunito ExtraBold for the display, title, and heading styles, loaded in `app/_layout.tsx`; body text stays the system font). Copy uses one state vocabulary: No inspection needed, Inspect House 1, Acknowledged, Recovered; "demo setpoint" replaces "simulation setpoint"; "Wokwi simulated data" and "Reset session" are unchanged. Checked 2026-11-12: `npm test` in `mobile/` (7 tests), `tsc`, `expo lint`, and the web preview in light and dark. Not checked on a phone or emulator.

## Reset confirmation and Buddy claims (branch `ui-visual-accessibility`)

**Reset session** now asks first: a danger-token panel says "Reset clears the inspection prompt and session reference." with **Reset** and **Cancel**. Buddy states only values the app holds: the reading reply reports the prompt state the app tracks (not one inferred from temperature), the summary says the bridge "holds" its points, and why/what-to-do questions get a reply that gives no cause, diagnosis, or flock action. Checked 2026-11-12: `npm test` in `mobile/` (12 tests), `tsc`, `expo lint`, and the reset flow in the web preview.

## Visual quality bar (branch `iot`)

Audited 2026-11-12: no gradients, blur, glow shadows, or decorative art (the logo is the only illustration); Buddy says "Scripted demo helper · no AI model"; numbers lead and labels stay small; every chart shows recorded data or says it has none. Lime is limited to one action per screen: View House 1 (Home), the selected range (History), Acknowledge during a prompt (House 1), Connect (Settings), and Send (Buddy). The House 1 connect button and History's "Open settings" are outlined, Buddy's user bubbles use the green surface.

Home follows the hero-card spec (2026-11-12): a solid deep green card (`hero` #17432B, both themes) with the temperature in white Nunito ExtraBold, the unit, house line drawing, and thin trend bars in lime #CFF54A, a dashed white setpoint line, a pale green "Connected" pill with a check mark, Humidity, and Simulated fan with a three-block meter and the airflow label (ESP32 relay ON/OFF fills all or no blocks). The header uses an outline gear, and the selected tab is a deep green circle holding a lime icon. The spec overrides the earlier one-lime-per-screen and no-decorative-drawing choices on Home: lime now also marks the unit, drawing, trend, and selected tab. Hero text pairs: white 11.2:1, lime 9.0:1, muted 7.8:1, pill text 9.0:1.

Buddy uses warm neutral chat tokens (`chat*` in `ui.tsx`): off-white page, white Buddy bubbles and suggestion chips, light grey user bubbles, grey input outline (3.3:1), and neutral captions, so the lime Send button and the logo are its only green. Ink is 13.7:1 on the page and 12.4:1 on user bubbles.

## Follow-up work

Use [mvp-requirements.md](mvp-requirements.md) for intended behavior and [build-requirements.md](build-requirements.md) for architecture, interfaces, implementation order, and verification. Do not add features outside those documents without new instructions.

[patent.md](patent.md) is a concept-derived planning brief for future MVP refinement and patent assessment. Its camera, farm-sensor, offline, SMS, multi-house, farm-record, and control stages are not implemented in this repository.

## Development

From `mobile/`, use `npm install` and `npx expo start` for Expo Go. The `preview` EAS profile builds an installable Android APK. See `mobile/README.md` for commands and checks.
