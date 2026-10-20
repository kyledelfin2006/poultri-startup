# Poultri mobile demo

Expo / React Native TypeScript demo app for the Wokwi ESP32 + DHT22 simulation. It opens to a House 1 overview with temperature, humidity, simulated fan percentage, and connection/prompt state. The screens use a warm neutral canvas, charcoal cards, sage accents, and a terracotta inspection state; the supplied logo and wordmark are unchanged. Open House 1 to see the temperature and humidity icons, simulation setpoint, inspection prompt, combined app-only fan and vent panel, and local bridge connection controls. The fan drawing is still at 0% and spins at 50% or 100%; the vent follows the same percentage: closed, half-open, or fully open. Both show a dash while waiting and mark last-known values stale or disconnected. No physical fan, vent, or servo is connected or controlled. The house line drawing is decorative. The app displays simulated readings and is not connected to physical sensors or farm validated.

See the root [MVP requirements](../mvp-requirements.md) and [build guide](../build-requirements.md) for the demo flow, network setup, and acceptance criteria.

## Start development

Install Node.js LTS and Expo Go. Start the bridge from `bridge/` in a separate terminal, then from this directory run:

```powershell
npm.cmd install
npx.cmd expo start
```

Scan the QR code with Expo Go. Keep the development server running while using the app.

Open the **House 1** overview card, then enter the laptop's private Wi-Fi IPv4 URL with port `4174` on the detail screen (for example, `http://192.168.1.20:4174`) and tap **Connect to bridge**. Keep the phone and laptop on the same Wi-Fi. Wokwi must be running and posting samples to the bridge. See the root [build guide](../build-requirements.md) for complete setup.

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
