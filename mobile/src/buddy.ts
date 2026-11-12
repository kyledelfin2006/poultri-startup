import type { HistorySummary } from './history';

export type BuddyContext = {
  reading: { temperatureC: number; humidityPct: number; setpointC: number; fanSpeedPct: number } | null;
  stale: boolean;
  summary: HistorySummary | null;
  hours: number;
};

export const SUGGESTIONS = ['Explain this reading', 'Summarize the last 24 hours', 'How does the demo work?'];

// Scripted answers from the app's own readings. No AI model, no network call.
export function answer(question: string, ctx: BuddyContext): string {
  const q = question.toLowerCase();

  if (/(sick|disease|diagnos|health|mortality|medic|vaccin|feed|dying|symptom)/.test(q)) {
    return "I can't give poultry-health advice. This demo only shows simulated temperature, humidity, and a fan indicator.";
  }

  if (/(how|demo|work|wokwi|bridge)/.test(q) && !/(reading|hours|history|trend)/.test(q)) {
    return 'A simulated ESP32 in Wokwi sends a temperature and humidity reading every 2 seconds to a bridge on the laptop. The app polls the bridge. At or above the demo setpoint the inspection prompt appears, and the simulated fan shows 0%, 50%, or 100%. Nothing here is a real sensor or fan.';
  }

  if (/(summar|history|trend|hours|average|min|max|last)/.test(q)) {
    const { summary, hours } = ctx;
    if (!summary) return `No history yet. The bridge records one point every 10 seconds once the simulation runs, and the last ${hours} hours will fill in from there.`;
    const setpoint = ctx.reading?.setpointC ?? 25;
    return `In the last ${hours} hours the bridge recorded ${summary.count} points. Low ${summary.min.toFixed(1)}°C, average ${summary.avg.toFixed(1)}°C, high ${summary.max.toFixed(1)}°C. ${summary.atOrAboveSetpoint} of ${summary.count} points were at or above the ${setpoint.toFixed(1)}°C demo setpoint. ${summary.replayed ? `${summary.replayed} of these points are replayed sample data, not from this Wokwi run. ` : ''}This is simulated data.`;
  }

  if (/(explain|reading|current|now|temperature|humidity|fan|alert|prompt)/.test(q)) {
    const { reading } = ctx;
    if (!reading) return 'No reading yet. Connect to the bridge in Settings and start the Wokwi simulation.';
    const above = reading.temperatureC >= reading.setpointC;
    return `House 1 reads ${reading.temperatureC.toFixed(1)}°C with ${reading.humidityPct.toFixed(1)}% humidity. The demo setpoint is ${reading.setpointC.toFixed(1)}°C, so ${above ? 'the inspection prompt is active' : 'no inspection prompt is active'} and the simulated fan is at ${reading.fanSpeedPct}%.${ctx.stale ? ' This reading is stale, so the values may be out of date.' : ''}`;
  }

  return "I can explain the current reading, summarize recent history, or describe how the demo works. I don't give poultry-health advice.";
}
