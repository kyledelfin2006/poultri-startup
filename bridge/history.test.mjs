import assert from 'node:assert/strict';
import test from 'node:test';
import { createHistory } from './history.mjs';

test('keeps one point per interval and drops points older than the max age', () => {
  const history = createHistory({ intervalMs: 10_000, maxAgeMs: 60_000 });
  history.add(24, 0);
  history.add(25, 5_000);
  history.add(26, 10_000);
  assert.deepEqual(history.query(1, 10_000).map((p) => p.temperatureC), [24, 26]);
  history.add(27, 70_000);
  assert.deepEqual(history.query(1, 70_000).map((p) => p.temperatureC), [26, 27]);
});

test('query returns only points inside the requested hours', () => {
  const history = createHistory({ intervalMs: 1, maxAgeMs: 24 * 3_600_000 });
  history.add(20, 0);
  history.add(22, 5 * 3_600_000);
  const now = 7 * 3_600_000;
  assert.deepEqual(history.query(6, now).map((p) => p.temperatureC), [22]);
  assert.deepEqual(history.query(12, now).map((p) => p.temperatureC), [20, 22]);
});
