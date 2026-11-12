import type { Palette } from './palette';

export type HouseState = 'idle' | 'stale' | 'calm' | 'warm' | 'hot';
export type MarkKind = 'check' | 'alert' | 'alert2' | 'dash';

// States come from the firmware's own fan levels (0, 50, 100), so no new thresholds exist in the app.
export function houseState(reading: { fanSpeedPct: number; temperatureC: number; setpointC: number } | null, stale: boolean, status: string): HouseState {
  if (!reading) return 'idle';
  if (stale || status.startsWith('Disconnected')) return 'stale';
  if (reading.fanSpeedPct >= 100) return 'hot';
  if (reading.fanSpeedPct > 0 || reading.temperatureC >= reading.setpointC) return 'warm';
  return 'calm';
}

export function stateStyle(state: HouseState, palette: Palette): { bg: string; text: string; fill: string; label: string; mark: MarkKind } {
  switch (state) {
    case 'calm': return { bg: palette.calmBg, text: palette.calmText, fill: palette.calmFill, label: 'Below setpoint', mark: 'check' };
    case 'warm': return { bg: palette.warmBg, text: palette.warmText, fill: palette.warmFill, label: 'Above setpoint', mark: 'alert' };
    case 'hot': return { bg: palette.hotBg, text: palette.hotText, fill: palette.hotFill, label: 'Full fan', mark: 'alert2' };
    case 'stale': return { bg: palette.warningSurface, text: palette.warningInk, fill: palette.warningInk, label: 'Stale', mark: 'alert' };
    default: return { bg: palette.greenSurface, text: palette.muted, fill: palette.muted, label: 'Waiting', mark: 'dash' };
  }
}
