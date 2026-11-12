import type { HistorySummary } from './history';

export type InspectionState = 'clear' | 'inspect' | 'acknowledged' | 'recovered';

export type BuddyContext = {
  reading: { temperatureC: number; humidityPct: number; setpointC: number; fanSpeedPct: number } | null;
  inspection: InspectionState; // the prompt state the app holds; never inferred from temperature
  stale: boolean;
  summary: HistorySummary | null;
  hours: number;
};

export const SUGGESTIONS = ['Explain this reading', 'Summarize the last 24 hours', 'How does the demo work?'];

const PROMPT_TEXT: Record<InspectionState, string> = {
  clear: 'No inspection prompt is open.',
  inspect: 'The app shows Inspect House 1.',
  acknowledged: 'The inspection prompt is Acknowledged.',
  recovered: 'The inspection prompt shows Recovered and stays until Reset session.',
};

// Scripted answers from the app's own readings. No AI model, no network call.
// Rule: state only values the app holds. Never suggest a cause, a diagnosis, or an action for the flock.
export function answer(question: string, ctx: BuddyContext): string {
  const q = question.toLowerCase();

  if (/(sick|disease|diagnos|health|mortality|medic|vaccin|feed|dying|symptom)/.test(q)) {
    return "I can't give poultry-health advice. This demo only shows simulated temperature, humidity, and a fan indicator.";
  }

  if (/(why|cause|reason|what (should|do|can) i|should (i|we)|how (do|can|should) (i|we) (fix|cool|lower|reduce|treat|help)|recommend|advice|fix|cool (it|them|the)|ventilat|open the|turn (on|off))/.test(q)) {
    return "I can't say why readings change or what to do for the flock. I only report the simulated values the app holds. Ask me to explain the current reading.";
  }

  if (/(how|demo|work|wokwi|bridge)/.test(q) && !/(reading|hours|history|trend)/.test(q)) {
    return 'A simulated ESP32 in Wokwi sends a temperature and humidity reading every 2 seconds to a bridge on the laptop. The app polls the bridge. At or above the demo setpoint the inspection prompt appears, and the simulated fan shows 0%, 50%, or 100%. Nothing here is a real sensor or fan.';
  }

  if (/(summar|history|trend|hours|average|min|max|last)/.test(q)) {
    const { summary, hours } = ctx;
    if (!summary) return `No history yet for the last ${hours} hours. Start the Wokwi simulation; the bridge records a point every 10 seconds.`;
    const setpoint = ctx.reading?.setpointC ?? 25;
    return `In the last ${hours} hours the bridge holds ${summary.count} point${summary.count === 1 ? '' : 's'}. Low ${summary.min.toFixed(1)}°C, average ${summary.avg.toFixed(1)}°C, high ${summary.max.toFixed(1)}°C. ${summary.atOrAboveSetpoint} of ${summary.count} points were at or above the ${setpoint.toFixed(1)}°C demo setpoint. ${summary.replayed ? `${summary.replayed} of these points are replayed sample data, not from this Wokwi run. ` : ''}This is simulated data.`;
  }

  if (/(explain|reading|current|now|temperature|humidity|fan|alert|prompt)/.test(q)) {
    const { reading } = ctx;
    if (!reading) return 'No reading yet. Connect to the bridge in Settings and start the Wokwi simulation.';
    return `House 1 reads ${reading.temperatureC.toFixed(1)}°C with ${reading.humidityPct.toFixed(1)}% humidity. The demo setpoint is ${reading.setpointC.toFixed(1)}°C and the simulated fan is at ${reading.fanSpeedPct}%. ${PROMPT_TEXT[ctx.inspection]}${ctx.stale ? ' This reading is stale, so the values may be out of date.' : ''}`;
  }

  return "I can explain the current reading, summarize recent history, or describe how the demo works. I don't give poultry-health advice.";
}
