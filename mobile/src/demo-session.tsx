import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

export type Reading = {
  temperatureC: number;
  humidityPct: number;
  setpointC: number;
  alertActive: boolean;
  fanSpeedPct: number;
  receivedAt: string;
};

export type AlertRecord = { acknowledged: boolean; recovered: boolean };

type ReadingResponse = { reading: Reading | null };
type DemoStatus = 'Not connected' | 'Checking bridge' | 'Waiting for Wokwi data' | 'Connected' | 'Stale reading' | 'Disconnected' | 'Disconnected · stale reading';

type DemoSessionValue = {
  bridgeUrl: string;
  setBridgeUrl: (value: string) => void;
  connected: boolean;
  connecting: boolean;
  message: string;
  reading: Reading | null;
  baseline: number | null;
  alertRecord: AlertRecord | null;
  sampleAgeMs: number;
  stale: boolean;
  status: DemoStatus;
  statusDescription: string;
  connect: () => Promise<void>;
  acknowledge: () => void;
  resetDemo: () => void;
};

const STALE_AFTER_MS = 5000;

async function getJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function isReading(value: unknown): value is Reading {
  if (!value || typeof value !== 'object') return false;
  const sample = value as Partial<Reading>;
  return Number.isFinite(sample.temperatureC)
    && Number.isFinite(sample.humidityPct)
    && Number.isFinite(sample.setpointC)
    && typeof sample.alertActive === 'boolean'
    && typeof sample.fanSpeedPct === 'number'
    && Number.isInteger(sample.fanSpeedPct)
    && sample.fanSpeedPct >= 0
    && sample.fanSpeedPct <= 100
    && typeof sample.receivedAt === 'string'
    && Number.isFinite(Date.parse(sample.receivedAt));
}

const DemoSessionContext = createContext<DemoSessionValue | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [bridgeUrl, setBridgeUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState('');
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState('Open House 1 to connect to the Wokwi bridge.');
  const [reading, setReading] = useState<Reading | null>(null);
  const [baseline, setBaseline] = useState<number | null>(null);
  const [alertRecord, setAlertRecord] = useState<AlertRecord | null>(null);
  const [now, setNow] = useState(Date.now);
  const baselineRef = useRef<number | null>(null);
  const alertRef = useRef<AlertRecord | null>(null);
  const previousStatusRef = useRef('Not connected');
  const previousAlertRef = useRef<AlertRecord | null>(null);

  const sampleAgeMs = reading ? Math.max(0, now - Date.parse(reading.receivedAt)) : 0;
  const stale = reading !== null && sampleAgeMs > STALE_AFTER_MS;
  const status: DemoStatus = connecting
    ? 'Checking bridge'
    : !connected && activeUrl
      ? (stale ? 'Disconnected · stale reading' : 'Disconnected')
      : stale
        ? 'Stale reading'
        : connected
          ? (reading ? 'Connected' : 'Waiting for Wokwi data')
          : 'Not connected';
  const statusDescription = connecting
    ? message
    : stale
      ? `Last Wokwi sample received ${Math.floor(sampleAgeMs / 1000)}s ago.`
      : connected
        ? (reading ? 'Receiving simulated data from the local bridge.' : 'Bridge is ready. Waiting for a Wokwi reading.')
        : message;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (previousStatusRef.current === status) return;
    previousStatusRef.current = status;
    if (Platform.OS === 'ios') {
      const detail = status.startsWith('Disconnected') ? ` ${statusDescription}` : '';
      AccessibilityInfo.announceForAccessibility(`${status}.${detail}`);
    }
  }, [status, statusDescription]);

  useEffect(() => {
    const previous = previousAlertRef.current;
    if (Platform.OS === 'ios' && alertRecord) {
      if (!previous) {
        AccessibilityInfo.announceForAccessibility('Temperature threshold reached. Please inspect House 1.');
      }
      if (previous && !previous.acknowledged && alertRecord.acknowledged) {
        AccessibilityInfo.announceForAccessibility('Inspection prompt acknowledged.');
      }
      if (previous && !previous.recovered && alertRecord.recovered) {
        AccessibilityInfo.announceForAccessibility('Reading recovered. Inspection prompt retained.');
      }
    }
    previousAlertRef.current = alertRecord;
  }, [alertRecord]);

  useEffect(() => {
    if (!connected || !activeUrl) return undefined;
    let active = true;
    let busy = false;

    const poll = async () => {
      if (busy) return;
      busy = true;
      try {
        const payload = await getJson<ReadingResponse>(`${activeUrl}/api/reading`);
        if (!active) return;
        if (payload.reading === null) {
          setReading(null);
          return;
        }
        if (!isReading(payload.reading)) throw new Error('Bridge returned an invalid reading.');

        const sample = payload.reading;
        setReading(sample);
        const fresh = Date.now() - Date.parse(sample.receivedAt) <= STALE_AFTER_MS;
        if (!fresh) return;

        if (baselineRef.current === null) {
          baselineRef.current = sample.temperatureC;
          setBaseline(sample.temperatureC);
        }

        const recovered = !sample.alertActive;
        if (alertRef.current === null && sample.alertActive) {
          const next = { acknowledged: false, recovered: false };
          alertRef.current = next;
          setAlertRecord(next);
        } else if (alertRef.current !== null && alertRef.current.recovered !== recovered) {
          const next = { ...alertRef.current, recovered };
          alertRef.current = next;
          setAlertRecord(next);
        }
      } catch (error) {
        if (active) {
          setConnected(false);
          setMessage(`Bridge disconnected: ${error instanceof Error ? error.message : 'request failed'}`);
        }
      } finally {
        busy = false;
      }
    };

    void poll();
    const timer = setInterval(() => void poll(), 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [activeUrl, connected]);

  async function connect() {
    const normalized = bridgeUrl.trim().replace(/\/+$/, '');
    if (!/^http:\/\//i.test(normalized)) {
      setMessage('Enter the laptop URL starting with http://');
      if (Platform.OS === 'ios') {
        AccessibilityInfo.announceForAccessibility('Enter the laptop URL starting with http.');
      }
      return;
    }

    setConnecting(true);
    setConnected(false);
    setMessage('Checking bridge…');
    try {
      const health = await getJson<{ ok: boolean }>(`${normalized}/api/health`);
      if (health.ok !== true) throw new Error('Bridge health check failed.');
      baselineRef.current = null;
      alertRef.current = null;
      setBaseline(null);
      setAlertRecord(null);
      setReading(null);
      setActiveUrl(normalized);
      setConnected(true);
      setMessage('Connected. Waiting for a fresh Wokwi reading.');
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'request failed';
      setMessage(`Could not connect: ${detail}`);
      if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(`Could not connect: ${detail}`);
    } finally {
      setConnecting(false);
    }
  }

  function acknowledge() {
    if (!alertRef.current) return;
    const next = { ...alertRef.current, acknowledged: true };
    alertRef.current = next;
    setAlertRecord(next);
  }

  function resetDemo() {
    baselineRef.current = null;
    alertRef.current = null;
    setBaseline(null);
    setAlertRecord(null);
    setMessage('Demo reset. The next fresh reading becomes the reference.');
  }

  return (
    <DemoSessionContext.Provider
      value={{
        bridgeUrl,
        setBridgeUrl,
        connected,
        connecting,
        message,
        reading,
        baseline,
        alertRecord,
        sampleAgeMs,
        stale,
        status,
        statusDescription,
        connect,
        acknowledge,
        resetDemo,
      }}
    >
      {children}
    </DemoSessionContext.Provider>
  );
}

export function useDemoSession() {
  const context = useContext(DemoSessionContext);
  if (!context) throw new Error('useDemoSession must be used within DemoProvider.');
  return context;
}
