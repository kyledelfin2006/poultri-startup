# Poultri App UI/UX Plan

**Status:** Temporary working blueprint, prepared 2026-10-18  
**Product stage:** Concept-stage mobile app roadmap, MVP 0 through MVP 4

This document plans the mobile experience across the proposed Poultri product stages. It is a design aid, not an implementation status report or a change to the current demo requirements.

## Authority and scope

- [mvp-requirements.md](mvp-requirements.md) defines the current Wokwi demo behavior and acceptance criteria.
- [build-requirements.md](build-requirements.md) defines the current demo architecture, bridge contract, setup, and verification.
- [patent.md](patent.md) describes the concept-stage product direction and proposed MVP roadmap. Features described there remain future work unless separately approved and implemented.
- This plan describes the intended UI structure, flows, visual direction, and states. It does not define a new API, data schema, sensor rule, remote-access design, or control policy.

The app is for poultry-farm staff who need to understand the condition of a house, decide whether it needs inspection, and record the agreed review. Poultri presents monitoring information for staff review. It does not diagnose disease or replace staff judgment.

## Product experience goals

1. Let staff identify the house and its current or last-known monitoring state at a glance.
2. Make a condition needing review and its supporting information easy to find.
3. Show the source, measurement time, receipt time, and availability of data where these affect interpretation.
4. Preserve the distinction between the existing simulation and later farm-connected stages.
5. Add each future capability only when its data, permissions, operating rules, and failure behavior have been defined for the relevant stage.

## App structure

### Navigation by stage

- **MVP 0:** Open to the House 1 overview with temperature, humidity, simulated fan percentage, connection/data status, and prompt state. Open House 1 to connect to the laptop bridge and review all simulated readings and prompt controls.
- **MVP 1:** Open directly to the overview for the single assessed house. Open an alert review from its summary. Do not add a farm or house picker while only one house is supported.
- **MVP 2:** Add camera-derived indicators and selected farm-record context inside the relevant alert review. Keep the house overview focused on the current state.
- **MVP 3:** Make local-system, connection, queue, and recovery information available from the overview through a system-status area. Show SMS state with the related alert.
- **MVP 4:** Show an approved equipment action in the relevant house or alert context. Keep it unavailable until that site has approved equipment and defined operating limits and procedures.
- **Later multi-house use:** Add house selection only when a later approved stage supports multiple houses. Keep the selected house visible throughout overview and alert review.

This is a proposed information structure, not a route or navigation implementation contract. Account setup, farm administration, and remote access flows remain undecided.

### Core screens and surfaces

| Surface | Purpose | Planned content |
|---|---|---|
| House overview (MVP 0) | Show the house's key simulated values at a glance. | House 1, temperature, humidity, simulated fan percentage, connection/data status, and inspection-prompt state. |
| House detail (MVP 0) | Show and operate the complete simulated workflow. | Environmental readings, demo setpoint, app-only fan and vent visuals, sample age, session reference, bridge URL and connection state, inspection prompt, acknowledge, recovery, and reset. |
| House overview (MVP 1+) | Let staff scan a house's current condition. | House identity, data age and availability, active review status, and supported environmental readings. A single-house stage opens here directly. |
| Alert review (MVP 1+) | Explain why a house was flagged and record staff review. | Configured condition, concise reason, timestamped supporting information, acknowledgement or inspection state, and the agreed action/outcome fields. |
| System status (MVP 3+) | Explain local monitoring and data movement. | Local monitoring availability, connection state, last received data, pending or queued items, recovery/synchronization state, and relevant errors. |
| Approved control area (MVP 4 only) | Present an allowed routine action and its result. | Equipment identity, allowed request, confirmation or pending state, reported result, failure state, and the farm's manual-override procedure. |

Do not add separate camera, records, analytics, or control dashboards by default. Put relevant context beside the house or alert it explains, and add a dedicated destination only when an agreed workflow requires one.

## Stage-by-stage experience

### MVP 0 — Existing simulation demo

**Purpose:** Demonstrate one simulated reading-to-inspection-prompt workflow to judges, mentors, and prospective stakeholders.

**Overview hierarchy:**

1. Official Poultri logo and wordmark, displayed unchanged.
2. Persistent `Wokwi simulated data` identification and a compact connection/waiting/stale/disconnected status.
3. A bold House 1 card with temperature, humidity, and simulated fan percentage; connection/data status and prompt state remain visible in the card.
4. A clear action opens House 1 detail. The official logo and wordmark remain unchanged.

**House detail hierarchy:**

1. Environmental readings with temperature, humidity, demo setpoint, sample age, and stale/current state.
2. Simulated fan percentage, an app-only spinning fan drawing, and an explanation that the Wokwi LED is not physical equipment.
3. An app-only vent section after the fan, with louvers that follow the existing 0/50/100% fan value. Before data it shows a dash; a retained position is marked stale or disconnected. No vent or servo is connected or controlled.
4. Inspection prompt with reference reading, acknowledgement, and recovery state.
5. Local bridge URL and connection controls, followed by `Reset session`.

**Flow and states:**

- Enter the laptop's local bridge URL and connect before the timed walkthrough.
- Show waiting for Wokwi data, then display each fresh sample with its sample age.
- Retain the first valid reading after connect or reset as session context; do not use it as the alert threshold.
- At the demo-only 25°C setpoint, show one prompt. Keep the demo fan indicator at 0%, 50%, or 100% according to the current demo behavior.
- Allow acknowledgement. When temperature falls below the setpoint, show recovery and retain the prompt until reset.
- Reset clears the app session reference and prompt. It does not change the Wokwi sensor value.
- Label readings as simulated during waiting, connected, stale, and disconnected states. Never imply that they came from a farm.
- Keep bridge, polling, reference, and prompt state in memory above the route stack so opening or leaving House 1 does not reset the session.
- Use a warm neutral canvas, charcoal House 1 and airflow cards, sage status accents, and a terracotta inspection state. The temperature reading leads the detail screen without a surrounding card. A decorative poultry-house line drawing carries no data meaning.

The exact threshold, fan levels, setup, and presenter walkthrough remain governed by [mvp-requirements.md](mvp-requirements.md). The simulated fan is an LED indicator, not physical equipment.

### MVP 1 — One assessed house

**Purpose:** Show usable environmental readings from one assessed test house and help staff review a configured condition.

**House overview:**

- Open directly to the single house; show its label and the latest data state.
- Present temperature, humidity, ammonia, and CO₂ as readable rows or a clear vertical grouping rather than a grid of identical metric cards.
- Show units, source/device context where available, measurement time, receipt time, and a plain-language current, delayed, missing, or unavailable status.
- Give an active review prompt visual priority. When there is no active prompt, make the readings and their freshness the focus.
- Do not introduce universal poultry thresholds. Show a condition only from the rule explicitly configured for the assessed test.

**Alert review flow:**

1. Staff open the house's active review summary.
2. The review surface shows the configured condition, concise reason, relevant timestamped readings, and data-quality context.
3. Staff acknowledge or record that they inspected the house.
4. Capture action and outcome only according to the farm's agreed workflow. The exact fields, requiredness, and retention need product and farm decisions.

The UI supports inspection and review. It must not present a diagnosis or husbandry advice.

### MVP 2 — Camera and record context

**Purpose:** Give staff additional context alongside the environmental evidence for a house flagged for review.

- Add a clearly named camera-derived bird-movement indicator to the relevant alert review, with source, observation time, and method/version when available.
- Show only selected farm-record context agreed for the workflow, with record source and period/time.
- Distinguish observations from sensor measurements and farm records in labels and layout.
- Represent unavailable or delayed camera/record context explicitly; do not make missing context look like a normal result.
- Keep the indicator vocabulary, confidence handling, selected record fields, camera access, and raw-video retention/display behavior unresolved until decided with farms.

The app should explain what information contributed to a review prompt without interpreting it as a disease diagnosis.

### MVP 3 — Local resilience and alerts

**Purpose:** Make local monitoring availability, delayed information, and alert delivery state understandable during connectivity changes.

- Add a system-status area reachable from the house overview.
- Separate local monitoring status from internet or remote-access status; the final labels depend on the chosen architecture.
- Show the latest available measurement time, last receipt time, queued/pending items, synchronization progress or failure, and restored-connection state when those signals exist.
- Retain timestamps on older readings and mark them delayed or stale so they cannot be mistaken for current readings.
- Show an SMS send attempt and a carrier or receipt confirmation only when the chosen service provides that evidence. Label unavailable or unconfirmed delivery clearly.
- Keep remote-access setup, authentication, authorization, secure transport, and data handling unresolved until designed.

The proposed seven-day offline duration and alert timing are evaluation targets in `patent.md`, not UI promises or current capabilities.

### MVP 4 — Farm-approved routine controls

**Purpose:** Present a limited routine action only after the specific farm and equipment have passed the required review.

- Show a control action only when the site configuration explicitly enables it and farm approval, operating bounds, and staff procedure are documented.
- Identify the equipment and requested action before a staff member confirms it.
- Show the action as pending until the equipment reports a result; distinguish reported success, failure, and unknown result.
- Surface the site's manual-override route and relevant safe-state information as defined by its operating procedure.
- Keep controls unavailable when approval, configuration, sensor data, connection, or equipment state is insufficient. The exact safe response and copy depend on the site-level safety design.

The control UI does not set limits or decide when a farm should operate equipment. Those rules belong to the approved site configuration and control system.

## Shared visual direction

### Layout and hierarchy

- Use a flat, mobile-first layout with generous spacing, solid-color surfaces, and simple dividers.
- For MVP 0, use one bold House 1 overview card, a large unboxed temperature reading on detail, a compact inspection panel, and one combined airflow card. Keep the three key readings grouped and readable without decorative metric tiles.
- Keep the house, data age, and active review easy to scan. Let the most urgent supported state lead; otherwise, make the current readings clear.
- Keep primary actions close to the information they affect. Keep setup and system details accessible without competing with the main reading or review task.
- Use native system typography with a clear screen-title, section-title, reading, label, and supporting-text hierarchy. Do not depend on Inter or oversized italic serif headlines.

### Color, assets, and components

- Use charcoal for the House 1 and airflow cards, sage for simulated values and clear states, terracotta for an active inspection prompt, and a warm neutral canvas. Distinguish waiting, stale, disconnected, and inspection states with readable text. Compose light and dark palettes separately while keeping the supplied artwork unchanged.
- Use solid fills and restrained borders. Do not use purple/blue or pink/indigo gradients, neon accents, glass effects, glow, or decorative shadows.
- Preserve `mobile/assets/poultri-logo.png` and `mobile/assets/poultri-wordmark.png` as supplied; do not redraw, crop into a new mark, filter, or recolor them.
- Keep controls visually simple and native-feeling. Provide a comfortable touch target and visible pressed/disabled feedback.
- Use icons only when they clarify a real action or status; avoid large decorative icons above headings.
- Avoid decorative sparklines. If a future stage needs trends, define the user decision they support and the underlying measurement period before adding a chart.

### Content and data trust

- Put the data source and relevant time near the reading or context it describes.
- Distinguish measured time from received time when both exist.
- Say what the system knows, what is delayed, and what is unavailable; do not turn a missing value into an implied normal reading.
- Keep language operational and non-diagnostic. Avoid claims of farm compatibility, validated thresholds, guaranteed alert delivery, or proven outcomes without supporting evidence.
- Keep demo labels visible everywhere MVP 0 data or fan status appears.

## Shared state patterns

| State | UI treatment |
|---|---|
| Loading/checking | Show what is being checked and keep the last useful state readable where safe. |
| Empty/no sample | Say that no reading has arrived yet; distinguish this from a normal reading. |
| Fresh/current | Show value, unit, source, and relevant timestamp. |
| Delayed/stale | Keep the last value with its age and a visible delayed/stale label. Never present it as current. |
| Disconnected/unavailable | State which connection or source is unavailable and retain timestamped last-known context when appropriate. |
| Active review | Identify the house and configured reason; provide a clear review action. |
| Acknowledged/inspected | Show the staff-review state and its recorded time when available. |
| Recovered | Show that the triggering condition is no longer active while retaining the review record according to that stage's workflow. |
| Camera/record context missing | Name the unavailable source; keep other evidence separate. |
| Queued/synchronizing/recovered | Show pending, in-progress, completed, or failed status only when the system provides it. |
| SMS pending/unconfirmed/failed | Show the known send state and avoid implying recipient delivery without confirmation. |
| Control unavailable/pending/result/failure | Explain the known equipment/action state; gate unavailable actions and keep failure distinct from success. |

Exact copy, color values, and status semantics should follow the confirmed data and farm workflow. The same state must not be represented by color alone.

## Accessibility and device behavior

- Keep the reading order meaningful for screen readers and announce values with their units and status.
- Preserve text resizing and sufficient contrast across light surfaces and semantic status colors.
- Use mobile-sized, vertically stacked layouts that remain readable on narrower phones and with larger text.
- Keep primary actions easy to reach and large enough to activate reliably; do not make color or gestures the only way to understand or change state.
- For MVP 0, preserve Expo Go development and the existing EAS Android APK profile. Cross-platform support and future production targets remain open decisions in `patent.md`.

## Decisions required before future-stage implementation

Resolve these with the product team and relevant farm before designing detailed production copy or behavior:

- Sensor models, units, calibration, quality states, freshness rules, and the farm-configured conditions that create review prompts.
- Staff roles, identity, acknowledgement/inspection workflow, required action/outcome fields, and retention of review records.
- Camera-derived indicator definitions, reference method, confidence semantics, raw-video access/retention, and privacy controls.
- Which farm records appear, their source, time period, access rules, and retention.
- Local/remote connection architecture, authentication and authorization, secure transport, and what each connectivity state means.
- Queue, replay, duplicate handling, synchronization, and recovery behavior during and after an internet interruption.
- SMS provider, retry policy, cost, and what send/acceptance/receipt states can actually be observed.
- Supported control devices, allowed commands, bounds, interlocks, authorization, manual override, safe states, and failure procedures.
- When multiple houses or farms are supported, and which device classes and operating systems the production app must serve.

Until resolved, keep these behaviors and features marked as proposed or unavailable. Do not fill the gaps with invented rules.

## Acceptance checklist for this plan

- MVP 0 content matches `mvp-requirements.md` and `build-requirements.md`, including simulated-source labels, the demo-only threshold, prompt lifecycle, and reset behavior.
- MVP 1 through MVP 4 content matches the proposed stage boundaries in `patent.md` and is visibly identified as future work.
- No universal temperature or fan rule, farm outcome, diagnosis, connectivity guarantee, or unapproved control behavior is introduced.
- Each reading and derived context has a visible source/time/status treatment where the underlying data supports it.
- The visual direction uses flat surfaces and whitespace while preserving the official Poultri artwork unchanged.
- No app code, bridge contract, or public interface is changed by this document.
