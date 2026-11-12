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

test('replayed points are tagged, sorted with live points, and replace an earlier replay', () => {
  const hour = 3_600_000;
  const now = 24 * hour;
  const history = createHistory({ intervalMs: 10_000 });
  history.add(26, now - hour);
  assert.equal(history.addReplay([{ t: now - 3 * hour, temperatureC: 24 }, { t: now - 2 * hour, temperatureC: 25 }], now), 2);
  assert.deepEqual(history.query(24, now).map((p) => [p.temperatureC, p.source]), [[24, 'replay'], [25, 'replay'], [26, 'live']]);
  history.addReplay([{ t: now - 5 * hour, temperatureC: 23 }], now);
  assert.deepEqual(history.query(24, now).map((p) => p.source), ['replay', 'live'], 'a new replay replaces the old one');
});

test('replay rejects the whole batch when any point is invalid', () => {
  const now = 24 * 3_600_000;
  const history = createHistory();
  assert.throws(() => history.addReplay([{ t: now - 1000, temperatureC: 24 }, { t: now + 60_000, temperatureC: 24 }], now), /within the last 24 hours/);
  assert.throws(() => history.addReplay([{ t: now - 25 * 3_600_000, temperatureC: 24 }], now), /within the last 24 hours/);
  assert.throws(() => history.addReplay([{ t: now - 1000, temperatureC: 120 }], now), /-40 to 80/);
  assert.throws(() => history.addReplay([], now), /1 to/);
  assert.equal(history.query(24, now).length, 0, 'nothing stored after rejected batches');
});

test('clearReplay removes only replayed points', () => {
  const now = 24 * 3_600_000;
  const history = createHistory();
  history.add(26, now);
  history.addReplay([{ t: now - 3_600_000, temperatureC: 24 }], now);
  assert.equal(history.clearReplay(), 1);
  assert.deepEqual(history.query(24, now).map((p) => p.source), ['live']);
});
