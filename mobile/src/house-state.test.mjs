import assert from 'node:assert/strict';
import test from 'node:test';
import { houseState, stateStyle } from './house-state.ts';
import { darkPalette, lightPalette } from './palette.ts';

const sample = (fanSpeedPct, temperatureC) => ({ fanSpeedPct, temperatureC, setpointC: 25 });

test('maps the firmware fan levels to states', () => {
  assert.equal(houseState(null, false, 'Not connected'), 'idle');
  assert.equal(houseState(sample(0, 24.9), false, 'Connected'), 'calm');
  assert.equal(houseState(sample(50, 25), false, 'Connected'), 'warm');
  assert.equal(houseState(sample(100, 27), false, 'Connected'), 'hot');
});

test('stale or disconnected data wins over the reading', () => {
  assert.equal(houseState(sample(100, 30), true, 'Stale reading'), 'stale');
  assert.equal(houseState(sample(50, 26), false, 'Disconnected'), 'stale');
});

test('every state has a label and a mark in both modes', () => {
  for (const palette of [lightPalette, darkPalette]) {
    for (const state of ['idle', 'stale', 'calm', 'warm', 'hot']) {
      const style = stateStyle(state, palette);
      assert.ok(style.label && style.mark && style.bg && style.text && style.fill);
    }
  }
});
