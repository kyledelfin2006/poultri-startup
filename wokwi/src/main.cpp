#include <DHTesp.h>
#include <HTTPClient.h>
#include <WiFi.h>

namespace {
constexpr int DHT_PIN = 15;
constexpr int FAN_LED_PIN = 18;
constexpr float DEMO_THRESHOLD_C = 32.0f;
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
  return temperatureC >= DEMO_THRESHOLD_C ? 100 : 0;
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
                ",\"setpointC\":" + String(DEMO_THRESHOLD_C, 1) +
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
  Serial.println("Demo rule: inspection prompt and simulated fan turn ON at 32.0 C or above");
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

  const bool alertActive = sample.temperature >= DEMO_THRESHOLD_C;
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
