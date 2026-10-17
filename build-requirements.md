# Poultri Wokwi + Mobile Build Guide

This guide documents the runnable demo defined in [mvp-requirements.md](mvp-requirements.md). The Wokwi project, local bridge, and mobile screen are implemented at the paths below. Follow the stages to install tools, start each part, and connect them; keep every reading labeled simulated.

## What you are building

```mermaid
flowchart LR
    DHT[DHT22 controls in Wokwi] --> ESP[ESP32 firmware]
    ESP -->|PWM output 0/50/100%| LED[Simulated fan LED]
    ESP -->|POST readings + demo alert/fan state every 2 seconds| Bridge[Node bridge on laptop :4174]
    App[Poultri mobile app] -->|GET every 1 second over LAN| Bridge
    Bridge -->|latest reading + setpoint + alert + fan state| App
    App --> Prompt[Inspection prompt + simulated fan percentage]
```

- **Wokwi:** one simulated ESP32, DHT22, and PWM LED. The firmware uses a demo-only 25°C alert setpoint and 0/50/100% LED levels.
- **Bridge:** one Node.js process using built-in modules only. It keeps the most recent valid sample in memory.
- **Mobile:** one Expo Router screen. It polls the bridge, displays temperature, humidity, setpoint, fan percentage, connection state, and one acknowledgeable prompt.
- **Network paths:** Wokwi firmware calls `http://host.wokwi.internal:4174`; the phone calls `http://<laptop-LAN-IPv4>:4174`.

This is the **demo architecture**, not the planned farm installation. The concept note's on-site processing and internet-independent monitoring are future capabilities; this Wokwi-to-laptop path does not test them. The 25°C threshold and fan levels are demo choices because the concept note defines no numeric values. The LED is a visual indicator only, not a connected fan.

The Wokwi Private Gateway is required for the simulator to reach the laptop. Wokwi's current networking guide says private-gateway access is for paying users; confirm your Wokwi plan/license before depending on this path. The public gateway cannot reach the laptop's local network. Wokwi for VS Code includes a bundled gateway, but its local endpoint must be available at `ws://localhost:9011`. In the verification run recorded on 2026-10-15, the simulator started and printed DHT22 readings, but reported that this endpoint was unavailable, so no readings reached the bridge. This is a dated observation, not a statement about the gateway's current state. [Wokwi Wi-Fi and gateway guide](https://docs.wokwi.com/guides/esp32-wifi), [Wokwi VS Code project configuration](https://docs.wokwi.com/vscode/project-config).

## Prerequisites

1. Windows, VS Code, Git, Node.js LTS, and npm.
2. Python 3.9+ and PlatformIO Core (or the VS Code **PlatformIO IDE** extension, which provides the PlatformIO workflow). [PlatformIO's installation guide](https://docs.platformio.org/en/latest/core/installation/methods/installer-script.html) documents the isolated Core installer; [its requirements](https://docs.platformio.org/en/latest/core/installation/requirements.html) list supported Python versions.
3. VS Code extensions: **PlatformIO IDE** and **Wokwi for VS Code**. Sign in/activate Wokwi as prompted.
4. A Wokwi for VS Code license that can use the private gateway. The guide below configures its local gateway at `ws://localhost:9011`.
5. An Android phone and laptop on the same private Wi-Fi for final acceptance. The phone must be able to reach the laptop's private IPv4 address.

If the Wokwi private gateway is unavailable, finish the sensor-only serial stage. The end-to-end local bridge demo is blocked until private gateway access is available; do not replace the agreed local architecture with a cloud tunnel or broker.

## Project tree

The files below are present in the repository. `mobile/` includes the one-screen app and a local Expo config plugin for Android's private-LAN HTTP demo setting.

```text
poultri/
├─ bridge/
│  ├─ package.json
│  └─ server.mjs
├─ mobile/
│  ├─ app.json                         # loads the local HTTP config plugin
│  ├─ plugins/with-local-bridge-http.js
│  └─ src/app/index.tsx                # implemented demo screen
└─ wokwi/
   ├─ platformio.ini
   ├─ wokwi.toml
   ├─ diagram.json
   └─ src/
      └─ main.cpp
```

## Stage 1: build and prove the Wokwi sensor project

The Wokwi project files already exist under `wokwi/`; do not create a second PlatformIO project. Install PlatformIO Core with the [official isolated installer](https://docs.platformio.org/en/latest/core/installation/methods/installer-script.html), or install the PlatformIO IDE extension in VS Code. If using the Core installer, download `get-platformio.py` from the linked official instructions and run it with Python 3.9 or newer:

```powershell
python .\get-platformio.py
```

The installer keeps Core in the user profile and may not add `pio` to `PATH`.

For this Windows setup, locate the Core executable from PowerShell and build the existing project:

```powershell
$pio = Join-Path $env:USERPROFILE '.platformio\penv\Scripts\platformio.exe'
& $pio --version
Push-Location .\wokwi
& $pio run
Pop-Location
```

If PlatformIO IDE is providing the CLI on `PATH`, `cd .\wokwi; pio run` is equivalent. The first build downloads the ESP32 platform, compiler, Arduino framework, and DHT library; an internet connection is needed for that initial build. A successful build creates `.pio/build/esp32dev/firmware.bin` and `firmware.elf` for Wokwi.

Open the repository in VS Code. If the extension does not find the nested project automatically, use Command Palette → **Wokwi: Select Config File** and select `wokwi/wokwi.toml`; Wokwi requires selecting a config when it is below the workspace root. Then run Command Palette → **Wokwi: Start Simulator**. The following sections document the checked-in project files for reference. No file copying is needed.

### `wokwi/platformio.ini`

```ini
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
monitor_speed = 115200
lib_deps =
  beegee-tokyo/DHT sensor library for ESPx
```

Wokwi's DHT22 reference recommends the ESPx DHT library when reading this part from ESP32. Its PlatformIO listing currently marks the library as no longer maintained, so treat it as a Wokwi demo dependency and reassess the library before connecting physical hardware. [DHT22 reference](https://docs.wokwi.com/parts/wokwi-dht22), [PlatformIO library listing](https://registry.platformio.org/libraries/beegee-tokyo/DHT%20sensor%20library%20for%20ESPx).

### `wokwi/diagram.json`

```json
{
  "version": 1,
  "author": "Poultri demo",
  "editor": "wokwi",
  "parts": [
    { "type": "board-esp32-devkit-c-v4", "id": "esp", "top": 0, "left": 0, "attrs": {} },
    { "type": "wokwi-dht22", "id": "dht1", "top": -20, "left": 230, "attrs": { "temperature": "24", "humidity": "60" } },
    { "type": "wokwi-resistor", "id": "r1", "top": 30, "left": 410, "attrs": { "value": "220" } },
    { "type": "wokwi-led", "id": "fanLed", "top": -10, "left": 510, "attrs": { "color": "green", "label": "Sim fan" } }
  ],
  "connections": [
    [ "esp:TX", "$serialMonitor:RX", "", [] ],
    [ "esp:RX", "$serialMonitor:TX", "", [] ],
    [ "esp:3V3", "dht1:VCC", "red", [] ],
    [ "esp:GND.1", "dht1:GND", "black", [] ],
    [ "esp:15", "dht1:SDA", "green", [] ],
    [ "esp:18", "r1:1", "green", [] ],
    [ "r1:2", "fanLed:A", "green", [] ],
    [ "fanLed:C", "esp:GND.1", "black", [] ]
  ]
}
```

The DHT22 data pin is GPIO 15; the simulated fan LED is driven on GPIO 18 through a 220Ω resistor. Change the temperature and humidity controls while the simulation is running. The LED shows 0% below 25°C, 50% from 25°C to below 27°C, and 100% at or above 27°C. It is only a visual proxy; no physical fan is controlled. [Wokwi DHT22 controls](https://docs.wokwi.com/parts/wokwi-dht22).

### `wokwi/wokwi.toml`

```toml
[wokwi]
version = 1
firmware = '.pio/build/esp32dev/firmware.bin'
elf = '.pio/build/esp32dev/firmware.elf'

[net]
gateway = 'ws://localhost:9011'
```

Wokwi reads this file next to `platformio.ini`; build the firmware before starting the simulator. The local gateway setting connects the VS Code simulation to the private gateway. [PlatformIO project setup](https://docs.wokwi.com/vscode/platformio), [gateway configuration](https://github.com/wokwi/wokwigw#usage).

### `wokwi/src/main.cpp`

```cpp
#include <DHTesp.h>
#include <HTTPClient.h>
#include <WiFi.h>

namespace {
constexpr int DHT_PIN = 15;
constexpr int FAN_LED_PIN = 18;
constexpr float ALERT_SETPOINT_C = 25.0f;
constexpr float FULL_FAN_SETPOINT_C = 27.0f;
constexpr unsigned long SAMPLE_INTERVAL_MS = 2000;
constexpr unsigned long WIFI_RETRY_MS = 5000;
constexpr char BRIDGE_URL[] = "http://host.wokwi.internal:4174/api/reading";

DHTesp dht;
unsigned long lastSampleAt = 0;
unsigned long lastWifiAttemptAt = 0;

void retryWifiWhenDue(unsigned long now) {
  if (WiFi.status() == WL_CONNECTED || now - lastWifiAttemptAt < WIFI_RETRY_MS) {
    return;
  }

  lastWifiAttemptAt = now;
  Serial.println("Wokwi Wi-Fi disconnected; retrying");
  WiFi.begin("Wokwi-GUEST", "", 6);
}

int fanSpeedFor(float temperatureC) {
  if (temperatureC >= FULL_FAN_SETPOINT_C) return 100;
  if (temperatureC >= ALERT_SETPOINT_C) return 50;
  return 0;
}

void postReading(float temperatureC, float humidityPct, bool alertActive, int fanSpeedPct) {
  WiFiClient client;
  HTTPClient http;
  http.setTimeout(1500);

  if (!http.begin(client, BRIDGE_URL)) {
    Serial.println("Bridge URL setup failed");
    return;
  }

  http.addHeader("Content-Type", "application/json");
  String body = "{\"temperatureC\":" + String(temperatureC, 1) +
                ",\"humidityPct\":" + String(humidityPct, 1) +
                ",\"setpointC\":" + String(ALERT_SETPOINT_C, 1) +
                ",\"alertActive\":" + String(alertActive ? "true" : "false") +
                ",\"fanSpeedPct\":" + String(fanSpeedPct) + "}";
  int status = http.POST(body);
  Serial.printf("Bridge POST status: %d\n", status);
  http.end();
}
}  // namespace

void setup() {
  Serial.begin(115200);
  dht.setup(DHT_PIN, DHTesp::DHT22);
  pinMode(FAN_LED_PIN, OUTPUT);
  analogWrite(FAN_LED_PIN, 0);
  WiFi.mode(WIFI_STA);
  WiFi.begin("Wokwi-GUEST", "", 6);
  lastWifiAttemptAt = millis();
  Serial.println("Poultri Wokwi demo starting");
  Serial.println("Demo rule: alert at 25.0 C; simulated fan 0/50/100 percent");
}

void loop() {
  unsigned long now = millis();
  retryWifiWhenDue(now);

  if (now - lastSampleAt < SAMPLE_INTERVAL_MS) {
    delay(20);
    return;
  }
  lastSampleAt = now;

  TempAndHumidity sample = dht.getTempAndHumidity();
  if (isnan(sample.temperature) || isnan(sample.humidity)) {
    Serial.printf("DHT22 read failed: %s\n", dht.getStatusString());
    return;
  }

  const bool alertActive = sample.temperature >= ALERT_SETPOINT_C;
  const int fanSpeedPct = fanSpeedFor(sample.temperature);
  analogWrite(FAN_LED_PIN, fanSpeedPct * 255 / 100);

  Serial.printf("Temperature: %.1f C | Humidity: %.1f %% | Alert: %s | Simulated fan: %d%%\n",
                sample.temperature, sample.humidity, alertActive ? "ACTIVE" : "CLEAR", fanSpeedPct);
  if (WiFi.status() == WL_CONNECTED) {
    postReading(sample.temperature, sample.humidity, alertActive, fanSpeedPct);
  } else {
    Serial.println("Reading not sent; Wi-Fi is disconnected");
  }
}
```

After building, run the simulator from VS Code Command Palette → **Wokwi: Start Simulator**. Use the DHT22 controls to change temperature and humidity and confirm the serial values, alert state, and LED output follow the controls. The firmware reads every two seconds because that matches the DHT22 sampling interval. It continues printing readings if Wi-Fi or the bridge is unavailable. The diagram starts at 24°C. At 25°C the firmware activates the alert and sets the LED to 50%; at 27°C it sets the LED to 100%. The app polls once per second and mirrors the next fresh reading.

To rebuild from the repository root:

```powershell
$pio = Join-Path $env:USERPROFILE '.platformio\penv\Scripts\platformio.exe'
Push-Location .\wokwi
& $pio run
Pop-Location
```

If VS Code is already providing `pio` on `PATH`, use `pio run` instead. When Wokwi reports that `ws://localhost:9011` is unavailable, the simulator can still demonstrate the DHT22 locally, but the bridge and mobile app will receive no new samples until the Private Gateway is active.

## Stage 2: run the local Node bridge

The bridge files already exist under `bridge/`. It stores only one reading in memory. It has no database, UI, cloud dependency, authentication, or external npm package. Keep it on a trusted private LAN and do not tunnel it to the public internet.

### `bridge/package.json`

```json
{
  "name": "poultri-local-bridge",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node server.mjs"
  }
}
```

### `bridge/server.mjs`

```js
import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';

const PORT = 4174;
const MAX_BODY_BYTES = 1024;
let latestReading = null;

function json(response, status, value) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  response.end(JSON.stringify(value));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let tooLarge = false;

    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        tooLarge = true;
        chunks.length = 0;
      } else if (!tooLarge) {
        chunks.push(chunk);
      }
    });

    request.on('end', () => {
      if (tooLarge) {
        reject(Object.assign(new Error('Request body is too large'), { status: 413 }));
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(Object.assign(new Error('Malformed JSON'), { status: 400 }));
      }
    });
    request.on('error', reject);
  });
}

async function route(request, response) {
  const url = new URL(request.url ?? '/', 'http://localhost');

  if (request.method === 'GET' && url.pathname === '/api/health') {
    json(response, 200, { ok: true });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/reading') {
    json(response, 200, { reading: latestReading });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/reading') {
    const value = await readJson(request);
    const validTemperature = Number.isFinite(value?.temperatureC) && value.temperatureC >= -40 && value.temperatureC <= 80;
    const validHumidity = Number.isFinite(value?.humidityPct) && value.humidityPct >= 0 && value.humidityPct <= 100;
    const validSetpoint = Number.isFinite(value?.setpointC) && value.setpointC >= -40 && value.setpointC <= 80;
    const validAlert = typeof value?.alertActive === 'boolean';
    const validFanSpeed = Number.isInteger(value?.fanSpeedPct) && value.fanSpeedPct >= 0 && value.fanSpeedPct <= 100;
    if (!validTemperature || !validHumidity || !validSetpoint || !validAlert || !validFanSpeed) {
      json(response, 400, { error: 'Reading fields are invalid or outside the accepted range' });
      return;
    }

    latestReading = {
      temperatureC: value.temperatureC,
      humidityPct: value.humidityPct,
      setpointC: value.setpointC,
      alertActive: value.alertActive,
      fanSpeedPct: value.fanSpeedPct,
      receivedAt: new Date().toISOString(),
    };
    json(response, 201, { ok: true });
    return;
  }

  json(response, 404, { error: 'Not found' });
}

const server = createServer((request, response) => {
  void route(request, response).catch((error) => {
    if (!response.headersSent) {
      json(response, error.status ?? 500, { error: error.message ?? 'Internal error' });
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Poultri local bridge listening on port ${PORT}`);
  console.log(`Wokwi URL: http://host.wokwi.internal:${PORT}`);

  const addresses = Object.values(networkInterfaces())
    .flatMap((items) => items ?? [])
    .filter((item) => (item.family === 'IPv4' || item.family === 4) && !item.internal)
    .map((item) => `http://${item.address}:${PORT}`);
  console.log('Candidate phone URLs (choose the laptop address on the same Wi-Fi):');
  for (const address of addresses) console.log(`  ${address}`);
});
```

Run the bridge from the `bridge/` directory:

```powershell
npm.cmd start
```

Allow Node through Windows Firewall on **Private networks only** if prompted. Choose the printed phone URL matching the laptop's Wi-Fi adapter; do not use `host.wokwi.internal` in the phone app. Wokwi uses that special hostname to reach the laptop; Android uses the laptop's LAN IPv4.

### Bridge contract

| Request | Result |
|---|---|
| `GET /api/health` | `200 { "ok": true }` |
| `GET /api/reading` before data | `200 { "reading": null }` |
| `POST /api/reading` | JSON `{ "temperatureC": 24.0, "humidityPct": 60.0, "setpointC": 25.0, "alertActive": false, "fanSpeedPct": 0 }`; success is `201 { "ok": true }` |
| `GET /api/reading` after data | `200 { "reading": { "temperatureC": 24.0, "humidityPct": 60.0, "setpointC": 25.0, "alertActive": false, "fanSpeedPct": 0, "receivedAt": "<ISO-8601>" } }` |
| Bad JSON / invalid values / unknown route | `400` or `413` / `400` / `404` JSON error |

Quick PowerShell checks while the bridge is running:

```powershell
Invoke-RestMethod http://127.0.0.1:4174/api/health
Invoke-RestMethod http://127.0.0.1:4174/api/reading
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:4174/api/reading -ContentType 'application/json' -Body '{"temperatureC":24,"humidityPct":60,"setpointC":25,"alertActive":false,"fanSpeedPct":0}'
Invoke-RestMethod http://127.0.0.1:4174/api/reading
```

The stored sample is in-memory only and disappears when the bridge stops. The bridge accepts DHT22 temperature values from -40°C through 80°C, relative humidity from 0% through 100%, a setpoint from -40°C through 80°C, and a simulated fan percentage from 0 through 100. These are input bounds, not poultry guidance.

## Stage 3: connect the mobile app

The app uses Expo SDK 57 and Expo Router. The implemented screen at `mobile/src/app/index.tsx` uses React Native primitives and the installed safe-area package. The code below documents its current behavior.

### Android local HTTP configuration

The bridge is local HTTP for this private-LAN demo. Android 9+ blocks cleartext traffic by default. The existing `mobile/app.json` loads a small local config plugin from `mobile/plugins/with-local-bridge-http.js`:

```json
"plugins": [
  "expo-router",
  "./plugins/with-local-bridge-http"
]
```

The plugin sets `android:usesCleartextTraffic="true"` during native prebuild. This broad HTTP permission is only for the private-LAN prototype. Expo Go is useful for screen iteration but does not rebuild its own native manifest from this project's config; verify with a fresh APK before the phone demo. [Expo SDK 57 app config](https://docs.expo.dev/versions/v57.0.0/config/app/).

The app config blocks unused Android storage, overlay, and vibration permissions. The app only needs Internet access to reach the local bridge; no file, notification, or overlay permission is part of this MVP.

### `mobile/plugins/with-local-bridge-http.js`

```js
const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withLocalBridgeHttp(config) {
  return withAndroidManifest(config, (configWithManifest) => {
    const application = configWithManifest.modResults.manifest.application?.[0];
    if (application) {
      application.$['android:usesCleartextTraffic'] = 'true';
    }
    return configWithManifest;
  });
};
```

### `mobile/src/app/index.tsx`

```tsx
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Reading = {
  temperatureC: number;
  humidityPct: number;
  setpointC: number;
  alertActive: boolean;
  fanSpeedPct: number;
  receivedAt: string;
};

type ReadingResponse = { reading: Reading | null };
type AlertRecord = { acknowledged: boolean; recovered: boolean };

const STALE_AFTER_MS = 5000;

async function getJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function isReading(value: unknown): value is Reading {
  if (!value || typeof value !== 'object') return false;
  const sample = value as Partial<Reading>;
  return Number.isFinite(sample.temperatureC)
    && Number.isFinite(sample.humidityPct)
    && Number.isFinite(sample.setpointC)
    && typeof sample.alertActive === 'boolean'
    && typeof sample.fanSpeedPct === 'number'
    && Number.isInteger(sample.fanSpeedPct)
    && sample.fanSpeedPct >= 0
    && sample.fanSpeedPct <= 100
    && typeof sample.receivedAt === 'string'
    && Number.isFinite(Date.parse(sample.receivedAt));
}

function Button({
  title,
  onPress,
  disabled = false,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, secondary && styles.secondaryButton, disabled && styles.disabledButton]}
    >
      <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{title}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const [bridgeUrl, setBridgeUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState('');
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState('Enter the laptop bridge URL, then connect.');
  const [reading, setReading] = useState<Reading | null>(null);
  const [baseline, setBaseline] = useState<number | null>(null);
  const [alertRecord, setAlertRecord] = useState<AlertRecord | null>(null);
  const [now, setNow] = useState(0);
  const baselineRef = useRef<number | null>(null);
  const alertRef = useRef<AlertRecord | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!connected || !activeUrl) return undefined;
    let active = true;
    let busy = false;

    const poll = async () => {
      if (busy) return;
      busy = true;
      try {
        const payload = await getJson<ReadingResponse>(`${activeUrl}/api/reading`);
        if (!active) return;
        if (payload.reading === null) {
          setReading(null);
          return;
        }
        if (!isReading(payload.reading)) throw new Error('Bridge returned an invalid reading.');

        const sample = payload.reading;
        setReading(sample);
        const fresh = Date.now() - Date.parse(sample.receivedAt) <= STALE_AFTER_MS;
        if (!fresh) return;

        if (baselineRef.current === null) {
          baselineRef.current = sample.temperatureC;
          setBaseline(sample.temperatureC);
        }

        const recovered = !sample.alertActive;
        if (alertRef.current === null && sample.alertActive) {
          const next = { acknowledged: false, recovered: false };
          alertRef.current = next;
          setAlertRecord(next);
        } else if (alertRef.current !== null) {
          const next = { ...alertRef.current, recovered };
          alertRef.current = next;
          setAlertRecord(next);
        }
      } catch (error) {
        if (active) {
          setConnected(false);
          setMessage(`Bridge disconnected: ${error instanceof Error ? error.message : 'request failed'}`);
        }
      } finally {
        busy = false;
      }
    };

    void poll();
    const timer = setInterval(() => void poll(), 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [activeUrl, connected]);

  const sampleAgeMs = reading ? Math.max(0, now - Date.parse(reading.receivedAt)) : 0;
  const stale = reading !== null && sampleAgeMs > STALE_AFTER_MS;
  const status = !connected && activeUrl
    ? (stale ? 'DISCONNECTED · STALE READING' : 'DISCONNECTED')
    : stale
      ? 'STALE READING'
      : connected
        ? (reading ? 'CONNECTED' : 'WAITING FOR WOKWI DATA')
        : 'DISCONNECTED';

  async function connect() {
    const normalized = bridgeUrl.trim().replace(/\/+$/, '');
    if (!/^http:\/\//i.test(normalized)) {
      setMessage('Enter the laptop URL starting with http://');
      return;
    }

    setConnecting(true);
    setConnected(false);
    setMessage('Checking bridge…');
    try {
      const health = await getJson<{ ok: boolean }>(`${normalized}/api/health`);
      if (health.ok !== true) throw new Error('Bridge health check failed.');
      baselineRef.current = null;
      alertRef.current = null;
      setBaseline(null);
      setAlertRecord(null);
      setReading(null);
      setActiveUrl(normalized);
      setConnected(true);
      setMessage('Connected. Waiting for a fresh Wokwi reading.');
    } catch (error) {
      setMessage(`Could not connect: ${error instanceof Error ? error.message : 'request failed'}`);
    } finally {
      setConnecting(false);
    }
  }

  function acknowledge() {
    if (!alertRef.current) return;
    const next = { ...alertRef.current, acknowledged: true };
    alertRef.current = next;
    setAlertRecord(next);
  }

  function resetDemo() {
    baselineRef.current = null;
    alertRef.current = null;
    setBaseline(null);
    setAlertRecord(null);
    setMessage('Demo reset. The next fresh reading becomes the reference.');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Image source={require('../../assets/poultri-logo.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="Official Poultri logo" />
          <Image source={require('../../assets/poultri-wordmark.png')} style={styles.wordmark} resizeMode="contain" accessibilityLabel="Poultri" />
        </View>

        <Text style={styles.eyebrow}>WOKWI DEMO · SIMULATED DATA</Text>
        <View style={styles.statusCard}>
          <Text style={styles.status}>{status}</Text>
          <Text style={styles.supporting}>{message}</Text>
        </View>

        <View style={styles.connectCard}>
          <Text style={styles.sectionTitle}>Local bridge</Text>
          <TextInput
            accessibilityLabel="Laptop bridge URL"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            onChangeText={setBridgeUrl}
            placeholder="http://<laptop-LAN-IP>:4174"
            placeholderTextColor="#87938A"
            style={styles.input}
            value={bridgeUrl}
          />
          <Button title={connecting ? 'Connecting…' : 'Connect'} onPress={() => void connect()} disabled={connecting} />
          {connecting && <ActivityIndicator color="#2B6841" style={styles.spinner} />}
        </View>

        <View style={styles.readingCard}>
          <Text style={styles.sectionTitle}>House 1</Text>
          <View style={styles.metrics}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>TEMPERATURE</Text>
              <Text style={styles.metricValue}>{reading ? `${reading.temperatureC.toFixed(1)}°C` : '—'}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>HUMIDITY</Text>
              <Text style={styles.metricValue}>{reading ? `${reading.humidityPct.toFixed(1)}%` : '—'}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>SIM FAN</Text>
              <Text style={styles.metricValue}>{reading ? `${reading.fanSpeedPct}%` : '—'}</Text>
            </View>
          </View>
          <Text style={styles.supporting}>
            {reading ? `Sample age: ${Math.floor(sampleAgeMs / 1000)}s` : 'No reading received yet'}
            {stale ? ' · stale' : ''}
          </Text>
          <Text style={styles.demoLabel}>Wokwi simulated data · 25°C demo setpoint · fan is an LED indicator</Text>
        </View>

        <View style={styles.alertCard}>
          <Text style={styles.sectionTitle}>Inspection prompt</Text>
          {!alertRecord ? (
            <Text style={styles.supporting}>
              {baseline === null
                ? 'Waiting for the reference reading.'
                : `Reference: ${baseline.toFixed(1)}°C · prompt at ${reading?.setpointC.toFixed(1) ?? '25.0'}°C.`}
            </Text>
          ) : (
            <>
              <Text style={styles.alertTitle}>
                {alertRecord.recovered ? 'Reading recovered' : 'Temperature threshold reached'}
              </Text>
              <Text style={styles.supporting}>
                {alertRecord.acknowledged ? 'Acknowledged' : 'Please inspect House 1'}
                {alertRecord.recovered ? ' · prompt retained' : ''}
              </Text>
              {!alertRecord.acknowledged && <Button title="Acknowledge" onPress={acknowledge} />}
            </>
          )}
        </View>

        <Button title="Reset demo" onPress={resetDemo} secondary />
        <Text style={styles.footer}>Prototype only · no physical sensor or farm validation</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7F3' },
  content: { padding: 20, gap: 14 },
  brand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 8 },
  logo: { width: 44, height: 44 },
  wordmark: { width: 150, height: 48 },
  eyebrow: { color: '#42674C', fontSize: 11, fontWeight: '800', letterSpacing: 1, textAlign: 'center' },
  statusCard: { backgroundColor: '#E8F0E8', borderRadius: 14, padding: 16, gap: 5 },
  status: { color: '#173D28', fontSize: 15, fontWeight: '800' },
  supporting: { color: '#59675D', fontSize: 13, lineHeight: 19 },
  connectCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, gap: 10 },
  readingCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, gap: 12 },
  alertCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, gap: 10 },
  sectionTitle: { color: '#173D28', fontSize: 16, fontWeight: '800' },
  input: { minHeight: 48, borderColor: '#CBD5CC', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, color: '#203629', fontSize: 14 },
  button: { minHeight: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, backgroundColor: '#27643D' },
  secondaryButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#AEBDB0' },
  disabledButton: { opacity: 0.55 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  secondaryButtonText: { color: '#254C32' },
  spinner: { marginTop: 4 },
  metrics: { flexDirection: 'row', gap: 12 },
  metric: { flex: 1, backgroundColor: '#F3F6F1', borderRadius: 12, padding: 14, gap: 6 },
  metricLabel: { color: '#627266', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  metricValue: { color: '#173D28', fontSize: 26, fontWeight: '800' },
  demoLabel: { color: '#7A5B23', fontSize: 11, fontWeight: '700', lineHeight: 16 },
  alertTitle: { color: '#8A4D12', fontSize: 17, fontWeight: '800' },
  footer: { color: '#718075', fontSize: 11, textAlign: 'center', paddingVertical: 8 },
});
```

## Stage 4: run each part and connect them

Use three terminals from the repository root, one per process:

```powershell
# Terminal 1
cd .\bridge
npm.cmd start
```

```powershell
# Terminal 2
$pio = Join-Path $env:USERPROFILE '.platformio\penv\Scripts\platformio.exe'
Push-Location .\wokwi
& $pio run
Pop-Location
```

Start the Wokwi simulator in VS Code after the build. If the repository root is open and Wokwi does not find the nested project, use Command Palette → **Wokwi: Select Config File** and choose `wokwi/wokwi.toml`. The `[net] gateway` setting above points to `ws://localhost:9011`; confirm the Private Gateway is active. Click the DHT22, change the temperature and humidity, and confirm the serial values follow the controls. The Wokwi firmware should log successful HTTP POST status codes. If the simulator reports that the gateway is unavailable, Wokwi can run the sensor simulation by itself, but the mobile app will not receive readings until the Private Gateway is active.

```powershell
# Terminal 3
cd .\mobile
npm.cmd install
npx.cmd expo start
```

Scan the QR code with Expo Go for UI iteration. Enter the laptop's Wi-Fi IPv4 bridge URL in the app and tap **Connect**. For a complete alert demo, leave the DHT22 at 24°C while the app connects; raise it to 25°C for an alert and 50% fan indication, then to 27°C for 100%. Lower it below 25°C to show recovery. For acceptance on Android, create a fresh preview APK after changing `app.json`:

```powershell
npx.cmd eas-cli@latest build --platform android --profile preview
```

Install that APK, keep phone and laptop on the same Wi-Fi, and enter the same laptop URL. If Windows Firewall prompts, permit the bridge only on private networks. If the phone cannot connect, check the laptop URL, same-Wi-Fi status, port 4174 firewall allowance, and that Node is still running.

## Demo logic and failure behavior

- On successful Connect, `/api/health` is checked and the app clears the prior session's reading, reference, and prompt.
- The app polls `/api/reading` every second. The first fresh sample is retained as session context; firmware-reported `setpointC`, `alertActive`, and `fanSpeedPct` drive the displayed alert and fan state. Humidity is display-only.
- The firmware activates the illustrative prompt at **25°C or higher**. Fan indication is 0% below 25°C, 50% from 25°C to below 27°C, and 100% at or above 27°C. Both values are demo-only and are not poultry guidance.
- One prompt is created on the first active sample. It remains after acknowledgement and after recovery; lowering temperature below 25°C shows recovery.
- Reset clears the local reference and prompt. The sensor value is not changed, so lower it below 25°C or restart Wokwi before a new run.
- Data older than five seconds is stale and cannot create or update a prompt. A request failure changes the connection status to disconnected and preserves the last displayed sample with its age/stale label.
- If Wokwi stops posting, the bridge continues returning the last sample; after five seconds the app marks it stale. If the bridge stops, the app reports disconnected.
- No readings, URL, or prompt are persisted across launches. There are no physical actuators, diagnoses, accounts, cloud services, or physical sensor inputs; the Wokwi LED is a simulated fan indicator only.

## AI chatbot plan (future work, not in this demo)

The current inspection prompt is a deterministic firmware rule; this prototype does not contain a chatbot or send sensor data to an AI service. The supplied concept note does not define an AI chatbot. Keep chat as a separate future idea, outside the two-minute demo, until its product scope and approved content are defined.

```mermaid
flowchart LR
    User[Presenter or user] --> Chat[Future mobile chat screen]
    Chat -->|question + optional latest simulated reading| API[Future chat API]
    API --> Guard[Validate input and apply response boundaries]
    Guard --> Provider[Provider adapter]
    Provider --> Model[AI service selected later]
    Model --> Provider
    Provider --> API
    API --> Chat
```

### Planned conversation flow

1. The user opens chat from the demo screen and enters a question.
2. The app may attach only the latest reading if the user chooses to include it. Do not send account, farm, flock, location, or persistent history data.
3. A future server-side API validates the message, applies size/time limits, and passes a bounded prompt plus approved reference material to a provider adapter. Keep API credentials on the server; never embed them in the mobile app or Wokwi firmware.
4. The adapter returns a concise answer and any approved reference links. The app labels the answer as AI-generated and offers a retry or clear-chat action.
5. If the question asks for animal diagnosis, medication, safety-critical action, or validated poultry guidance, the assistant declines to advise and directs the user to a qualified poultry professional.

### Implementation sequence when authorized

1. Agree on allowed question types, refusal wording, source material, data retention, provider, and whether the API can be reached during the demo.
2. Write a small approved knowledge pack and example questions before building chat UI.
3. Add a minimal chat screen and typed request/response contract; keep it separate from the sensor alert rule.
4. Add the server-side API and provider adapter only after choosing a provider. Add timeouts, input limits, clear errors, and no message logging by default.
5. Evaluate the allowed questions and refusals, test offline/provider failure behavior, then decide whether chat belongs in the two-minute demo.

## Verification and acceptance

1. **Firmware build:** from `wokwi/`, `pio run` succeeds. The simulator starts and DHT22 slider changes appear in serial output.
2. **Bridge:** check health, empty state, valid POST/GET, malformed JSON rejection, invalid range rejection, and latest-reading replacement. If installed, run `wokwi-cli lint` on `wokwi/diagram.json`.
3. **Mobile static checks:** from `mobile/`, run `npm.cmd run lint` and `npx.cmd tsc --noEmit`. Resolve Expo config with `npx.cmd expo config --type prebuild` and verify the local HTTP plugin loads.
4. **Phone network check:** with the bridge, gateway, and Wokwi running, Android on the same Wi-Fi sees samples and fan state update after slider changes. Verify 24.9°C = clear/0%, 25.0°C = alert/50%, 27.0°C = alert/100%, and below 25°C = recovered/0%. Stop Wokwi and confirm stale. Acknowledge, reset the app state, and confirm the next fresh reading becomes the session reference.
5. **Timed demo:** rehearse the presenter path in [mvp-requirements.md](mvp-requirements.md) with setup complete; it must finish in under two minutes.

Passing lint or type checks is not proof of Android network delivery. Do not describe this prototype as physical sensor integration, the concept note's on-site/offline system, physical fan control, a validated alert rule, or a field-tested product.

## Official references

- [Wokwi DHT22 reference](https://docs.wokwi.com/parts/wokwi-dht22)
- [Wokwi ESP32 Wi-Fi and Private Gateway](https://docs.wokwi.com/guides/esp32-wifi)
- [Wokwi PlatformIO projects](https://docs.wokwi.com/vscode/platformio)
- [Wokwi project configuration](https://docs.wokwi.com/vscode/project-config)
- [Expo SDK 57 app config](https://docs.expo.dev/versions/v57.0.0/config/app/)
- [Expo config plugins](https://docs.expo.dev/config-plugins/plugins/)
