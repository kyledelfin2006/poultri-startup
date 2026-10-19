# Poultri Wokwi + Mobile Demo

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

This repository demonstrates one small part of Poultri: **a simulated ESP32/DHT22 sends temperature and humidity readings, a demo alert state, and a fan-speed indicator from Wokwi through a laptop bridge to the mobile app.** A PWM LED in Wokwi represents the fan output; it does not control physical equipment.

> **Prototype status:** Poultri is still a concept and prototype. This demo uses simulated data; it has not been validated on a farm and does not provide poultry-health guidance.

## Team

- **Aldrin Kyle Delfin** — Team Lead & System Architect
- **Nadah Isidro** — UI/UX Design
- **Lance Kyle Ebue** — Product Analyst
- **Ralph Xavier Macabante** — Software Developer

## What works in this demo

- Wokwi simulates one ESP32 and one DHT22. Change temperature and humidity from the sensor controls.
- The ESP32 sends readings every two seconds to the local Node bridge.
- The mobile app opens to a House 1 overview with temperature, humidity, simulated fan percentage, connection state, and inspection-prompt state. Open House 1 for detailed readings, the demo setpoint, sample age, inspection prompt and acknowledgement, and local bridge setup.
- The first fresh reading after connecting or resetting is saved as session context. A reading at or above the **25°C demo setpoint** creates an inspection prompt. The Wokwi LED and app show a simulated fan level: **0% below 25°C, 50% from 25°C to below 27°C, and 100% at or above 27°C**.
- Acknowledge the prompt, lower the temperature below 25°C to show recovery, and tap **Reset Demo** to clear the app session.
- Humidity is display-only. All values and the alert rule are illustrative.

**Rule note:** the concept note does not define a numerical temperature threshold or fan-control rule. The **25°C setpoint and fan levels are demo-only choices**, not farm settings or poultry-health limits. The LED is only a visual output indicator; no physical fan is connected or controlled.

## Run the connected demo

This section is a from-scratch Windows setup. It runs the simulator, bridge, and development tools on the laptop. The app screen runs on an Android phone, or optionally on an Android emulator on the same laptop. No physical ESP32, DHT22, or fan is needed.

~~~text
Wokwi ESP32 simulator ──VS Code networking──> Node bridge on laptop :4174
Android app ─────────────────────────────> Node bridge on laptop :4174
~~~

With Wokwi for VS Code 4.0, this project reached the laptop bridge without a `[net] gateway` override. The Wokwi terminal showed `Bridge POST status: 201`, and the Android emulator displayed the same simulated reading on 2026-10-18. Browser-hosted Wokwi networking may differ. [Wokwi VS Code project configuration](https://docs.wokwi.com/vscode/project-config)

### A. Download and install the laptop tools (one time)

1. Install [Git for Windows](https://git-scm.com/download/win). Keep the installer’s default options.
2. Install [Visual Studio Code](https://code.visualstudio.com/Download). This is the code editor named **Visual Studio Code**, not the full Visual Studio IDE.
3. Install the current **LTS** release of [Node.js](https://nodejs.org/en/download). npm is included with Node.js.
4. Open VS Code. Press **Ctrl+Shift+X** to open Extensions, search for and install these two extensions:
   - **PlatformIO IDE** by PlatformIO. It includes PlatformIO Core and is the recommended firmware build setup; a separate Python or PlatformIO download is not needed for this path. [PlatformIO VS Code setup](https://docs.platformio.org/en/latest/integration/ide/vscode.html)
   - **Wokwi for VS Code** by Wokwi. Follow the extension prompt or press **Ctrl+Shift+P**, run **Wokwi: Request a new License**, and approve the browser-to-VS-Code activation. [Wokwi VS Code setup](https://docs.wokwi.com/vscode/getting-started)
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

The app can then be built and run locally in step D. When it asks for the bridge URL, enter **http://10.0.2.2:4174**. That address routes the emulator to the laptop. This route keeps the app, bridge, and Wokwi simulation on one laptop and does not require an Expo account or APK download.

### B. Download this project and open it

Open **PowerShell** from the Windows Start menu, then paste these commands:

~~~powershell
git clone https://github.com/kyledelfin2006/poultri-app.git
Set-Location .\poultri-app
code .
~~~

If code is not recognized, open VS Code from the Start menu, choose **File → Open Folder**, and select the poultri-app folder you just cloned. If you already have this repository on your laptop, open its existing folder instead of cloning it again. In VS Code, choose **File → Trust** if asked whether you trust this project.

### C. Build and start the Wokwi sensor (one time to build, each demo to start)

1. In VS Code, choose **File → Open Folder** and open the wokwi folder inside the cloned repository. This folder contains the existing platformio.ini, wokwi.toml, and circuit diagram. If VS Code asks to trust the project, choose **Trust**.
2. Wait for PlatformIO’s first-time setup to finish. It downloads the ESP32 compiler and libraries; this can take several minutes.
3. In VS Code, click the **PlatformIO** alien-head icon in the left sidebar. Open **Project Tasks → esp32dev → General → Build**. Wait for a successful build. The firmware is saved under wokwi/.pio/build/esp32dev/.
4. Press **Ctrl+Shift+P**, run **Wokwi: Start Simulator**, and wait for the ESP32 to print temperature and humidity readings.
5. `wokwi.toml` has no external gateway override. Check the Wokwi terminal for `Bridge POST status: 201`. If you previously saw a `ws://localhost:9011` error, stop and start the simulation after updating this file. [Gateway details](https://docs.wokwi.com/vscode/project-config)

You can leave the VS Code simulator window open. The next two sections use separate PowerShell windows. In each new PowerShell window, first change to the cloned repository folder, for example:

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

1. Open a new PowerShell window at the repository folder, then start the bridge:

   ~~~powershell
   Set-Location .\bridge
   npm.cmd start
   ~~~

   Leave this window open. The bridge prints the Wokwi address (http://host.wokwi.internal:4174) and possible phone addresses, for example http://192.168.1.20:4174.

2. If Windows Firewall asks, allow Node.js on **Private networks only**. The bridge listens on port 4174.
3. Confirm the bridge is running by opening http://localhost:4174/api/health in the laptop browser. It should show {"ok":true}.
4. Make sure the Wokwi simulation is running. Its terminal should show `Bridge POST status: 201`. Leave it running.
5. Open the Poultri app and tap the **House 1** overview card. On its detail screen, enter the laptop's Wi-Fi URL printed by the bridge, such as `http://192.168.1.20:4174`. In an Android emulator, enter `http://10.0.2.2:4174` instead. Tap **Connect to bridge**. Do not enter `host.wokwi.internal` in the app; that special address is only for Wokwi.
6. Wait for the app to show a reading. Keep the Wokwi DHT22 at **24.0°C** until the first reading is received; that becomes the session reference.
7. Click the DHT22 in Wokwi to open its controls. Raise the temperature to **25.0°C**. The app should show an inspection prompt and **50%** simulated fan. At **27.0°C**, the fan indicator should show **100%**.
8. On the House 1 detail screen, tap **Acknowledge prompt**, then lower the temperature below **25.0°C**. The app should show **Reading recovered**; the prompt remains until you tap **Reset demo**.

The ESP32 sends a reading every two seconds and the app checks the bridge every second. Allow a few seconds for each sensor change to appear.

### What should be open during the connected demo

- VS Code with the Wokwi simulation running and successful bridge POSTs in its terminal.
- One PowerShell window running npm.cmd start from bridge/.
- The Poultri app connected to the laptop bridge. For the laptop-only emulator setup, keep the PowerShell window running the Android build/Expo server open. For the phone APK setup, the Expo server is not needed after installing the APK.

The EAS build terminal can be closed after the APK is installed. Expo Go and the Expo development server are only needed for UI iteration.

## Repeat the demo

There is no single control that resets Wokwi, the bridge, and the app together. To start another run quickly:

1. Restart the Wokwi simulation, or set the DHT22 temperature below the alert trigger.
2. Wait for a fresh reading in the app.
3. Open House 1 and tap **Reset demo** on its detail screen.
4. Raise the DHT22 temperature again.

Keep the bridge running between runs. The next Wokwi POST replaces its latest reading; the app reset clears the app's session reference and prompt.

## Troubleshooting

- **PlatformIO Build is missing:** confirm VS Code opened the repository's `wokwi` folder, not the repository root. Wait for PlatformIO's first-time setup, then reopen **Project Tasks → esp32dev → General**.
- **Wokwi says firmware or `diagram.json` is missing:** build first and confirm the `wokwi` folder is open. If VS Code is open at the repository root, run **Wokwi: Select Config File** and choose `wokwi/wokwi.toml`.
- **Wokwi readings print, but the bridge gets no POSTs:** confirm `wokwi.toml` has no `[net] gateway` override, then stop and start the simulation. Check its terminal for `Bridge POST status: 201` and verify the bridge is running on port 4174.
- **Phone app cannot connect:** check that the bridge is running, enter the laptop's Wi-Fi IPv4 address with port `4174`, keep phone and laptop on the same Wi-Fi, and allow Node through Windows Firewall on Private networks. Use the installed preview APK for the connected demo.
- **Emulator app cannot connect:** enter `http://10.0.2.2:4174` as the bridge URL and check Windows Firewall.
- **Old reading remains visible:** the app labels readings older than five seconds as stale. Confirm Wokwi is running and sending successful POSTs.

## Project guides

- [MVP requirements](mvp-requirements.md) — demo scope and presenter flow.
- [Build requirements](build-requirements.md) — architecture, bridge API, setup, and verification details.
- [Implementation notes](implementation.md) — current feature inventory and verification status.
- [Patent and technical scope](patent.md) — concept-derived MVP roadmap, proposed app/IoT architecture, draft data schema, and open patent-refinement questions. Planning only; not implemented or a patentability opinion.

### Which document is authoritative?

The supplied Poultri concept note defines product intent, but is not checked into this repository. For this prototype, [MVP requirements](mvp-requirements.md) are authoritative for scope and behavior, and [build requirements](build-requirements.md) are authoritative for architecture, interfaces, setup, and verification steps. [Patent and technical scope](patent.md) is a concept-derived planning brief, not a description of the current app or approved implementation scope. This README is the user-facing overview; [implementation notes](implementation.md) record the current implementation and clearly dated verification status. Update affected docs with code changes and remove obsolete docs or stale status claims.

**Prototype boundary:** only the Wokwi temperature/humidity sensor is simulated. There is no camera, gas sensor, production record, physical fan or temperature control, SMS, diagnosis, account, cloud service, push notification, or farm validation. The simulated fan is an LED indicator only.
