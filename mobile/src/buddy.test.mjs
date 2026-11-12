import assert from 'node:assert/strict';
import test from 'node:test';
import { answer } from './buddy.ts';
import { bucketize, summarize } from './history.ts';

const reading = { temperatureC: 26.1, humidityPct: 58.4, setpointC: 25, fanSpeedPct: 50 };
const ctx = { reading, stale: false, summary: null, hours: 24 };

test('refuses health questions', () => {
  assert.match(answer('Is my flock sick?', ctx), /can't give poultry-health advice/);
});

test('explains the reading with setpoint and fan', () => {
  const text = answer('Explain this reading', ctx);
  assert.match(text, /26\.1°C/);
  assert.match(text, /inspection prompt is active/);
  assert.match(text, /50%/);
});

test('reports empty history honestly', () => {
  assert.match(answer('Summarize the last 24 hours', ctx), /No history yet/);
});

test('summarizes history and buckets points', () => {
  const points = [{ t: 0, temperatureC: 24 }, { t: 50, temperatureC: 26 }, { t: 99, temperatureC: 28 }];
  const summary = summarize(points, 25);
  assert.equal(summary.min, 24);
  assert.equal(summary.max, 28);
  assert.equal(summary.avg, 26);
  assert.equal(summary.atOrAboveSetpoint, 2);
  assert.deepEqual(bucketize(points, 0, 100, 2), [24, 27]);
  assert.match(answer('summarize history', { ...ctx, summary }), /Low 24\.0°C, average 26\.0°C, high 28\.0°C/);
});
