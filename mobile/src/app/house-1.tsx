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
import { ActionButton, BrandHeader, MetricIcon, Palette, displayCompact, spacing, text, usePalette } from '../ui';

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
    content: { flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
    backButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'flex-start', minHeight: 44, marginTop: spacing.sm },
    backCircle: { width: 32, height: 32, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    backArrow: { ...text.heading, fontWeight: '400', color: colors.greenText, marginTop: -spacing.xs },
    backText: { ...text.label, color: colors.greenText },
    heading: { marginTop: spacing.lg, marginBottom: spacing.xl },
    headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
    title: { ...text.title, color: colors.ink },
    sourceText: { ...text.caption, color: colors.muted, marginTop: spacing.xs },
    connectionState: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 1 },
    connectionDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.greenText },
    connectionDotWarning: { backgroundColor: colors.warningInk },
    connectionText: { ...text.label, color: colors.greenText, flexShrink: 1 },
    connectionTextWarning: { color: colors.warningInk },
    readings: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg },
    readingLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    readingLabel: { ...text.label, color: colors.ink },
    temperature: { ...text.display, color: colors.ink, marginTop: spacing.md },
    temperatureCompact: displayCompact,
    temperatureUnit: text.title,
    setpointRow: { minHeight: 39, backgroundColor: colors.greenSurface, borderRadius: 9, paddingHorizontal: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
    setpointLabel: { ...text.label, color: colors.ink },
    setpointValue: { ...text.label, fontWeight: '800', color: colors.ink, fontVariant: ['tabular-nums'] },
    secondaryReadings: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.xl },
    secondaryReading: { flex: 1, gap: spacing.sm, minWidth: 0 },
    secondaryDivider: { width: 1, backgroundColor: colors.border },
    secondaryLabel: { ...text.caption, color: colors.muted },
    secondaryValue: { ...text.heading, color: colors.ink, fontVariant: ['tabular-nums'] },
    readingBottomRule: { height: 1, backgroundColor: colors.border },
    sampleAge: { ...text.caption, color: colors.muted, marginTop: spacing.md },
    statusDescription: { ...text.caption, color: colors.warningInk, marginTop: spacing.xs },
    inspectionSection: { marginTop: spacing.xxl },
    sectionHeadingRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm, marginBottom: spacing.md },
    sectionTitle: { ...text.heading, color: colors.ink },
    reference: { ...text.caption, color: colors.muted },
    clearPanel: { minHeight: 62, paddingHorizontal: spacing.lg, backgroundColor: colors.greenSurface, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
    clearTitle: { ...text.body, fontWeight: '800', color: colors.ink, flexShrink: 1 },
    clearBadge: { ...text.label, color: colors.ink, borderWidth: 1, borderColor: colors.greenText, borderRadius: 5, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
    alertPanel: { padding: spacing.lg, borderRadius: 14, backgroundColor: colors.alertSurface, gap: spacing.sm },
    recoveredPanel: { backgroundColor: colors.greenSurface },
    alertHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
    alertTitle: { ...text.heading, color: colors.warningInk, flexShrink: 1 },
    recoveredTitle: { color: colors.ink },
    alertBadge: { ...text.label, color: colors.warningInk, borderWidth: 1, borderColor: colors.warningInk, borderRadius: 5, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
    recoveredBadge: { color: colors.greenText, borderColor: colors.greenText },
    alertDescription: { ...text.body, color: colors.warningInk },
    recoveredDescription: { color: colors.body },
    ackButton: { minHeight: 46, borderRadius: 7, backgroundColor: colors.alertAction, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xs },
    ackPressed: { opacity: 0.8 },
    ackText: { ...text.body, fontWeight: '800', color: colors.onAlertAction },
    airflowCard: { backgroundColor: colors.forest, borderRadius: 18, padding: spacing.xl, marginTop: spacing.xxl },
    airflowTitle: { ...text.heading, color: colors.onForest, marginBottom: spacing.lg },
    airflowColumns: { flexDirection: 'row', gap: spacing.md },
    airflowColumn: { flex: 1, minWidth: 0, alignItems: 'center' },
    airflowDivider: { width: 1, backgroundColor: colors.forestLine },
    airflowLabel: { ...text.caption, color: colors.onForestMuted, alignSelf: 'flex-start', marginBottom: spacing.md },
    fanHousing: { width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderColor: colors.onForestAccent, alignItems: 'center', justifyContent: 'center' },
    fanRotor: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
    fanArm: { position: 'absolute', width: 72, height: 72, alignItems: 'center' },
    fanBlade: { width: 15, height: 24, marginTop: spacing.xs, borderRadius: 12, backgroundColor: colors.onForestAccent },
    fanHub: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.onForestAccent },
    ventFrame: { width: 88, height: 84, borderRadius: 7, borderWidth: 3, borderColor: colors.onForestAccent, alignItems: 'center', justifyContent: 'space-around', paddingVertical: spacing.sm },
    ventSlat: { width: 65, height: 11, borderRadius: 2, backgroundColor: colors.onForestAccent },
    visualPlaceholder: { ...text.title, fontWeight: '400', color: colors.onForestMuted },
    airflowValueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', alignSelf: 'stretch', gap: spacing.xs, marginTop: spacing.md },
    airflowState: { ...text.body, fontWeight: '800', color: colors.onForest, flexShrink: 1 },
    airflowPercent: { ...text.body, fontWeight: '800', color: colors.onForestAccent, fontVariant: ['tabular-nums'] },
    airflowBottomRule: { height: 1, backgroundColor: colors.forestLine, marginTop: spacing.lg, marginBottom: spacing.md },
    airflowNote: { ...text.caption, color: colors.onForestMuted },
    airflowDataState: { ...text.caption, color: colors.onForestAccent, marginTop: spacing.xs },
    connectionSection: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.xxl, paddingTop: spacing.xxl, gap: spacing.md },
    inputLabel: { ...text.label, color: colors.ink, marginTop: spacing.xs },
    input: { ...text.body, minHeight: 48, borderColor: colors.inputBorder, borderWidth: 1, borderRadius: 9, paddingHorizontal: spacing.md, backgroundColor: colors.greenSurface, color: colors.ink },
    connectionMessage: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
    message: { ...text.caption, color: colors.greenText, flex: 1 },
    messageWarning: { color: colors.warningInk },
    reset: { marginTop: spacing.lg },
  });
}
