# Poultri Wokwi + Mobile Demo MVP

## Purpose

Define a small prototype that lets a presenter change a simulated poultry-house reading in Wokwi and show the resulting inspection prompt in the Poultri mobile app. The complete presenter walkthrough must take less than two minutes once setup is complete.

This is a demonstration of a proposed workflow. It is not a farm monitoring system, field trial, or validated alert product.

## Alignment with the Poultri concept note

The supplied concept note is the source of truth for Poultri's product intent. This MVP demonstrates only its staff-review workflow: one simulated house, temperature and humidity readings, and a mobile inspection prompt that can be acknowledged and reset.

The concept note does not set a numerical temperature threshold or fan-control rule. This demo uses a **25°C setpoint** and a **0/50/100% LED fan indicator** as user-chosen demonstration behavior only; neither is a farm setting or poultry-health limit.

The following concept capabilities remain outside this demo: camera or bird-movement analysis; ammonia/CO₂ sensors; production records; multiple houses; on-site edge processing and internet-independent operation; real fan/temperature controls; and SMS. The concept note's proposed alert timing, detection rate, offline duration, and field-trial duration are future evaluation targets, not results or acceptance criteria for this prototype.

## Audience and user

- **Demo audience:** startup challenge judges, mentors, and prospective farm stakeholders.
- **Demo user:** a farm worker or supervisor who checks one house and acknowledges a prompt to inspect it.

## Functional requirements

1. Wokwi simulates one ESP32, one DHT22, and one PWM LED labeled as a simulated fan. The presenter can change temperature and humidity while simulation is running.
2. The ESP32 marks the alert active at **25°C or higher** and drives the LED as a visual fan indicator: **0% below 25°C, 50% from 25°C to below 27°C, and 100% at or above 27°C**. These are demo values only; the LED is not a physical fan.
3. The mobile app shows the latest temperature, humidity, demo setpoint, simulated fan percentage, the source as **Wokwi simulated data**, and whether the connection is waiting, connected, stale, or disconnected. Humidity is display-only.
4. The first valid reading after connecting or resetting is retained as session context. It does not set the alert threshold.
5. The app creates one inspection prompt from the firmware alert state. The presenter can acknowledge it. When temperature falls below 25°C, show recovery while retaining the prompt until reset.
6. **Reset session** clears the app's session reference and prompt. It does not change the Wokwi DHT22 value; lower the sensor below 25°C or restart Wokwi before beginning another alert run.
7. The presenter can enter the laptop's local bridge URL in the app and connect before starting the timed walkthrough.
8. House 1 detail shows an **app-only simulated fan drawing** and vent. The fan drawing is still at 0%, spins at 50% or 100%, and stops when data becomes stale or disconnected; reduced-motion settings keep it still. The vent follows the same Wokwi `fanSpeedPct`: closed at 0%, half-open at 50%, fully open at 100%. Before the first reading both show a dash; retained values are marked stale or disconnected. No physical fan, vent, or servo is connected or controlled.

## Two-minute presenter walkthrough

Complete setup before starting the timer: run the bridge, start Wokwi with its private gateway, open the app, and connect it to the bridge.

| Time | Presenter action | What the audience sees |
|---|---|---|
| 0:00–0:20 | Show the connected app and steady 24°C Wokwi reading. | One demo house, temperature, humidity, 25°C demo setpoint, fan at 0%, closed app-only vent, and simulated-data labels. |
| 0:20–0:45 | Raise temperature to 25°C using the Wokwi DHT22 control. | The app updates; the inspection prompt appears, the simulated fan shows 50%, and the visual vent is half-open. |
| 0:45–1:05 | Raise temperature to 27°C. | Wokwi LED brightness and app fan indicator show 100%; the visual vent is fully open. |
| 1:05–1:25 | Acknowledge the prompt, then lower temperature below 25°C. | The prompt shows acknowledged and recovered; it remains visible. |
| 1:25–1:45 | Reset the app demo. | The prompt and session reference clear. |
| 1:45–2:00 | State the prototype boundary. | Wokwi simulation only; the LED represents a fan, and no real sensors, camera analysis, diagnosis, physical controls, SMS, or farm validation are included. |

## Out of scope

- Multiple houses, farm profiles, production records, accounts, or cloud data storage.
- Cameras, bird-activity classification, ammonia/CO₂ measurement, SMS, and physical fan, vent, servo, or temperature-control commands.
- Clinical or husbandry advice, validated safety thresholds, farm compatibility claims, offline-duration claims, or measured farm outcomes.
- Production security, multi-user access, internet deployment, and remote monitoring.

The Wokwi MQ-2 part is a combustible-gas model and must not be presented as an ammonia or CO₂ sensor. See [Wokwi's gas sensor reference](https://docs.wokwi.com/parts/wokwi-gas-sensor).

## Success criteria

- The presenter can change the Wokwi DHT22 input and see the app update over the local connection.
- A reading below 25°C shows no prompt, 0% fan, and closed visual vent; 25°C shows one prompt, 50% fan, and half-open vent; 27°C shows 100% fan and fully open vent; falling below 25°C shows recovery. Acknowledgement and reset behave as described.
- Disconnection and stale data are labeled so old readings and last-known fan and vent states are not mistaken for current readings. Before any reading, both drawings show a dash.
- A prepared presenter completes the walkthrough within two minutes without implying that simulated readings are live farm data.

For architecture, the bridge contract, implementation order, and technical checks, see [build-requirements.md](build-requirements.md).
