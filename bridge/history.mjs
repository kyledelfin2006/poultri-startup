const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_REPLAY_POINTS = 24 * 60; // one per minute for 24 hours

// Keeps one temperature point per intervalMs for up to 24 hours, in memory only.
// Every point carries its source: 'live' from Wokwi, or 'replay' from the labeled seed script.
// shortcut: history is lost when the bridge restarts, upgrade to a file if the demo needs it.
export function createHistory({ intervalMs = 10_000, maxAgeMs = DAY_MS } = {}) {
  let points = [];
  const prune = (now) => { points = points.filter((point) => now - point.t <= maxAgeMs); };
  return {
    add(temperatureC, now = Date.now()) {
      const lastLive = points.findLast((point) => point.source === 'live');
      if (lastLive && now - lastLive.t < intervalMs) return;
      points.push({ t: now, temperatureC, source: 'live' });
      points.sort((a, b) => a.t - b.t);
      prune(now);
    },
    // Adds a replayed simulated sequence. Rejects the whole batch if any point is invalid.
    addReplay(replay, now = Date.now()) {
      if (!Array.isArray(replay) || replay.length === 0 || replay.length > MAX_REPLAY_POINTS) {
        throw Object.assign(new Error(`points must be a list of 1 to ${MAX_REPLAY_POINTS} readings`), { status: 400 });
      }
      const valid = replay.every((point) => Number.isFinite(point?.t) && now - point.t <= maxAgeMs && point.t <= now
        && Number.isFinite(point?.temperatureC) && point.temperatureC >= -40 && point.temperatureC <= 80);
      if (!valid) throw Object.assign(new Error('Each point needs t within the last 24 hours and temperatureC from -40 to 80'), { status: 400 });
      points = points.filter((point) => point.source !== 'replay');
      points.push(...replay.map((point) => ({ t: point.t, temperatureC: point.temperatureC, source: 'replay' })));
      points.sort((a, b) => a.t - b.t);
      prune(now);
      return replay.length;
    },
    clearReplay() {
      const before = points.length;
      points = points.filter((point) => point.source !== 'replay');
      return before - points.length;
    },
    query(hours, now = Date.now()) {
      const from = now - hours * 3_600_000;
      return points.filter((point) => point.t >= from);
    },
  };
}
