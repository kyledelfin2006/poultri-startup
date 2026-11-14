import { useEffect, useState } from 'react';
import { HistoryPoint, parseHistory } from './history';

// Polls the bridge for recorded temperature history. Returns nothing until a bridge URL is connected.
export function useHistory(baseUrl: string, hours: number) {
  const [points, setPoints] = useState<HistoryPoint[]>([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!baseUrl) return undefined;
    let active = true;

    const load = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      try {
        const response = await fetch(`${baseUrl}/api/history?hours=${hours}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const parsed = parseHistory(await response.json());
        if (active) {
          setPoints(parsed);
          setError('');
          setLoaded(true);
        }
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'request failed');
      } finally {
        clearTimeout(timeout);
      }
    };

    void load();
    const timer = setInterval(() => void load(), 10_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [baseUrl, hours]);

  return { points: baseUrl ? points : [], error: baseUrl ? error : '', loaded: baseUrl ? loaded : false };
}
