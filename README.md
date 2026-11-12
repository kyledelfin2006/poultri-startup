# Poultri Sensor + Mobile Demo

<p align="center">
  <img src="assets/poultri_full_logo.png" alt="Official Poultri full logo" width="190" />
</p>

## 🐔 What is Poultri?

**Poultri is a proposed on-site monitoring and environmental-control system for commercial poultry farms.** Its initial market includes layer and broiler farms, with a proposed pilot focused on layer farms. The goal is to help staff spot changing conditions and identify which house may need attention.

The longer-term concept may bring together:

- **Environmental sensors** for temperature, humidity, ammonia, and carbon dioxide.
- **Camera observations and farm records** to give staff more context.
- **A mobile app** for viewing monitoring information and alerts.
- **Optional farm-approved controls and SMS alerts**, depending on equipment compatibility, farm approval, and connectivity.

The concept plans on-site processing so core monitoring can continue during internet interruptions. That capability is untested; remote app access still depends on connectivity.

### What this demo shows

This repository demonstrates one small part of Poultri: **an ESP32/DHT22 sends temperature and humidity readings through a laptop bridge to the mobile app, and the physical ESP32 switches a fan relay at a demo 32°C threshold.** Wokwi remains available as a simulated source for repeatable tests. This is a local prototype, not a validated farm-control system.

> **Prototype status:** This local prototype can display physical DHT22 readings or Wokwi simulated data. The shared 32°C inspection/fan threshold and readings have not been validated on a farm and do not provide poultry-health guidance.

## Team

- **Aldrin Kyle Delfin** — Team Lead & System Architect
- **Nadah Isidro** — UI/UX Design
- **Lance Kyle Ebue** — Product Analyst
- **Ralph Xavier Macabante** — Software Developer

## What works in this demo

- `arduino/PoultriESP32/PoultriESP32.ino` reads a physical DHT22 on GPIO 4, switches a relay on GPIO 26 ON at 32°C or above and OFF below 32°C, and sends samples every 2.5 seconds over Wi-Fi to the local Node bridge. For a laptop-only USB route, `bridge/serial-forwarder.ps1` forwards the sketch's serial readings to the same bridge.
- Wokwi remains an optional simulated ESP32/DHT22 source for repeatable temperature changes.
- The mobile app has **Home**, **History**, and **Buddy** tabs plus **Settings**. Home shows House 1 with temperature, humidity, source-aware fan state, connection state, a trend since connecting, and the inspection state (No inspection needed, Inspect House 1, Acknowledged, Recovered). History charts the bridge's recorded temperature; Buddy is a scripted helper with no AI model. The demo setpoint shown comes from each reading (25°C from Wokwi, 32°C from the local ESP32). Headings use a rounded sans (Nunito) and icons come from Ionicons; the official logo and wordmark are unchanged. The source label identifies local ESP32/DHT22 hardware or Wokwi simulation.
- The first fresh reading after connecting or resetting is saved as session context. A reading at or above the **32°C threshold** activates both the inspection prompt and physical fan relay. Acknowledgement displays for 60 seconds; a fresh below-threshold reading then clears the prompt, while an active alert returns to INSPECT. An unacknowledged recovered prompt remains until reset. The app reports the physical relay command as ON/OFF; Wokwi mirrors the same threshold with its simulated fan LED.
- On House 1 detail, the fan drawing follows the physical ESP32 relay command or the Wokwi simulated percentage. The vent remains an app-only visual. Both visuals stop for stale or disconnected readings; fan animation also respects reduced-motion settings. The app reports the relay command but does not measure fan rotation.
- Acknowledge the prompt and lower the temperature below 32°C to show recovery. Open **Settings**, tap **Reset session**, then **Reset** to confirm, to clear the app session.
- Humidity is display-only. All values and the alert rule are illustrative.

**Rule note:** the concept note does not define a numerical temperature threshold or fan-control rule. The shared **32°C inspection and relay threshold is a demo-only choice**, not a farm setting or poultry-health limit. The ESP32 controls the local relay; the app only reports its command state. Wokwi's LED remains a simulated indicator.

## Run the connected demo

This section is a from-scratch Windows setup. The physical ESP32/DHT22 can send over private Wi-Fi or USB serial through the laptop; the Android app connects to the local bridge. The fan is switched through the ESP32 relay output. Wokwi is an optional simulated input.

~~~text
Physical ESP32 + DHT22 ──private Wi-Fi───> Node bridge on laptop :4174
Physical ESP32 + DHT22 ──USB serial forwarder──> Node bridge on laptop :4174
Wokwi simulator (optional) ──────────────> Node bridge on laptop :4174
Android app ─────────────────────────────> Node bridge on laptop :4174
~~~

With Wokwi for VS Code 4.0, this project reached the laptop bridge without a `[net] gateway` override. The Wokwi terminal showed `Bridge POST status: 201`, and the Android emulator displayed the same simulated reading on 2026-10-18. Browser-hosted Wokwi networking may differ. [Wokwi VS Code project configuration](https://docs.wokwi.com/vscode/project-config)

### A. Download and install the laptop tools (one time)

1. Install [Git for Windows](https://git-scm.com/download/win). Keep the installer’s default options.
2. Install [Visual Studio Code](https://code.visualstudio.com/Download). This is the code editor named **Visual Studio Code**, not the full Visual Studio IDE.
3. Install the current **LTS** release of [Node.js](https://nodejs.org/en/download). npm is included with Node.js.
4. Install **Arduino IDE 2.x** for the physical ESP32 path. The **PlatformIO IDE** and **Wokwi for VS Code** extensions in VS Code are optional and only needed for the Wokwi simulator path. [PlatformIO setup](https://docs.platformio.org/en/latest/integration/ide/vscode.html) · [Wokwi setup](https://docs.wokwi.com/vscode/getting-started)
5. Install [Expo Go from Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) if you want to preview UI changes on a phone. The fully connected Android demo uses the preview APK in step D, because that APK includes this project's local-network HTTP setting.
6. Keep the laptop connected to the internet for the first firmware build, npm install, and EAS APK build. For the phone demo, connect the phone and laptop to the same private Wi-Fi.

#### Laptop-only option: run the app in an Android emulator

Install [Android Studio](https://developer.android.com/studio). In Android Studio's first-run setup, choose the **Standard** install. Then open **More Actions → SDK Manager** and install **Android 16 (API 36)** under **SDK Platforms**. Under **SDK Tools**, install **Android SDK Build-Tools**, **Android SDK Platform-Tools**, and **Android Emulator**.

Copy the **Android SDK Location** shown in SDK Manager. In Windows, open **Start → Edit environment variables for your account**. Under **User variables**, add **ANDROID_HOME** with that SDK Location as its value. Edit the user **Path** variable and add these two entries:

~~~text
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
~~~

Open a new PowerShell window and confirm Android tools are available by running **adb --version**. If setup screens differ, follow [Expo's Windows Android setup](https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=emulator).

In Android Studio, choose **More Actions → Virtual Device Manager → Create Virtual Device**. Choose a Pixel device, select an API 36 system image, finish creating it, then press its **Play** button. Enable CPU virtualization in BIOS/UEFI if the emulator will not start. Google lists 16 GB RAM as the minimum for Android Studio with an emulator and recommends 32 GB. See [Android Studio requirements](https://developer.android.com/studio/install).

The app can then be built and run locally in step D. When it asks for the bridge URL, enter **http://10.0.2.2:4174**. That address routes the emulator to the laptop. The physical ESP32 can still post to the laptop's Wi-Fi address while the app runs in the emulator.

### B. Download this project and open it

Open **PowerShell** from the Windows Start menu, then paste these commands:

~~~powershell
git clone https://github.com/kyledelfin2006/poultri-app.git
Set-Location .\poultri-app
code .
~~~

If code is not recognized, open VS Code from the Start menu, choose **File → Open Folder**, and select the poultri-app folder you just cloned. If you already have this repository on your laptop, open its existing folder instead of cloning it again. In VS Code, choose **File → Trust** if asked whether you trust this project.

### C. Set up the physical ESP32 + DHT22 (one time, then each demo)

1. In Arduino IDE **File → Preferences**, add Espressif's stable Boards Manager URL: `https://espressif.github.io/arduino-esp32/package_esp32_index.json`.
2. In Boards Manager, install **esp32 by Espressif Systems** and select the board that matches your module. A common ESP32-WROOM-32 DevKit uses **ESP32 Dev Module**.
3. In Library Manager, install **DHT sensor library by Adafruit** and **Adafruit Unified Sensor**.
4. Wire the DHT22 module: **VCC → 3V3**, **GND → GND**, **DATA → GPIO 4**. Bare four-pin DHT22 sensors need a pull-up resistor from DATA to 3V3; breakout modules often include one.
5. Connect the relay module's logic input to **GPIO 26**. The sketch defaults to an active-high module, matching the earlier sketch. Use a relay rated for the fan supply/current; never connect a fan directly to an ESP32 GPIO.
6. For Wi-Fi delivery, start the bridge in section E, copy `arduino/PoultriESP32/secrets.h.example` to `secrets.h`, enter your 2.4 GHz Wi-Fi name/password, and set `BRIDGE_URL` to the laptop URL plus `/api/reading`. For USB delivery, leave Wi-Fi credentials unset and use the serial forwarder in section E. The local `secrets.h` is ignored by Git.
7. Select the ESP32 board and COM port, click **Verify**, then **Upload**. If upload says “Connecting…”, hold the board's **BOOT** button until writing starts. Serial Monitor runs at **115200 baud**; close it before starting the USB forwarder because COM7 can only be opened by one reader.

The phone and laptop must share the same private Wi-Fi. For the phone app, use the base laptop URL without `/api/reading`; the app adds the API paths.

### C (optional). Build and start the Wokwi sensor

1. In VS Code, choose **File → Open Folder** and open the wokwi folder inside the cloned repository. This folder contains the existing platformio.ini, wokwi.toml, and circuit diagram. If VS Code asks to trust the project, choose **Trust**.
2. Wait for PlatformIO’s first-time setup to finish. It downloads the ESP32 compiler and libraries; this can take several minutes.
3. In VS Code, click the **PlatformIO** alien-head icon in the left sidebar. Open **Project Tasks → esp32dev → General → Build**. Wait for a successful build. The firmware is saved under wokwi/.pio/build/esp32dev/.
4. Press **Ctrl+Shift+P**, run **Wokwi: Start Simulator**, and wait for the ESP32 to print temperature and humidity readings.
5. `wokwi.toml` has no external gateway override. Check the Wokwi terminal for `Bridge POST status: 201`. If you previously saw a `ws://localhost:9011` error, stop and start the simulation after updating this file. [Gateway details](https://docs.wokwi.com/vscode/project-config)

For a presentation without the editor in view, right-click the **Wokwi Simulator** tab and choose **Move into New Window**. In that window, turn on **Compact Mode**, then place it beside the Android emulator. To show the live readings separately too, right-click **Wokwi Terminal** in the VS Code terminal list, choose **Move Terminal into New Window**, and turn on **Compact Mode** there. Keep the original VS Code window open behind them; the Wokwi extension still runs the simulation. Moving the simulator tab may reload Wokwi, so check that readings resume and the bridge receives POSTs. This uses the same simulator and bridge, with no separate simulator app. [VS Code custom layout](https://code.visualstudio.com/docs/configure/custom-layout), [terminal window guide](https://code.visualstudio.com/docs/terminal/basics)

The next two sections use separate PowerShell windows. In each new PowerShell window, first change to the cloned repository folder, for example:

~~~powershell
Set-Location "$env:USERPROFILE\poultri-app"
~~~

If you cloned the project to a different location, replace that path with the location you chose.

### D. Build and run the Android app

Choose one of these app targets.

#### Laptop-only: Android emulator

Start the AVD you created in Android Studio. In a new PowerShell window, from the cloned repository folder, run:

~~~powershell
Set-Location .\mobile
npm.cmd install
npm.cmd run android
~~~

The first local Android build can take several minutes while Gradle downloads build tools. Keep this terminal open; it also runs the Expo development server. The Poultri app should open in the Android emulator. Enter **http://10.0.2.2:4174** for the bridge address.

#### Android phone: install the connected demo APK

The preview APK is built by Expo's EAS service and includes the Android setting needed to connect to the local bridge over private Wi-Fi. This route requires an Expo account and an internet connection.

In a new PowerShell window, from the cloned repository folder, run:

~~~powershell
Set-Location .\mobile
npm.cmd install
npx.cmd eas-cli@latest login
npm.cmd run build:apk
~~~

When the build finishes, EAS prints a build page/download link. Open that link, download the APK, and install it on the phone. If Android asks, allow the browser or file manager to install the APK. Keep the phone and laptop on the same private Wi-Fi. The Expo development server does not need to stay open while using the installed preview APK.

#### UI-only preview with Expo Go

To preview the screen without the connected local-bridge setup, install [Expo Go from Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent). From a new PowerShell window at the cloned repository folder, run:

~~~powershell
Set-Location .\mobile
npm.cmd install
npx.cmd expo start
~~~

Scan the QR code with Expo Go and keep this terminal running. For connected readings on an Android phone, use the preview APK above; for connected readings on the emulator, use the local Android build.
### E. Start the bridge and connect the app (each demo)

Optional: to show a full History chart before Wokwi has run for long, run `npm.cmd run seed` in `bridge/` after the bridge starts. It loads a fixed 24-hour **simulated** sequence that the app labels as replayed sample data. `npm.cmd run seed -- --clear` removes it; restarting the bridge also clears it.

1. Open a new PowerShell window at the repository folder, then start the bridge:

   ~~~powershell
   Set-Location .\bridge
   npm.cmd start
   ~~~

Leave this window open. The bridge prints possible laptop addresses, for example http://192.168.1.20:4174. Use the laptop's Wi-Fi URL in both the physical sketch and phone app.

2. If Windows Firewall asks, allow Node.js on **Private networks only**. The bridge listens on port 4174.
3. Confirm the bridge is running by opening http://localhost:4174/api/health in the laptop browser. It should show {"ok":true}.
4. For Wi-Fi mode, confirm the ESP32 Serial Monitor shows `Bridge POST status: 201`. For USB mode, close Serial Monitor and run the forwarder in another PowerShell window:

   ~~~powershell
   .\bridge\serial-forwarder.ps1 -Port COM7
   ~~~

   Leave the USB forwarder running; it reads COM7 and posts the physical sample to the laptop bridge. If using Wokwi, leave its simulator running instead.
5. Open the Poultri app and tap the settings button on Home (or scroll to **Connection** at the bottom of House 1). Enter the laptop's Wi-Fi URL printed by the bridge, such as `http://192.168.1.20:4174`. In an Android emulator, enter `http://10.0.2.2:4174` instead. Tap **Connect to bridge**. Do not enter `host.wokwi.internal` in the app; that special address is only for Wokwi.
6. Wait for the app to show a reading and its source label. The first fresh reading becomes the session reference.
7. The physical sensor reports actual room temperature and humidity; it cannot be set from the app. At **32.0°C**, the inspection prompt appears and the ESP32 switches the fan relay ON; below 32.0°C both clear/OFF. The app shows the relay command as ON/OFF. Use Wokwi for repeatable simulated transitions at the same threshold.
8. On the House 1 detail screen, tap **Acknowledge** if a prompt is active. When the reading falls below **32.0°C**, the app shows **Recovered**; after 60 seconds an acknowledged prompt clears to **No inspection needed**. An unacknowledged prompt remains until **Settings → Reset session → Reset**.

The physical sketch samples every 2.5 seconds, Wokwi samples every two seconds, and the app checks the bridge every second. Allow a few seconds for each reading to appear.

### What should be open during the connected demo

- ESP32 connected to the DHT22 and relay module. For Wi-Fi mode, keep it and the laptop on the same private Wi-Fi. For USB mode, keep the ESP32 connected and run `bridge/serial-forwarder.ps1`; close Arduino Serial Monitor first. If using Wokwi, keep its simulator running instead.
- One PowerShell window running npm.cmd start from bridge/.
- The Poultri app connected to the laptop bridge. For the laptop-only emulator setup, keep the PowerShell window running the Android build/Expo server open. For the phone APK setup, the Expo server is not needed after installing the APK.

The EAS build terminal can be closed after the APK is installed. Expo Go and the Expo development server are only needed for UI iteration.

## Repeat the demo

There is no single control that resets the sensor source, bridge, and app together. To start another run quickly:

1. Wait for the physical reading to update, or restart the Wokwi simulation / lower its DHT22 below the alert trigger.
2. Wait for a fresh reading in the app.
3. Open **Settings** from Home, tap **Reset session**, then tap **Reset** to confirm.
4. Let the physical sensor report its next reading; use Wokwi controls if you need an exact repeatable threshold value.

Keep the bridge running between runs. The next sensor POST replaces its latest reading; the app reset clears the app's session reference and prompt.

## Troubleshooting

- **PlatformIO Build is missing:** confirm VS Code opened the repository's `wokwi` folder, not the repository root. Wait for PlatformIO's first-time setup, then reopen **Project Tasks → esp32dev → General**.
- **Wokwi says firmware or `diagram.json` is missing:** build first and confirm the `wokwi` folder is open. If VS Code is open at the repository root, run **Wokwi: Select Config File** and choose `wokwi/wokwi.toml`.
- **Wokwi readings print, but the bridge gets no POSTs:** confirm `wokwi.toml` has no `[net] gateway` override, then stop and start the simulation. Check its terminal for `Bridge POST status: 201` and verify the bridge is running on port 4174.
- **Physical ESP32 prints readings but sends no POST:** check the Wi-Fi name/password, laptop LAN address in `BRIDGE_URL`, port 4174, and Windows Firewall permission for Node on Private networks. Confirm phone, laptop, and ESP32 are on the same private Wi-Fi.
- **Phone app cannot connect:** check that the bridge is running, enter the laptop's Wi-Fi IPv4 address with port `4174`, keep phone and laptop on the same Wi-Fi, and allow Node through Windows Firewall on Private networks. Use the installed preview APK for the connected demo.
- **Emulator app cannot connect:** enter `http://10.0.2.2:4174` as the bridge URL and check Windows Firewall.
- **Old reading remains visible:** the app labels readings older than five seconds as stale. Confirm the chosen ESP32 or Wokwi source is running and sending successful POSTs.

## Project guides

- [MVP requirements](mvp-requirements.md) — demo scope and presenter flow.
- [Build requirements](build-requirements.md) — architecture, bridge API, setup, and verification details.
- [Implementation notes](implementation.md) — current feature inventory and verification status.
- [Patent and technical scope](patent.md) — concept-derived MVP roadmap, proposed app/IoT architecture, draft data schema, and open patent-refinement questions. Planning only; not implemented or a patentability opinion.

### Which document is authoritative?

The supplied Poultri concept note defines product intent, but is not checked into this repository. For this prototype, [MVP requirements](mvp-requirements.md) are authoritative for scope and behavior, and [build requirements](build-requirements.md) are authoritative for architecture, interfaces, setup, and verification steps. [Patent and technical scope](patent.md) is a concept-derived planning brief, not a description of the current app or approved implementation scope. This README is the user-facing overview; [implementation notes](implementation.md) record the current implementation and clearly dated verification status. Update affected docs with code changes and remove obsolete docs or stale status claims.

**Prototype boundary:** the physical input is one DHT22 temperature/humidity sensor. The ESP32 drives a fan relay on GPIO 26 using a demo-only 32°C threshold; the app reports the relay command but does not verify fan rotation. Wokwi uses a simulated LED. There is no camera, gas sensor, production record, physical vent or servo, fan-speed control, SMS, diagnosis, account, cloud service, push notification, or farm validation.
