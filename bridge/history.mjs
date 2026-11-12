const DAY_MS = 24 * 60 * 60 * 1000;

// Keeps one temperature point per intervalMs for up to 24 hours, in memory only.
// shortcut: history is lost when the bridge restarts, upgrade to a file if the demo needs it.
export function createHistory({ intervalMs = 10_000, maxAgeMs = DAY_MS } = {}) {
  const points = [];
  return {
    add(temperatureC, now = Date.now()) {
      const last = points.at(-1);
      if (last && now - last.t < intervalMs) return;
      points.push({ t: now, temperatureC });
      while (points.length && now - points[0].t > maxAgeMs) points.shift();
    },
    query(hours, now = Date.now()) {
      const from = now - hours * 3_600_000;
      return points.filter((point) => point.t >= from);
    },
  };
}
