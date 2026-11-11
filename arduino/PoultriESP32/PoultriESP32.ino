#include <DHT.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include "secrets.h"

#define DHTPIN 4
#define DHTTYPE DHT22
#define RELAY_PIN 26

constexpr bool RELAY_ACTIVE_LOW = false;
constexpr int RELAY_ON_LEVEL = RELAY_ACTIVE_LOW ? LOW : HIGH;
constexpr int RELAY_OFF_LEVEL = RELAY_ACTIVE_LOW ? HIGH : LOW;

// This is the laptop's current LAN address; update it if the bridge prints a different one.
const char* BRIDGE_URL = "http://192.168.18.24:4174/api/reading";

constexpr float FAN_ON_THRESHOLD_C = 32.0f;
constexpr unsigned long SAMPLE_INTERVAL_MS = 2500;
constexpr unsigned long WIFI_RETRY_MS = 5000;

DHT dht(DHTPIN, DHTTYPE);
unsigned long lastSampleAt = 0;
unsigned long lastWifiAttemptAt = 0;

void setFan(bool on) {
  digitalWrite(RELAY_PIN, on ? RELAY_ON_LEVEL : RELAY_OFF_LEVEL);
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
  String body = "{\"source\":\"Local ESP32 + DHT22\",\"temperatureC\":" + String(temperatureC, 1) +
                ",\"humidityPct\":" + String(humidityPct, 1) +
                ",\"setpointC\":" + String(FAN_ON_THRESHOLD_C, 1) +
                ",\"alertActive\":" + String(alertActive ? "true" : "false") +
                ",\"fanSpeedPct\":" + String(fanSpeedPct) + "}";
  const int status = http.POST(body);
  Serial.printf("Bridge POST status: %d\n", status);
  http.end();
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  setFan(false);
  dht.begin();
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  lastWifiAttemptAt = millis();
  Serial.println("Poultri local ESP32 + DHT22 demo starting");
  Serial.println("Inspection prompt and fan relay: ON at 32.0 C or above; OFF below 32.0 C");
}

void loop() {
  const unsigned long now = millis();

  if (WiFi.status() != WL_CONNECTED && now - lastWifiAttemptAt >= WIFI_RETRY_MS) {
    lastWifiAttemptAt = now;
    Serial.println("Wi-Fi disconnected; retrying");
    WiFi.reconnect();
  }

  if (now - lastSampleAt < SAMPLE_INTERVAL_MS) {
    delay(20);
    return;
  }
  lastSampleAt = now;

  const float temperatureC = dht.readTemperature();
  const float humidityPct = dht.readHumidity();
  if (isnan(temperatureC) || isnan(humidityPct) || temperatureC < -40 || temperatureC > 80 || humidityPct < 0 || humidityPct > 100) {
    setFan(false);
    Serial.println("DHT22 read failed or returned an invalid value; fan relay OFF");
    return;
  }

  const bool alertActive = temperatureC >= FAN_ON_THRESHOLD_C;
  const bool fanOn = temperatureC >= FAN_ON_THRESHOLD_C;
  setFan(fanOn);
  const int fanSpeedPct = fanOn ? 100 : 0;
  Serial.printf("Temperature: %.1f C | Humidity: %.1f %% | Alert: %s | Fan relay: %s\n",
                temperatureC, humidityPct, alertActive ? "ACTIVE" : "CLEAR", fanOn ? "ON" : "OFF");

  if (WiFi.status() == WL_CONNECTED) {
    postReading(temperatureC, humidityPct, alertActive, fanSpeedPct);
  } else {
    Serial.println("Reading not sent; Wi-Fi is disconnected");
  }
}
