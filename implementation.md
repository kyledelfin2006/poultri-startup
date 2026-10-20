# Poultri prototype implementation brief

## Current baseline

The repository contains a branded Expo / React Native TypeScript app in `mobile/`, an ESP32 + DHT22 + PWM LED simulation in `wokwi/`, and a standard-library Node bridge in `bridge/`. The mobile app opens to a House 1 overview and links to a detail screen with simulated readings, bridge setup, and one illustrative inspection prompt. Expo Go support and an EAS Android APK profile are included.

## Current limits

This is a demonstration prototype, not a farm-monitoring product. Wokwi readings are simulated. There is no physical hardware, camera analysis, ammonia/CO₂ measurement, SMS, physical fan/temperature control, production data, validated rule, offline-operation proof, or farm trial. The LED is only a simulated fan indicator. Do not describe it as connected to deployed sensors or as proven on farms.

## Implemented in this build

- `mobile/src/app/index.tsx` and `mobile/src/app/house-1.tsx`: House 1 overview and detail screens. The overview presents temperature, humidity, simulated fan percentage, data status, and prompt state in a charcoal card with a decorative house line drawing. The detail presents a large temperature reading with temperature and humidity icons, then inspection, a combined app-only fan and vent panel, and local bridge setup. Both visuals follow the existing fan percentage and mark waiting, stale, and disconnected data. The fan drawing stops for stale/disconnected data and reduced motion. Both screens preserve simulated-data labeling, larger-text layouts, and system light/dark appearance.
- `mobile/src/demo-session.tsx`: shared bridge polling and session state, so navigation retains readings, the reference sample, acknowledgement, recovery, and reset state.
- `mobile/src/ui.tsx`: shared light and dark palettes with warm neutral surfaces, charcoal and sage UI elements, a terracotta inspection state, unchanged logo and wordmark, and common screen controls.
- `mobile/app.json` and `mobile/src/app/_layout.tsx`: support portrait and landscape, enable Android predictive Back, and configure the SDK-matched Expo System UI module for automatic appearance.
- `mobile/plugins/with-local-bridge-http.js`: Expo config plugin for Android local-LAN HTTP in the preview APK.
- `bridge/server.mjs`: dependency-free Node HTTP bridge on port 4174 with health, latest-reading, and input validation for sensor readings, setpoint, alert state, and fan percentage.
- `wokwi/`: ESP32/DHT22/LED PlatformIO project, diagram, and firmware. The firmware samples every two seconds, compares temperature with the demo-only 25°C setpoint, drives the LED to 0/50/100%, and posts readings through Wokwi networking to the local bridge.
- Demo features: open the House 1 overview, then enter the detail screen to connect to the local bridge and show simulated temperature/humidity, setpoint and fan percentage plus live/stale state; see a still/slower/faster fan drawing and closed/half-open/fully-open visual vent at 0/50/100% fan; create one prompt at 25°C or above; acknowledge it, show recovery below 25°C, or reset the app session. The official logo and wordmark are included from the supplied image assets unchanged, and the root README displays them.
- The README uses `assets/poultri_full_logo.png` and documents the build, bridge, Wokwi, mobile, and repeat-demo steps plus the 24°C → 25°C → 27°C walkthrough.
- `mvp-requirements.md`: scope, acceptance criteria, and the under-two-minute presenter flow.
- `build-requirements.md`: mobile/Wokwi/bridge architecture, setup, data contract, run instructions, verification sequence, and a future AI-chatbot plan. Chat is documented for later and is not implemented in this demo.

The supplied Poultri logo and wordmark are used as existing image assets without modification. No desktop simulator, account system, cloud broker, database, push notifications, camera, gas sensor, farm records, physical actuator, or AI service is included. The fan and vent are app-only drawings; no physical fan, vent, or servo is connected or controlled. The concept note defines no numeric temperature threshold or fan curve; 25°C and the LED levels are user-chosen demo settings. The proposed offline-operation, pilot, alert-timing, and detection targets remain future evaluation work.

The generated Android project was refreshed from Expo config. Its manifest enables HTTP for the private-LAN bridge and removes old Firebase/notification metadata; Expo's permission-removal directives block unused storage, overlay, and vibration permissions from the final merged manifest.

## Verification — 2026-10-21

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

## Follow-up work

Use [mvp-requirements.md](mvp-requirements.md) for intended behavior and [build-requirements.md](build-requirements.md) for architecture, interfaces, implementation order, and verification. Do not add features outside those documents without new instructions.

[patent.md](patent.md) is a concept-derived planning brief for future MVP refinement and patent assessment. Its camera, farm-sensor, offline, SMS, multi-house, farm-record, and control stages are not implemented in this repository.

## Development

From `mobile/`, use `npm install` and `npx expo start` for Expo Go. The `preview` EAS profile builds an installable Android APK. See `mobile/README.md` for commands and checks.
