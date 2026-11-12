import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';
import { createHistory } from './history.mjs';

const PORT = Number(process.env.PORT ?? 4174);
const MAX_BODY_BYTES = 1024;
let latestReading = null;
const history = createHistory();

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

  if (request.method === 'GET' && url.pathname === '/api/history') {
    const hours = Number(url.searchParams.get('hours') ?? 24);
    if (!Number.isFinite(hours) || hours < 1 || hours > 24) {
      json(response, 400, { error: 'hours must be between 1 and 24' });
      return;
    }
    json(response, 200, { points: history.query(hours) });
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

    history.add(value.temperatureC);
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
