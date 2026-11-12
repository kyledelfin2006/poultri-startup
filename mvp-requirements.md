# Poultri Sensor + Mobile Demo MVP

## Purpose

Define a small prototype that sends one local ESP32/DHT22 temperature and humidity reading through the laptop bridge to the Poultri mobile app. At the user-selected 32°C threshold, the physical ESP32 switches the fan relay and the app raises its inspection prompt; Wokwi mirrors the same threshold in its simulated fan indicator. The complete presenter walkthrough must take less than two minutes once setup is complete.

This is a demonstration of a proposed workflow. It is not a farm monitoring system, field trial, or validated alert product.

## Alignment with the Poultri concept note

The supplied concept note is the source of truth for Poultri's product intent. This MVP demonstrates only its staff-review workflow: one demo house, temperature and humidity readings from a local DHT22 or Wokwi simulation, and a mobile inspection prompt that can be acknowledged and reset.

The concept note does not set a numerical temperature threshold or fan-control rule. This demo uses one **32°C inspection and fan-relay threshold** as user-chosen demonstration behavior only; it is not a farm setting or poultry-health limit. The physical ESP32 reports the relay command to the app as ON/OFF. Wokwi's LED follows the same threshold as a simulated fan indicator; it does not control a physical fan.

The following concept capabilities remain outside this demo: camera or bird-movement analysis; ammonia/CO₂ sensors; production records; multiple houses; on-site edge processing and internet-independent operation; validated farm control strategies; and SMS. The concept note's proposed alert timing, detection rate, offline duration, and field-trial duration are future evaluation targets, not results or acceptance criteria for this prototype.

## Audience and user

- **Demo audience:** startup challenge judges, mentors, and prospective farm stakeholders.
- **Demo user:** a farm worker or supervisor who checks one house and acknowledges a prompt to inspect it.

## Functional requirements

1. A physical ESP32 reads one DHT22 on GPIO 4 and sends samples over the local Wi-Fi network to the laptop bridge. Wokwi's simulated ESP32/DHT22 remains an alternate source for repeatable threshold demonstrations.
2. The inspection prompt and fan output share the **32°C threshold**: at or above 32°C the app prompt is active and the physical ESP32 turns its GPIO 26 relay ON; below 32°C the prompt is clear and the relay is OFF. Wokwi mirrors this as a 0%/100% simulated fan indicator.
3. The mobile app shows the latest temperature, humidity, source label (**Local ESP32 + DHT22** or **Wokwi simulated data**), and whether the connection is waiting, connected, stale, or disconnected. The setpoint remains part of the demo inspection logic but its numeric value and setpoint-specific explanation are not shown on Home or House 1 detail. For physical samples the app shows the ESP32 fan-relay command as ON/OFF; for Wokwi it shows the simulated percentage. The app does not send actuator commands or measure fan rotation. Humidity is display-only.
4. The first valid reading after connecting or resetting is retained as session context. It does not set the alert threshold.
5. The app creates one inspection prompt from the firmware alert state. Acknowledging it shows **ACKNOWLEDGED** for 60 seconds. At expiry, clear the prompt if a fresh reading is below 32°C; if the alert is still active, return to **INSPECT**. A recovered but unacknowledged prompt shows **RECOVERED** and remains until reset.
6. **Reset session** clears the app's session reference and prompt. It does not change the physical or simulated sensor value; the next fresh reading becomes the reference.
7. The presenter can enter the laptop's local bridge URL in the app and connect before starting the timed walkthrough.
8. House 1 detail shows the reported physical relay command for ESP32 samples and the simulated fan percentage for Wokwi samples. The fan drawing follows that state and stops when data becomes stale or disconnected; reduced-motion settings keep it still. The vent remains an app-only visual. Before the first reading visuals show a dash; retained states are marked stale or disconnected. The ESP32 controls only the fan relay; the app does not control the relay or verify that the fan is physically spinning.

9. The app has Home, History, and Buddy tabs, and a Settings screen opened from Home. Settings holds the bridge URL, connect, and reset controls.
10. The bridge records one temperature point every 10 seconds for up to 24 hours, in memory. The History tab shows a 6h, 12h, or 24h line chart with the demo setpoint, and the minimum, average, and maximum for the chosen range. Without a connected bridge or recorded points it says so; it never shows invented data. For demos, a labeled replay script (`npm run seed` in `bridge/`) can load a fixed 24-hour simulated sequence; History and Buddy then state that those points are replayed sample data, and `npm run seed -- --clear` removes them.
11. The Home and detail screens show an airflow label derived from the simulated fan percentage: Still at 0%, Moderate below 75%, Strong at 75% or more. It is a label for the simulated fan, not a measurement.
12. The Buddy tab is a scripted helper with no AI model. It explains the current reading, summarizes the recorded history, and describes how the demo works, using only the app's own data. It declines poultry-health questions.

## Two-minute presenter walkthrough

Complete setup before starting the timer: run the bridge, power the ESP32/DHT22 and relay, use Wi-Fi or USB serial to send readings to the laptop, open the app, and connect it to the bridge.

| Time | Presenter action | What the audience sees |
|---|---|---|
| 0:00–0:20 | Show the connected app and the current local ESP32/DHT22 reading. | One demo house, hardware source label, temperature, humidity, inspection state, and fan-relay ON/OFF state. |
| 0:20–0:45 | Explain the shared demo threshold. | At or above 32°C the inspection prompt appears and the physical ESP32 turns the fan relay on. |
| 0:45–1:05 | Show the relay state and sample age. | The app reports the ESP32 relay command; it does not measure fan rotation. |
| 1:05–1:25 | Acknowledge the prompt if active; show recovery if the reading falls below 32°C. | After 60 seconds, a fresh below-threshold reading clears an acknowledged prompt; otherwise an active prompt returns to INSPECT. Unacknowledged recovery remains until reset. |
| 1:25–1:45 | Reset the app demo. | The prompt and session reference clear. |
| 1:45–2:00 | State the prototype boundary. | One local DHT22, a demo-only relay threshold, and no camera analysis, diagnosis, SMS, or farm validation. |

## Out of scope

- Multiple houses, farm profiles, production records, accounts, or cloud data storage.
- Cameras, bird-activity classification, ammonia/CO₂ measurement, SMS, fan speed control, vent/servo control, and farm-approved or validated control strategies.
- Clinical or husbandry advice, validated safety thresholds, farm compatibility claims, offline-duration claims, or measured farm outcomes.
- Production security, multi-user access, internet deployment, and remote monitoring.
- A real AI service, stored history beyond the bridge's memory, and any health or husbandry advice from Buddy.

The Wokwi MQ-2 part is a combustible-gas model and must not be presented as an ammonia or CO₂ sensor. See [Wokwi's gas sensor reference](https://docs.wokwi.com/parts/wokwi-gas-sensor).

## Success criteria

- The physical ESP32/DHT22 can send readings to the app over the laptop's local bridge. Wokwi remains an optional repeatable test source.
- At or above 32°C, the physical fan-relay command and inspection prompt are ON; below 32°C both are clear/OFF. The app reports the relay command. Wokwi mirrors that behavior with its simulated 0/100% fan LED.
- Disconnection and stale data are labeled so old readings and last-known fan and vent states are not mistaken for current readings. Before any reading, both drawings show a dash.
- A prepared presenter completes the walkthrough within two minutes without implying that local prototype readings or the demo rule are farm-validated.

For architecture, the bridge contract, implementation order, and technical checks, see [build-requirements.md](build-requirements.md).
