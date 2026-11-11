# Poultri mobile demo

Expo / React Native TypeScript demo app for a local ESP32/DHT22 sensor or Wokwi simulation through the laptop bridge. It opens to a House 1 overview with temperature, humidity, app-only simulated fan percentage, and connection/prompt state. Its light and dark screens pair deep evergreen and vivid leaf-green accents from the Poultri identity with pale green-tinted and white surfaces; yellow-green marks attention states. A built-in condensed display face adds character to headings and readings; the normal system sans-serif keeps instructions and controls easy to scan. No font dependency is added. The supplied logo and wordmark are unchanged. Open House 1 to see the demo setpoint, inspection prompt, and app-only fan and vent panel. A compact **Bridge setup** button opens a separate screen for the local bridge URL, connection, and session reset. The fan drawing is still at 0% and spins at 50% or 100%; the vent follows the same percentage: closed, half-open, or fully open. Both show a dash while waiting and mark last-known values stale or disconnected. No physical fan, vent, relay, or servo is connected or controlled. The house line drawing is decorative. Readings are local prototype data, not farm validated.

See the root [MVP requirements](../mvp-requirements.md) and [build guide](../build-requirements.md) for the demo flow, network setup, and acceptance criteria.

## Start development

Install Node.js LTS and Expo Go. Start the bridge from `bridge/` in a separate terminal, then from this directory run:

```powershell
npm.cmd install
npx.cmd expo start
```

Scan the QR code with Expo Go. Keep the development server running while using the app.

Open the **House 1** overview card, tap **Bridge setup**, then enter the laptop's private Wi-Fi IPv4 URL with port `4174` (for example, `http://192.168.1.20:4174`) and tap **Connect to bridge**. Keep the phone, laptop, and ESP32 on the same private Wi-Fi. The physical sender sketch is in `../arduino/PoultriESP32/`; Wokwi remains an optional source. See the root [build guide](../build-requirements.md) for complete setup.

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
