// source 'replay' marks points from the labeled seed script (bridge/seed.mjs); 'live' points come from Wokwi.
export type HistoryPoint = { t: number; temperatureC: number; source: 'live' | 'replay' };
export type HistorySummary = { count: number; min: number; avg: number; max: number; latest: number; atOrAboveSetpoint: number; replayed: number };

export function parseHistory(value: unknown): HistoryPoint[] {
  const points = (value as { points?: unknown } | null)?.points;
  if (!Array.isArray(points)) throw new Error('Bridge returned invalid history.');
  return points
    .filter((point: Partial<HistoryPoint> | null): point is HistoryPoint =>
      typeof point?.t === 'number' && Number.isFinite(point.t) && typeof point?.temperatureC === 'number' && Number.isFinite(point.temperatureC))
    // Anything not explicitly live is treated as replayed, so unlabeled data is never shown as real.
    .map((point) => ({ t: point.t, temperatureC: point.temperatureC, source: point.source === 'live' ? 'live' : 'replay' }));
}

export function summarize(points: HistoryPoint[], setpointC: number): HistorySummary | null {
  if (points.length === 0) return null;
  const temps = points.map((point) => point.temperatureC);
  return {
    count: temps.length,
    min: Math.min(...temps),
    avg: temps.reduce((sum, value) => sum + value, 0) / temps.length,
    max: Math.max(...temps),
    latest: temps[temps.length - 1],
    atOrAboveSetpoint: temps.filter((value) => value >= setpointC).length,
    replayed: points.filter((point) => point.source === 'replay').length,
  };
}

// Averages points into equal time buckets across [from, to]; empty buckets stay null.
export function bucketize(points: HistoryPoint[], from: number, to: number, buckets: number): (number | null)[] {
  const sums = new Array<number>(buckets).fill(0);
  const counts = new Array<number>(buckets).fill(0);
  const span = to - from;
  for (const point of points) {
    if (point.t < from || point.t > to) continue;
    const index = Math.min(buckets - 1, Math.floor(((point.t - from) / span) * buckets));
    sums[index] += point.temperatureC;
    counts[index] += 1;
  }
  return sums.map((sum, index) => (counts[index] ? sum / counts[index] : null));
}
