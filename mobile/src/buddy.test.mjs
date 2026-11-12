import assert from 'node:assert/strict';
import test from 'node:test';
import { answer } from './buddy.ts';
import { bucketize, summarize } from './history.ts';

const reading = { temperatureC: 26.1, humidityPct: 58.4, setpointC: 25, fanSpeedPct: 50 };
const ctx = { reading, inspection: 'inspect', stale: false, summary: null, hours: 24 };

test('refuses health questions', () => {
  assert.match(answer('Is my flock sick?', ctx), /can't give poultry-health advice/);
});

test('explains the reading with setpoint and fan', () => {
  const text = answer('Explain this reading', ctx);
  assert.match(text, /26\.1°C/);
  assert.match(text, /Inspect House 1/);
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

test('history parsing keeps sources and treats unlabeled points as replayed', async () => {
  const { parseHistory } = await import('./history.ts');
  const parsed = parseHistory({ points: [{ t: 1, temperatureC: 24, source: 'live' }, { t: 2, temperatureC: 25, source: 'replay' }, { t: 3, temperatureC: 26 }] });
  assert.deepEqual(parsed.map((p) => p.source), ['live', 'replay', 'replay']);
  assert.equal(summarize(parsed, 25).replayed, 2);
});

test('summary says when points are replayed sample data', () => {
  const points = [{ t: 1, temperatureC: 24, source: 'replay' }, { t: 2, temperatureC: 26, source: 'live' }];
  const text = answer('Summarize the last 24 hours', { ...ctx, summary: summarize(points, 25) });
  assert.match(text, /1 of these points are replayed sample data/);
  assert.match(text, /simulated data/);
  const live = answer('Summarize the last 24 hours', { ...ctx, summary: summarize([points[1]], 25) });
  assert.doesNotMatch(live, /replayed/);
});

test('chart paths break at empty buckets and never bridge missing data', async () => {
  const { chartPaths } = await import('./history.ts');
  const { line, area, last, y } = chartPaths([24, 25, null, 26], 400, 100, 23, 27);
  assert.equal((line.match(/M/g) ?? []).length, 2, 'two separate runs around the gap');
  assert.equal((area.match(/M/g) ?? []).length, 1, 'only the two-point run gets an area');
  assert.deepEqual(last, { x: 350, y: 25 });
  assert.equal(y(27), 0);
  assert.equal(y(23), 100);
  const empty = chartPaths([null, null], 400, 100, 23, 27);
  assert.equal(empty.line, '');
  assert.equal(empty.last, null);
});

test('reading reply states the prompt state the app holds, not one inferred from temperature', () => {
  const expected = { clear: /No inspection prompt is open/, inspect: /Inspect House 1/, acknowledged: /Acknowledged/, recovered: /Recovered and stays until Reset session/ };
  for (const [inspection, pattern] of Object.entries(expected)) {
    assert.match(answer('Explain this reading', { ...ctx, inspection }), pattern, inspection);
  }
  // Below the setpoint but still holding a recovered prompt: must not claim there is no prompt.
  const cool = { ...ctx, reading: { ...reading, temperatureC: 24.1 }, inspection: 'recovered' };
  assert.doesNotMatch(answer('Explain this reading', cool), /No inspection prompt/);
});

test('reading reply marks stale values', () => {
  assert.match(answer('Explain this reading', { ...ctx, stale: true }), /stale/);
});

test('refuses cause and action questions without suggesting either', () => {
  for (const question of ['Why is it so hot?', 'What should I do about the temperature?', 'Should I open the vents?', 'How do I cool the birds?', 'What is the cause?', 'Any advice for the flock?']) {
    const text = answer(question, ctx);
    assert.match(text, /can't say why readings change or what to do for the flock/, question);
  }
  assert.match(answer('How does the demo work?', ctx), /simulated ESP32/, 'demo question still answered');
  assert.match(answer('Explain this reading', ctx), /House 1 reads/, 'reading question still answered');
});

test('no reply suggests a cause, diagnosis, or flock action', () => {
  const contexts = [ctx, { ...ctx, reading: null }, { ...ctx, inspection: 'recovered', stale: true },
    { ...ctx, summary: summarize([{ t: 1, temperatureC: 24, source: 'live' }, { t: 2, temperatureC: 26, source: 'replay' }], 25) }];
  const questions = ['Explain this reading', 'Summarize the last 24 hours', 'How does the demo work?', 'Why is it hot?', 'Is my flock sick?', 'hello'];
  const banned = /(because|caused by|due to|you should|try |open the|turn on|lower the|add water|ventilate|disease|infection)/i;
  for (const c of contexts) for (const q of questions) assert.doesNotMatch(answer(q, c), banned, q);
});

test('history summary says the bridge holds the points', () => {
  const summary = summarize([{ t: 1, temperatureC: 24, source: 'live' }], 25);
  assert.match(answer('Summarize the last 24 hours', { ...ctx, summary }), /bridge holds 1 point./);
});
