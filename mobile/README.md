# Poultri mobile demo

Expo / React Native TypeScript demo app for a local ESP32/DHT22 sensor or Wokwi simulation through the laptop bridge. It has Home, History, and Buddy tabs plus Settings, where the bridge URL, connection, and reset (with confirmation) live. Home shows House 1 with temperature, humidity, source-aware fan state, connection and inspection state, and a trend since connecting; History charts the bridge's recorded temperature; Buddy is a scripted helper with no AI model. Headings use Nunito and icons use Ionicons; the supplied logo and wordmark are unchanged. On House 1 detail the Wokwi fan drawing spins at 50% or 100%, a local ESP32 shows its fan relay as ON/OFF, and the vent stays an app-only visual. Readings are local prototype data, not farm validated.

See the root [MVP requirements](../mvp-requirements.md) and [build guide](../build-requirements.md) for the demo flow, network setup, and acceptance criteria.

## Start development

Install Node.js LTS and Expo Go. Start the bridge from `bridge/` in a separate terminal, then from this directory run:

```powershell
npm.cmd install
npx.cmd expo start
```

Scan the QR code with Expo Go. Keep the development server running while using the app.

Tap the settings button on Home, then enter the laptop's private Wi-Fi IPv4 URL with port `4174` (for example, `http://192.168.1.20:4174`) and tap **Connect to bridge**. Keep the phone, laptop, and ESP32 on the same private Wi-Fi. The physical sender sketch is in `../arduino/PoultriESP32/`; Wokwi remains an optional source. See the root [build guide](../build-requirements.md) for complete setup.

## Preview in a browser

For quick UI edits on the laptop, run the web build:

```powershell
npx.cmd expo start --web
```

Open http://localhost:8081, open **House 1**, and enter `http://localhost:4174` as the bridge URL. The bridge allows cross-origin requests so the browser can reach it. The browser preview is for UI work only; use Expo Go, the emulator, or the APK for the demo.

## Build an Android APK

The EAS `preview` profile creates an installable APK. Sign in, then start a build from this directory:

```powershell
npx.cmd eas-cli@latest login
npm.cmd run build:apk
```

EAS builds in the cloud and needs internet access. No APK or signing credentials are checked into the repository.

## Checks

```powershell
npx.cmd expo lint
npx.cmd tsc --noEmit
```

Android cleartext HTTP is enabled for this private-LAN demo by the local config plugin in `plugins/with-local-bridge-http.js`. The permission is broad to support the entered laptop URL; do not use this demo configuration as a production network policy.
