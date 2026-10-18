import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Reading = {
  temperatureC: number;
  humidityPct: number;
  setpointC: number;
  alertActive: boolean;
  fanSpeedPct: number;
  receivedAt: string;
};

type ReadingResponse = { reading: Reading | null };
type AlertRecord = { acknowledged: boolean; recovered: boolean };
type Palette = {
  background: string;
  surface: string;
  brandSurface: string;
  ink: string;
  body: string;
  muted: string;
  quiet: string;
  border: string;
  green: string;
  greenDark: string;
  onGreen: string;
  amber: string;
  amberDot: string;
  grayDot: string;
  inputBorder: string;
};

const STALE_AFTER_MS = 5000;
const lightPalette: Palette = {
  background: '#F7F9F6',
  surface: '#FFFFFF',
  brandSurface: '#F7F9F6',
  ink: '#173D28',
  body: '#34493A',
  muted: '#59675D',
  quiet: '#68766E',
  border: '#D6DED7',
  green: '#27643D',
  greenDark: '#254C32',
  onGreen: '#FFFFFF',
  amber: '#8A4D12',
  amberDot: '#A56B1F',
  grayDot: '#748078',
  inputBorder: '#BCC9BF',
};
const darkPalette: Palette = {
  background: '#111813',
  surface: '#1C261F',
  brandSurface: '#FFFFFF',
  ink: '#EAF2EC',
  body: '#D7E2D9',
  muted: '#B5C2B8',
  quiet: '#AAB7AD',
  border: '#39483D',
  green: '#82CA92',
  greenDark: '#A9DDB3',
  onGreen: '#132117',
  amber: '#F2BF73',
  amberDot: '#D9A755',
  grayDot: '#9DAAA1',
  inputBorder: '#526257',
};

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

function Button({
  title,
  onPress,
  disabled = false,
  busy = false,
  secondary = false,
  styles,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  secondary?: boolean;
  styles: ScreenStyles;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, busy }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondaryButton,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressedButton,
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{title}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const palette = colorScheme === 'dark' ? darkPalette : lightPalette;
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { width, fontScale } = useWindowDimensions();
  const expandedLayout = width >= 900;
  const enlargedText = fontScale >= 1.25;
  const stackReadings = enlargedText || width < 380;
  const [bridgeUrl, setBridgeUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState('');
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState('Enter the laptop bridge URL, then connect.');
  const [reading, setReading] = useState<Reading | null>(null);
  const [baseline, setBaseline] = useState<number | null>(null);
  const [alertRecord, setAlertRecord] = useState<AlertRecord | null>(null);
  const [now, setNow] = useState(0);
  const baselineRef = useRef<number | null>(null);
  const alertRef = useRef<AlertRecord | null>(null);
  const previousStatusRef = useRef('Not connected');
  const previousAlertRef = useRef<AlertRecord | null>(null);

  const sampleAgeMs = reading ? Math.max(0, now - Date.parse(reading.receivedAt)) : 0;
  const stale = reading !== null && sampleAgeMs > STALE_AFTER_MS;
  const status = connecting
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
      ? `Last sample received ${Math.floor(sampleAgeMs / 1000)}s ago.`
      : connected
        ? (reading ? 'Receiving simulated data from the local bridge.' : 'Bridge is ready. Waiting for a Wokwi reading.')
        : message;
  const statusDotStyle = stale
    ? styles.statusDotStale
    : connected
      ? styles.statusDotConnected
      : styles.statusDotIdle;

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
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.content, expandedLayout && styles.expandedContent]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.brand, colorScheme === 'dark' && styles.brandDark]}>
          <Image
            source={require('../../assets/poultri-logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Official Poultri logo"
          />
          <Image
            source={require('../../assets/poultri-wordmark.png')}
            style={styles.wordmark}
            resizeMode="contain"
            accessibilityLabel="Poultri wordmark"
          />
        </View>

        <View style={[styles.columns, !expandedLayout && styles.columnsCompact]}>
          <View style={[styles.primaryColumn, !expandedLayout && styles.primaryColumnCompact]}>
            <View style={[styles.houseHeading, enlargedText && styles.houseHeadingStacked]}>
              <Text accessibilityRole="header" style={styles.houseTitle}>House 1</Text>
              <Text style={styles.demoTag}>WOKWI DEMO</Text>
            </View>

            <View style={styles.statusSection}>
              <View style={styles.statusLine}>
                <View style={[styles.statusDot, statusDotStyle]} />
                <Text style={styles.status} accessibilityLiveRegion="polite">{status}</Text>
              </View>
              <Text style={styles.statusDescription} accessibilityLiveRegion={stale || connecting ? 'none' : 'polite'}>
                {statusDescription}
              </Text>
            </View>

            <View style={styles.readingSection}>
              <View style={[styles.temperatureRow, stackReadings && styles.temperatureRowStacked]}>
                <View style={styles.temperatureLabelGroup}>
                  <Text style={styles.metricLabel}>Temperature</Text>
                  <Text style={styles.setpoint}>Demo setpoint {reading?.setpointC.toFixed(1) ?? '25.0'}°C</Text>
                </View>
                <Text style={[styles.temperatureValue, stackReadings && styles.temperatureValueStacked]}>
                  {reading ? `${reading.temperatureC.toFixed(1)}°C` : '—'}
                </Text>
              </View>

              <View style={styles.readingDivider} />
              <View style={styles.secondaryReadings}>
                <View style={[styles.readingRow, stackReadings && styles.readingRowStacked]}>
                  <Text style={styles.readingLabel}>Humidity</Text>
                  <Text style={styles.readingValue}>{reading ? `${reading.humidityPct.toFixed(1)}%` : '—'}</Text>
                </View>
                <View style={styles.readingDivider} />
                <View style={[styles.readingRow, stackReadings && styles.readingRowStacked]}>
                  <Text style={styles.readingLabel}>Simulated fan</Text>
                  <Text style={styles.readingValue}>{reading ? `${reading.fanSpeedPct}%` : '—'}</Text>
                </View>
              </View>

              <View style={styles.sampleMeta}>
                <Text style={styles.sampleAge}>
                  {reading ? `Sample age: ${Math.floor(sampleAgeMs / 1000)}s` : 'No reading received yet'}
                  {stale ? ' · stale' : ''}
                </Text>
                <Text style={styles.demoLabel}>Wokwi simulated data · fan is an LED indicator</Text>
              </View>
            </View>

            <View style={styles.alertSection} accessibilityLiveRegion="polite">
              <Text accessibilityRole="header" style={styles.sectionTitle}>Inspection prompt</Text>
              {!alertRecord ? (
                <Text style={styles.supporting}>
                  {baseline === null
                    ? 'Waiting for the reference reading.'
                    : `Reference: ${baseline.toFixed(1)}°C · prompt at ${reading?.setpointC.toFixed(1) ?? '25.0'}°C.`}
                </Text>
              ) : (
                <>
                  <Text style={[styles.alertTitle, alertRecord.recovered && styles.recoveredTitle]}>
                    {alertRecord.recovered ? 'Reading recovered' : 'Temperature threshold reached'}
                  </Text>
                  <Text style={styles.supporting}>
                    {alertRecord.acknowledged ? 'Acknowledged' : 'Please inspect House 1'}
                    {alertRecord.recovered ? ' · prompt retained' : ''}
                  </Text>
                  {!alertRecord.acknowledged && (
                    <Button styles={styles} title="Acknowledge" onPress={acknowledge} />
                  )}
                </>
              )}
            </View>

            <Button styles={styles} title="Reset demo" onPress={resetDemo} secondary />
          </View>
          <View style={[styles.setupColumn, !expandedLayout && styles.setupColumnCompact]}>
            <View style={styles.connectionSection}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>Local bridge</Text>
              <Text style={styles.supporting}>Connect to the laptop bridge on the same Wi-Fi network.</Text>
              <TextInput
                accessibilityLabel="Laptop bridge URL"
                accessibilityHint="Enter the laptop's local bridge URL."
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                onChangeText={setBridgeUrl}
                placeholder="http://<laptop-LAN-IP>:4174"
                placeholderTextColor={palette.quiet}
                style={styles.input}
                value={bridgeUrl}
              />
              <Button
                styles={styles}
                title={connecting ? 'Connecting…' : 'Connect'}
                onPress={() => void connect()}
                disabled={connecting}
                busy={connecting}
              />
              {connecting && <ActivityIndicator color={palette.green} style={styles.spinner} />}
            </View>

            <Text style={styles.footer}>Prototype only · no physical sensor or farm validation</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: {
      flexGrow: 1,
      width: '100%',
      maxWidth: 680,
      alignSelf: 'center',
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 28,
    },
    expandedContent: { maxWidth: 1040 },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 4, backgroundColor: colors.brandSurface },
    brandDark: { marginHorizontal: -24, paddingHorizontal: 24, paddingVertical: 8, marginBottom: 8 },
    logo: { width: 40, height: 40 },
    wordmark: { width: 142, height: 48 },
    columns: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 32 },
    columnsCompact: { flexDirection: 'column', gap: 0 },
    primaryColumn: { flex: 1, minWidth: 0 },
    primaryColumnCompact: { width: '100%' },
    setupColumn: { width: 320 },
    setupColumnCompact: { width: '100%' },
    houseHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 20,
      marginBottom: 10,
      gap: 8,
    },
    houseHeadingStacked: { flexDirection: 'column', alignItems: 'flex-start' },
    houseTitle: { color: colors.ink, fontSize: 24, fontWeight: '700' },
    demoTag: { color: colors.green, fontSize: 11, fontWeight: '700', letterSpacing: 0.7 },
    statusSection: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 12, gap: 4 },
    statusLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusDotConnected: { backgroundColor: colors.green },
    statusDotStale: { backgroundColor: colors.amberDot },
    statusDotIdle: { backgroundColor: colors.grayDot },
    status: { color: colors.ink, fontSize: 14, fontWeight: '700', flexShrink: 1 },
    statusDescription: { color: colors.muted, fontSize: 13, lineHeight: 19, marginLeft: 16 },
    readingSection: { paddingTop: 22, paddingBottom: 4 },
    temperatureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingVertical: 8,
    },
    temperatureRowStacked: { flexDirection: 'column', alignItems: 'stretch' },
    temperatureLabelGroup: { flexShrink: 1, gap: 5 },
    metricLabel: { color: colors.body, fontSize: 14, fontWeight: '600' },
    setpoint: { color: colors.muted, fontSize: 13 },
    temperatureValue: { color: colors.ink, fontSize: 48, fontWeight: '700', textAlign: 'right' },
    temperatureValueStacked: { textAlign: 'left' },
    readingDivider: { height: 1, backgroundColor: colors.border },
    secondaryReadings: { marginTop: 8 },
    readingRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    readingRowStacked: { minHeight: 0, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', paddingVertical: 8, gap: 4 },
    readingLabel: { color: colors.muted, fontSize: 14, flexShrink: 1 },
    readingValue: { color: colors.body, fontSize: 20, fontWeight: '600', flexShrink: 1 },
    sampleMeta: { gap: 4, paddingTop: 12 },
    sampleAge: { color: colors.muted, fontSize: 12, lineHeight: 17 },
    demoLabel: { color: colors.greenDark, fontSize: 12, lineHeight: 17 },
    alertSection: { borderTopWidth: 1, borderColor: colors.border, marginTop: 16, paddingTop: 18, gap: 9 },
    sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '700' },
    supporting: { color: colors.muted, fontSize: 14, lineHeight: 20 },
    button: {
      minHeight: 48,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
      backgroundColor: colors.green,
    },
    secondaryButton: { backgroundColor: 'transparent', alignSelf: 'flex-start', paddingHorizontal: 8, marginTop: 2 },
    pressedButton: { opacity: 0.78 },
    disabledButton: { opacity: 0.55 },
    buttonText: { color: colors.onGreen, fontSize: 15, fontWeight: '700' },
    secondaryButtonText: { color: colors.greenDark, fontSize: 14 },
    alertTitle: { color: colors.amber, fontSize: 17, fontWeight: '700' },
    recoveredTitle: { color: colors.greenDark },
    connectionSection: { borderTopWidth: 1, borderColor: colors.border, marginTop: 8, paddingTop: 18, gap: 10 },
    input: {
      minHeight: 50,
      borderColor: colors.inputBorder,
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 13,
      backgroundColor: colors.surface,
      color: colors.body,
      fontSize: 15,
    },
    spinner: { marginTop: 2 },
    footer: { color: colors.quiet, fontSize: 12, textAlign: 'center', lineHeight: 18, paddingTop: 14 },
  });
}

type ScreenStyles = ReturnType<typeof createStyles>;
