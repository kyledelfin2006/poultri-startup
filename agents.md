# Agent guidance

## Current project

- The app is an Expo / React Native TypeScript prototype in `mobile/`; live readings can come from a physical Arduino IDE ESP32/DHT22 or the Wokwi simulator through the local Node bridge.
- Preserve the supplied Poultri logo and wordmark without redrawing or recoloring them.
- Keep Expo Go development and the existing EAS APK profile working.
- Read `mvp-requirements.md` and `build-requirements.md` before changing prototype behavior. The MVP requirements define demo scope and behavior; the build guide defines architecture, setup, and the bridge API. Its AI-chat section is future-work context, not approved demo scope.
- Do not recreate the deleted desktop simulator. The bridge has no UI and is local-only.
- Do not add cloud brokers, accounts, Firebase, push notifications, cameras, production records, actuators, diagnoses, or farm-validity claims.
- Keep simulated labels visible and preserve the official Poultri artwork unchanged.

## Minimal-change guardrails

- Keep the app small and use Expo / React Native primitives already installed.
- Add only the local bridge, Wokwi firmware, physical ESP32/DHT22 sender, and Android networking support required by `build-requirements.md`.
- Keep README and implementation notes aligned with the actual app.

## Documentation ownership and upkeep

- Treat the supplied Poultri concept note as the source of truth for product intent. The concept note is not currently checked into this repository.
- Treat `mvp-requirements.md` as the source of truth for prototype scope, behavior, and acceptance criteria; treat `build-requirements.md` as the source of truth for technical architecture, interfaces, setup, and verification steps.
- Keep `README.md` as the user-facing overview and run guide. Keep `implementation.md` as a concise current-state and verification-status note, not a second requirements document.
- When implementation changes, update any affected documentation in the same change. Remove obsolete standalone documents and stale status claims instead of leaving them to look current; preserve historical results only when clearly dated and still useful.

## Mobile UI guidance

When working on the mobile app, read [documents/AGENTS.md](documents/AGENTS.md) for the reference-matched screen layouts, content, navigation, and UI constraints.

## Cleanup summary — 2026-11-12

- Kept the working system pieces: the Expo app, local Node bridge, physical ESP32 sender, Wokwi simulation, setup guides, and required Poultri artwork.
- Removed the unused static HTML preview and house illustration, the outdated UI plan, nonportable VS Code launch tasks, and generated PlatformIO files with machine-specific paths.
- Kept unrelated `display-loop` reference images on this computer but excluded them from the app branch.
- Kept Wi-Fi credentials local and ignored by Git; the safe `secrets.h.example` template stays in the branch.
