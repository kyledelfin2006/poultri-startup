import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDemoSession } from '../demo-session';
import { ActionButton, BrandHeader, MetricIcon, Palette, usePalette } from '../ui';

export default function HouseDetailScreen() {
  const router = useRouter();
  const palette = usePalette();
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 370 || fontScale >= 1.3;
  const styles = useMemo(() => createStyles(palette), [palette]);
  const {
    bridgeUrl, setBridgeUrl, connected, connecting, message, reading, baseline,
    alertRecord, sampleAgeMs, stale, status, statusDescription, connect,
    acknowledge, resetDemo,
  } = useDemoSession();
  const fanSpeedPct = reading?.fanSpeedPct;
  const statusWarning = stale || status.startsWith('Disconnected');
  const [reduceMotion, setReduceMotion] = useState(true);
  const [fanRotation] = useState(() => new Animated.Value(0));
  const fanAngle = useMemo(() => fanRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  }), [fanRotation]);
  const [ventPosition] = useState(() => new Animated.Value(fanSpeedPct ?? 0));
  const ventAngle = useMemo(() => ventPosition.interpolate({
    inputRange: [0, 50, 100],
    outputRange: ['0deg', '40deg', '75deg'],
  }), [ventPosition]);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!fanSpeedPct || stale || !connected || reduceMotion) return;
    const animation = Animated.loop(Animated.timing(fanRotation, {
      toValue: 1,
      duration: fanSpeedPct === 100 ? 700 : 1400,
      easing: Easing.linear,
      isInteraction: false,
      useNativeDriver: true,
    }));
    fanRotation.setValue(0);
    animation.start();
    return () => animation.stop();
  }, [connected, fanRotation, fanSpeedPct, reduceMotion, stale]);

  useEffect(() => {
    if (fanSpeedPct === undefined || stale || !connected) return;
    const animation = Animated.timing(ventPosition, {
      toValue: fanSpeedPct,
      duration: 450,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [connected, fanSpeedPct, stale, ventPosition]);

  const fanState = !reading ? '—' : fanSpeedPct === 0 ? 'Off' : fanSpeedPct === 50 ? 'Half speed' : fanSpeedPct === 100 ? 'Full speed' : 'Running';
  const ventState = !reading ? '—' : fanSpeedPct === 0 ? 'Closed' : fanSpeedPct === 50 ? 'Half-open' : fanSpeedPct === 100 ? 'Fully open' : 'Partially open';
  const visualDataState = !reading ? '' : status.startsWith('Disconnected') ? 'Last known · disconnected' : stale ? 'Last known · stale' : '';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <BrandHeader palette={palette} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to house overview"
          onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
          style={styles.backButton}
        >
          <View style={styles.backCircle}><Text style={styles.backArrow}>‹</Text></View>
          <Text style={styles.backText}>House overview</Text>
        </Pressable>

        <View style={styles.heading}>
          <View style={styles.headingRow}>
            <Text accessibilityRole="header" style={styles.title}>House 1</Text>
            <View style={styles.connectionState}>
              <View style={[styles.connectionDot, statusWarning && styles.connectionDotWarning]} />
              <Text style={[styles.connectionText, statusWarning && styles.connectionTextWarning]}>{status}</Text>
            </View>
          </View>
          <Text style={styles.sourceText}>Wokwi simulated data</Text>
        </View>

        <View style={styles.readings}>
          <View style={styles.readingLabelRow}>
            <MetricIcon kind="temperature" color={palette.ink} />
            <Text style={styles.readingLabel}>Temperature</Text>
          </View>
          <Text style={[styles.temperature, compact && styles.temperatureCompact]} accessibilityLabel={reading ? `Temperature ${reading.temperatureC.toFixed(1)} degrees Celsius` : 'Temperature unavailable'}>
            {reading ? reading.temperatureC.toFixed(1) : '—'}<Text style={styles.temperatureUnit}>{reading ? '°C' : ''}</Text>
          </Text>
          <View style={styles.setpointRow}>
            <Text style={styles.setpointLabel}>Simulation setpoint</Text>
            <Text style={styles.setpointValue}>{reading?.setpointC.toFixed(1) ?? '25.0'}°C</Text>
          </View>
          <View style={styles.secondaryReadings}>
            <View style={styles.secondaryReading}>
              <View style={styles.readingLabelRow}>
                <MetricIcon kind="humidity" color={palette.muted} />
                <Text style={styles.secondaryLabel}>Humidity</Text>
              </View>
              <Text style={styles.secondaryValue}>{reading ? `${reading.humidityPct.toFixed(1)}%` : '—'}</Text>
            </View>
            <View style={styles.secondaryDivider} />
            <View style={styles.secondaryReading}>
              <Text style={styles.secondaryLabel}>Simulated fan</Text>
              <Text style={styles.secondaryValue}>{reading ? `${fanSpeedPct}%` : '—'}</Text>
            </View>
          </View>
          <View style={styles.readingBottomRule} />
          <Text style={styles.sampleAge}>{reading ? `Updated ${Math.floor(sampleAgeMs / 1000)}s ago${stale ? ' · stale' : ''}` : 'Waiting for a Wokwi reading'}</Text>
          {statusWarning && <Text style={styles.statusDescription}>{statusDescription}</Text>}
        </View>

        <View style={styles.inspectionSection} accessibilityLiveRegion="polite">
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionTitle}>Inspection</Text>
            {baseline !== null && <Text style={styles.reference}>Reference {baseline.toFixed(1)}°C</Text>}
          </View>
          {!alertRecord ? (
            <View style={styles.clearPanel}>
              <Text style={styles.clearTitle}>No inspection prompt</Text>
              <Text style={styles.clearBadge}>CLEAR</Text>
            </View>
          ) : (
            <View style={[styles.alertPanel, alertRecord.recovered && styles.recoveredPanel]}>
              <View style={styles.alertHeading}>
                <Text style={[styles.alertTitle, alertRecord.recovered && styles.recoveredTitle]}>
                  {alertRecord.recovered ? 'Reading recovered' : 'Check House 1'}
                </Text>
                <Text style={[styles.alertBadge, alertRecord.recovered && styles.recoveredBadge]}>{alertRecord.recovered ? 'RECOVERED' : alertRecord.acknowledged ? 'ACKNOWLEDGED' : 'INSPECT'}</Text>
              </View>
              <Text style={[styles.alertDescription, alertRecord.recovered && styles.recoveredDescription]}>
                {alertRecord.recovered ? 'Temperature is below the simulation setpoint. Prompt retained until reset.' : `Temperature reached the ${reading?.setpointC.toFixed(1) ?? '25.0'}°C simulation setpoint.`}
              </Text>
              {!alertRecord.acknowledged && (
                <Pressable accessibilityRole="button" onPress={acknowledge} style={({ pressed }) => [styles.ackButton, pressed && styles.ackPressed]}>
                  <Text style={styles.ackText}>Acknowledge</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>

        <View style={styles.airflowCard}>
          <Text style={styles.airflowTitle}>Simulated airflow</Text>
          <View style={styles.airflowColumns}>
            <View style={styles.airflowColumn}>
              <Text style={styles.airflowLabel}>Simulated fan</Text>
              <View style={styles.fanHousing} accessible={false}>
                {reading ? (
                  <Animated.View style={[styles.fanRotor, { transform: [{ rotate: fanAngle }] }]}>
                    {[0, 120, 240].map((angle) => (
                      <View key={angle} style={[styles.fanArm, { transform: [{ rotate: `${angle}deg` }] }]}>
                        <View style={styles.fanBlade} />
                      </View>
                    ))}
                    <View style={styles.fanHub} />
                  </Animated.View>
                ) : <Text style={styles.visualPlaceholder}>—</Text>}
              </View>
              <View style={styles.airflowValueRow}>
                <Text style={styles.airflowState}>{fanState}</Text>
                <Text style={styles.airflowPercent}>{reading ? `${fanSpeedPct}%` : '—'}</Text>
              </View>
            </View>
            <View style={styles.airflowDivider} />
            <View style={styles.airflowColumn}>
              <Text style={styles.airflowLabel}>Simulated vent</Text>
              <View style={styles.ventFrame} accessible={false}>
                {reading ? [0, 1, 2, 3].map((slat) => (
                  <Animated.View key={slat} style={[styles.ventSlat, { transform: [{ perspective: 300 }, { rotateX: ventAngle }] }]} />
                )) : <Text style={styles.visualPlaceholder}>—</Text>}
              </View>
              <View style={styles.airflowValueRow}>
                <Text style={styles.airflowState}>{ventState}</Text>
                <Text style={styles.airflowPercent}>{reading ? `${fanSpeedPct}%` : '—'}</Text>
              </View>
            </View>
          </View>
          <View style={styles.airflowBottomRule} />
          <Text style={styles.airflowNote}>Visual only · no equipment connected</Text>
          {!!visualDataState && <Text style={styles.airflowDataState}>{visualDataState}</Text>}
        </View>

        <View style={styles.connectionSection}>
          <Text style={styles.sectionTitle}>Connection</Text>
          <Text style={styles.inputLabel}>Bridge URL</Text>
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
          <ActionButton title={connecting ? 'Connecting…' : connected ? 'Reconnect' : 'Connect to bridge'} onPress={() => void connect()} palette={palette} disabled={connecting} />
          {connecting && <ActivityIndicator color={palette.greenText} />}
          {!!message && !connecting && (
            <View style={styles.connectionMessage}>
              <View style={[styles.connectionDot, statusWarning && styles.connectionDotWarning]} />
              <Text style={[styles.message, statusWarning && styles.messageWarning]}>
                {status === 'Not connected' ? 'Enter the laptop bridge URL, then connect.' : reading && message === 'Connected. Waiting for a fresh Wokwi reading.' ? 'Connected to the local bridge.' : message}
              </Text>
            </View>
          )}
          <View style={styles.reset}><ActionButton title="Reset session" onPress={resetDemo} palette={palette} secondary /></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 19, paddingBottom: 35 },
    backButton: { flexDirection: 'row', alignItems: 'center', gap: 9, alignSelf: 'flex-start', minHeight: 44, marginTop: 8 },
    backCircle: { width: 32, height: 32, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    backArrow: { color: colors.greenText, fontSize: 27, lineHeight: 30, marginTop: -3 },
    backText: { color: colors.greenText, fontSize: 13, fontWeight: '700' },
    heading: { marginTop: 18, marginBottom: 25 },
    headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    title: { color: colors.ink, fontSize: 36, fontWeight: '800', letterSpacing: -1.2 },
    sourceText: { color: colors.muted, fontSize: 13, marginTop: 3 },
    connectionState: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
    connectionDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.greenText },
    connectionDotWarning: { backgroundColor: colors.warningInk },
    connectionText: { color: colors.greenText, fontSize: 12, fontWeight: '700', flexShrink: 1 },
    connectionTextWarning: { color: colors.warningInk },
    readings: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 20 },
    readingLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    readingLabel: { color: colors.ink, fontSize: 14, fontWeight: '700' },
    temperature: { color: colors.ink, fontSize: 86, lineHeight: 105, fontWeight: '800', letterSpacing: -3, marginTop: 13, fontVariant: ['tabular-nums'] },
    temperatureCompact: { fontSize: 70, lineHeight: 85 },
    temperatureUnit: { fontSize: 28, letterSpacing: -0.5 },
    setpointRow: { minHeight: 39, backgroundColor: colors.greenSurface, borderRadius: 9, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    setpointLabel: { color: colors.ink, fontSize: 12, fontWeight: '700' },
    setpointValue: { color: colors.ink, fontSize: 12, fontWeight: '800', fontVariant: ['tabular-nums'] },
    secondaryReadings: { flexDirection: 'row', gap: 16, marginTop: 22, marginBottom: 23 },
    secondaryReading: { flex: 1, gap: 7, minWidth: 0 },
    secondaryDivider: { width: 1, backgroundColor: colors.border },
    secondaryLabel: { color: colors.muted, fontSize: 13 },
    secondaryValue: { color: colors.ink, fontSize: 24, fontWeight: '800', fontVariant: ['tabular-nums'] },
    readingBottomRule: { height: 1, backgroundColor: colors.border },
    sampleAge: { color: colors.muted, fontSize: 12, marginTop: 14 },
    statusDescription: { color: colors.warningInk, fontSize: 12, marginTop: 6 },
    inspectionSection: { marginTop: 34 },
    sectionHeadingRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 14 },
    sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' },
    reference: { color: colors.muted, fontSize: 11 },
    clearPanel: { minHeight: 62, paddingHorizontal: 18, backgroundColor: colors.greenSurface, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 9 },
    clearTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', flexShrink: 1 },
    clearBadge: { color: colors.ink, borderWidth: 1, borderColor: colors.greenText, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 5, fontSize: 10, fontWeight: '700' },
    alertPanel: { padding: 18, borderRadius: 14, backgroundColor: colors.alertSurface, gap: 10 },
    recoveredPanel: { backgroundColor: colors.greenSurface },
    alertHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    alertTitle: { color: colors.warningInk, fontSize: 18, fontWeight: '800', flexShrink: 1 },
    recoveredTitle: { color: colors.ink },
    alertBadge: { color: colors.warningInk, borderWidth: 1, borderColor: colors.warningInk, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 5, fontSize: 10, fontWeight: '700' },
    recoveredBadge: { color: colors.greenText, borderColor: colors.greenText },
    alertDescription: { color: colors.warningInk, fontSize: 13, lineHeight: 19 },
    recoveredDescription: { color: colors.body },
    ackButton: { minHeight: 46, borderRadius: 7, backgroundColor: '#573B31', alignItems: 'center', justifyContent: 'center', marginTop: 3 },
    ackPressed: { opacity: 0.8 },
    ackText: { color: '#FFF6ED', fontSize: 14, fontWeight: '800' },
    airflowCard: { backgroundColor: colors.forest, borderRadius: 18, padding: 20, marginTop: 31 },
    airflowTitle: { color: colors.onForest, fontSize: 21, fontWeight: '800', marginBottom: 20 },
    airflowColumns: { flexDirection: 'row', gap: 14 },
    airflowColumn: { flex: 1, minWidth: 0, alignItems: 'center' },
    airflowDivider: { width: 1, backgroundColor: colors.forestLine },
    airflowLabel: { color: colors.onForestMuted, fontSize: 12, alignSelf: 'flex-start', marginBottom: 12 },
    fanHousing: { width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderColor: colors.onForestAccent, alignItems: 'center', justifyContent: 'center' },
    fanRotor: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
    fanArm: { position: 'absolute', width: 72, height: 72, alignItems: 'center' },
    fanBlade: { width: 15, height: 24, marginTop: 4, borderRadius: 12, backgroundColor: colors.onForestAccent },
    fanHub: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.onForestAccent },
    ventFrame: { width: 88, height: 84, borderRadius: 7, borderWidth: 3, borderColor: colors.onForestAccent, alignItems: 'center', justifyContent: 'space-around', paddingVertical: 8 },
    ventSlat: { width: 65, height: 11, borderRadius: 2, backgroundColor: colors.onForestAccent },
    visualPlaceholder: { color: colors.onForestMuted, fontSize: 28 },
    airflowValueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', alignSelf: 'stretch', gap: 4, marginTop: 14 },
    airflowState: { color: colors.onForest, fontSize: 15, fontWeight: '800', flexShrink: 1 },
    airflowPercent: { color: colors.onForestAccent, fontSize: 17, fontWeight: '800', fontVariant: ['tabular-nums'] },
    airflowBottomRule: { height: 1, backgroundColor: colors.forestLine, marginTop: 17, marginBottom: 11 },
    airflowNote: { color: colors.onForestMuted, fontSize: 11 },
    airflowDataState: { color: colors.onForestAccent, fontSize: 11, marginTop: 5 },
    connectionSection: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 31, paddingTop: 29, gap: 11 },
    inputLabel: { color: colors.ink, fontSize: 12, fontWeight: '700', marginTop: 2 },
    input: { minHeight: 48, borderColor: colors.inputBorder, borderWidth: 1, borderRadius: 9, paddingHorizontal: 13, backgroundColor: colors.greenSurface, color: colors.ink, fontSize: 14 },
    connectionMessage: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 7 },
    message: { color: colors.greenText, fontSize: 12, lineHeight: 17, flex: 1 },
    messageWarning: { color: colors.warningInk },
    reset: { marginTop: 17 },
  });
}
