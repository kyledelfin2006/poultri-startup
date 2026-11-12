import assert from 'node:assert/strict';
import test from 'node:test';
import { MAX_REPLAY_POINTS, createHistory } from './history.mjs';
import { replaySequence } from './seed.mjs';

test('seed sequence is a fixed, valid 24-hour replay the bridge accepts', () => {
  const now = Date.UTC(2026, 10, 12, 12, 0, 0);
  const points = replaySequence(now);
  assert.equal(points.length, 288);
  assert.ok(points.length <= MAX_REPLAY_POINTS);
  assert.deepEqual(replaySequence(now), points, 'same sequence on every run');
  assert.ok(points.every((p, i) => i === 0 || p.t > points[i - 1].t), 'time increases');
  assert.ok(now - points[0].t <= 24 * 3_600_000 && points.at(-1).t === now, 'covers the last 24 hours');
  const temps = points.map((p) => p.temperatureC);
  assert.ok(Math.min(...temps) > 21 && Math.max(...temps) < 28, 'plausible demo range');
  assert.ok(temps.some((t) => t >= 25) && temps.some((t) => t < 25), 'crosses the 25°C demo setpoint');
  assert.equal(createHistory().addReplay(points, now), 288);
});
