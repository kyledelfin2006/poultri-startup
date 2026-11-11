param(
  [string]$Port = 'COM7',
  [string]$BridgeUrl = 'http://127.0.0.1:4174/api/reading'
)

$ErrorActionPreference = 'Stop'
$serial = [System.IO.Ports.SerialPort]::new($Port, 115200, [System.IO.Ports.Parity]::None, 8, [System.IO.Ports.StopBits]::One)
$serial.DtrEnable = $false
$serial.RtsEnable = $false
$serial.ReadTimeout = 1200
$serial.NewLine = "`n"
$serial.Open()
Write-Host "Forwarding $Port sensor readings to $BridgeUrl. Press Ctrl+C to stop."

try {
  while ($true) {
    try { $line = $serial.ReadLine().Trim() } catch [System.TimeoutException] { continue }
    if ($line -match 'Temperature:\s*(-?[0-9]+(?:\.[0-9]+)?)\s*C\s*\|\s*Humidity:\s*(-?[0-9]+(?:\.[0-9]+)?)\s*%\s*\|\s*Alert:\s*(ACTIVE|CLEAR)\s*\|\s*Fan relay:\s*(ON|OFF)') {
      $temperature = [double]::Parse($Matches[1], [Globalization.CultureInfo]::InvariantCulture)
      $humidity = [double]::Parse($Matches[2], [Globalization.CultureInfo]::InvariantCulture)
      $alertActive = $Matches[3] -eq 'ACTIVE'
      $fanSpeedPct = if ($Matches[4] -eq 'ON') { 100 } else { 0 }
      $body = @{
        source = 'Local ESP32 + DHT22'
        temperatureC = $temperature
        humidityPct = $humidity
        setpointC = 32.0
        alertActive = $alertActive
        fanSpeedPct = $fanSpeedPct
      } | ConvertTo-Json -Compress
      Invoke-RestMethod -Uri $BridgeUrl -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 3 | Out-Null
      Write-Host ('Forwarded {0:N1} C / {1:N1}% RH / fan relay {2}' -f $temperature, $humidity, $(if ($fanSpeedPct) { 'ON' } else { 'OFF' }))
    } elseif ($line -like '*DHT22 read failed*') {
      Write-Warning $line
    }
  }
} finally {
  if ($serial.IsOpen) { $serial.Close() }
}
