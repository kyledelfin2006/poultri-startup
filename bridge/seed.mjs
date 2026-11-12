// Replays a fixed 24-hour SIMULATED temperature sequence into the bridge so the History tab has data
// before Wokwi has run for long. The bridge stores these points as "replay", and the app labels them.
//
//   npm run seed                      replay into http://localhost:4174
//   npm run seed -- http://host:4174  replay into another bridge
//   npm run seed -- --clear           remove replayed points again
//
// The sequence is the same on every run: a day/night curve with fixed noise and an afternoon warm spell.

import { pathToFileURL } from 'node:url';

const STEP_MS = 5 * 60 * 1000; // one point every 5 minutes, 288 points over 24 hours

export function replaySequence(now = Date.now()) {
  let seed = 20261112;
  const noise = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648 - 0.5;
  };
  const points = [];
  for (let i = 287; i >= 0; i -= 1) {
    const t = now - i * STEP_MS;
    const hour = new Date(t).getHours() + new Date(t).getMinutes() / 60;
    const daily = 1.4 * Math.sin(((hour - 9) / 24) * 2 * Math.PI); // coolest near 03:00, warmest near 15:00
    const warmSpell = hour >= 13 && hour < 16 ? 0.9 : 0;
    points.push({ t, temperatureC: Math.round((24.1 + daily + warmSpell + noise() * 0.3) * 10) / 10 });
  }
  return points;
}

async function main() {
  const args = process.argv.slice(2);
  const clear = args.includes('--clear');
  const base = (args.find((arg) => arg.startsWith('http')) ?? 'http://localhost:4174').replace(/\/+$/, '');
  const url = `${base}/api/history/replay`;

  const response = clear
    ? await fetch(url, { method: 'DELETE' })
    : await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ points: replaySequence() }) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error(`Bridge refused the replay (${response.status}): ${body.error ?? 'unknown error'}`);
    process.exit(1);
  }
  console.log(clear
    ? `Removed ${body.removed} replayed points from ${base}.`
    : `Replayed ${body.added} SIMULATED sample points (last 24 hours) into ${base}. The app labels them as replayed sample data. Run "npm run seed -- --clear" to remove them.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`Could not reach the bridge: ${error.message}. Start it with "npm start" first.`);
    process.exit(1);
  });
}
