# Poultri prototype implementation brief

## Current baseline

The repository contains a branded Expo / React Native TypeScript app in `mobile/`, an ESP32 + DHT22 + PWM LED simulation in `wokwi/`, and a standard-library Node bridge in `bridge/`. The mobile screen connects to simulated readings over the local network and demonstrates one illustrative inspection alert and fan indicator. Expo Go support and an EAS Android APK profile are included.

## Current limits

This is a demonstration prototype, not a farm-monitoring product. Wokwi readings are simulated. There is no physical hardware, camera analysis, ammonia/CO₂ measurement, SMS, physical fan/temperature control, production data, validated rule, offline-operation proof, or farm trial. The LED is only a simulated fan indicator. Do not describe it as connected to deployed sensors or as proven on farms.

## Implemented in this build

- `mobile/src/app/index.tsx`: one-screen mobile demo with a flat, reading-first layout that centers standard widths, uses two columns on expanded windows, reflows for larger text, and follows the system light/dark appearance. The supplied Poultri logo and wordmark remain unchanged. It includes bridge connection, live/stale state, temperature, humidity, demo setpoint and fan percentage, accessible state announcements, an acknowledgeable alert, recovery, and reset.
- `mobile/app.json` and `mobile/src/app/_layout.tsx`: support portrait and landscape, enable Android predictive Back, and configure the SDK-matched Expo System UI module for automatic appearance.
- `mobile/plugins/with-local-bridge-http.js`: Expo config plugin for Android local-LAN HTTP in the preview APK.
- `bridge/server.mjs`: dependency-free Node HTTP bridge on port 4174 with health, latest-reading, and input validation for sensor readings, setpoint, alert state, and fan percentage.
- `wokwi/`: ESP32/DHT22/LED PlatformIO project, diagram, and firmware. The firmware samples every two seconds, compares temperature with the demo-only 25°C setpoint, drives the LED to 0/50/100%, and posts readings through the Wokwi private gateway.
- Demo features: connect to the local bridge; show simulated temperature/humidity, setpoint and fan percentage plus live/stale state; create one prompt at 25°C or above; acknowledge it, show recovery below 25°C, or reset the app session. The official logo and wordmark are included from the supplied image assets unchanged, and the root README displays them.
- The README uses `assets/poultri_full_logo.png` and documents the build, bridge, Wokwi, mobile, and repeat-demo steps plus the 24°C → 25°C → 27°C walkthrough.
- `mvp-requirements.md`: scope, acceptance criteria, and the under-two-minute presenter flow.
- `build-requirements.md`: mobile/Wokwi/bridge architecture, setup, data contract, run instructions, verification sequence, and a future AI-chatbot plan. Chat is documented for later and is not implemented in this demo.

The supplied Poultri logo and wordmark are used as existing image assets without modification. No desktop simulator, account system, cloud broker, database, push notifications, camera, gas sensor, farm records, physical actuator, or AI service is included. The concept note defines no numeric temperature threshold or fan curve; 25°C and the LED levels are user-chosen demo settings. The proposed offline-operation, pilot, alert-timing, and detection targets remain future evaluation work.

The generated Android project was refreshed from Expo config. Its manifest enables HTTP for the private-LAN bridge and removes old Firebase/notification metadata; Expo's permission-removal directives block unused storage, overlay, and vibration permissions from the final merged manifest.

## Last recorded verification — 2026-10-15

These are the most recent recorded results, not a claim that the checks were rerun today.

- Passed for the updated build: `npm.cmd run lint`, `npx.cmd tsc --noEmit`, `node --check bridge/server.mjs`, Wokwi diagram JSON parsing, and `git diff --check`.
- Passed: PlatformIO built the updated `esp32dev` firmware with Espressif32 7.1.3 and DHT library 1.19.0. Build reported 14.0% RAM and 60.9% flash use; generated firmware is under `wokwi/.pio/build/esp32dev/`.
- Passed: local bridge contract check for health, empty reading, 24.9°C/25°C/27°C/below-setpoint readings, alert/fan fields, and invalid fan percentage rejection.
- Not verified in that update: Wokwi's live PWM LED behavior, full Wokwi → bridge → phone delivery, physical-phone alert rendering, and EAS APK creation. The Wokwi run recorded then could not connect to `ws://localhost:9011`; this is a historical observation and does not establish the gateway's current state.

The Android bundle export used Expo's `--no-bytecode` option because the sandbox denied Hermes bytecode output to its temporary directory. This validates Metro bundling, not the final APK build.

## Follow-up work

Use [mvp-requirements.md](mvp-requirements.md) for intended behavior and [build-requirements.md](build-requirements.md) for architecture, interfaces, implementation order, and verification. Do not add features outside those documents without new instructions.

[patent.md](patent.md) is a concept-derived planning brief for future MVP refinement and patent assessment. Its camera, farm-sensor, offline, SMS, multi-house, farm-record, and control stages are not implemented in this repository.

## Development

From `mobile/`, use `npm install` and `npx expo start` for Expo Go. The `preview` EAS profile builds an installable Android APK. See `mobile/README.md` for commands and checks.
