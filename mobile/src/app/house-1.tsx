import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConnectionSection } from '../connection';
import { useDemoSession } from '../demo-session';
import { ActionButton, BrandHeader, Chevron, MetricIcon, Palette, radius, space, type, usePalette } from '../ui';

export default function HouseDetailScreen() {
  const router = useRouter();
  const palette = usePalette();
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 370 || fontScale >= 1.3;
  const styles = useMemo(() => createStyles(palette), [palette]);
  const {
    connected, reading, baseline, alertRecord, sampleAgeMs, stale, status, statusDescription, acknowledge,
  } = useDemoSession();
  const fanSpeedPct = reading?.fanSpeedPct;
  // From iot: a local ESP32 drives a fan relay (on/off), not a simulated fan percentage.
  const physicalFan = reading?.source === 'Local ESP32 + DHT22';
  const fanValue = !reading ? '—' : physicalFan ? (fanSpeedPct ? 'ON' : 'OFF') : `${fanSpeedPct}%`;
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

  const fanState = !reading ? '—' : physicalFan ? `Relay ${fanSpeedPct ? 'ON' : 'OFF'}` : fanSpeedPct === 0 ? 'Off' : fanSpeedPct === 50 ? 'Half speed' : fanSpeedPct === 100 ? 'Full speed' : 'Running';
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
          hitSlop={space.sm}
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
        >
          <View style={styles.backCircle}><Chevron color={palette.greenText} size={8} direction="left" /></View>
          <Text style={styles.backText}>House overview</Text>
        </Pressable>

        <View style={styles.heading}>
          <View style={styles.headingRow}>
            <Text accessibilityRole="header" style={styles.title}>House 1</Text>
            <View style={[styles.statusPill, statusWarning && styles.statusPillWarning]}>
              <View style={[styles.connectionDot, statusWarning && styles.connectionDotWarning]} />
              <Text style={[styles.connectionText, statusWarning && styles.connectionTextWarning]}>{status}</Text>
            </View>
          </View>
          <Text style={styles.sourceText}>{reading?.source ?? 'Waiting for sensor data'}</Text>
        </View>

        <View style={styles.readings}>
          <View style={styles.readingLabelRow}>
            <MetricIcon kind="temperature" color={palette.muted} />
            <Text style={styles.readingLabel}>Temperature</Text>
          </View>
          <Text style={[styles.temperature, compact && styles.temperatureCompact]} accessibilityLabel={reading ? `Temperature ${reading.temperatureC.toFixed(1)} degrees Celsius` : 'Temperature unavailable'}>
            {reading ? reading.temperatureC.toFixed(1) : '—'}<Text style={styles.temperatureUnit}>{reading ? '°C' : ''}</Text>
          </Text>
          <View style={styles.setpointRow}>
            <Text style={styles.setpointLabel}>Demo setpoint</Text>
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
              <Text style={styles.secondaryLabel}>{physicalFan ? 'Fan relay' : 'Simulated fan'}</Text>
              <Text style={styles.secondaryValue}>{fanValue}</Text>
            </View>
          </View>
          <Text style={styles.sampleAge}>{reading ? `Updated ${Math.floor(sampleAgeMs / 1000)}s ago${stale ? ' · stale' : ''}` : 'Waiting for sensor data'}</Text>
          {statusWarning && <Text style={styles.statusDescription}>{statusDescription}</Text>}
        </View>

        <View style={styles.inspectionSection} accessibilityLiveRegion="polite">
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionTitle}>Inspection</Text>
            {baseline !== null && <Text style={styles.reference}>Reference {baseline.toFixed(1)}°C</Text>}
          </View>
          {!alertRecord ? (
            <View style={styles.clearPanel}>
              <Text style={styles.clearTitle}>No inspection needed</Text>
              <View style={styles.clearBadge}><Text style={styles.clearBadgeText}>Clear</Text></View>
            </View>
          ) : (
            <View style={[styles.alertPanel, alertRecord.recovered && styles.recoveredPanel]}>
              <View style={styles.alertHeading}>
                <Text style={[styles.alertTitle, alertRecord.recovered && styles.recoveredTitle]}>
                  {alertRecord.recovered ? 'Recovered' : 'Inspect House 1'}
                </Text>
                {alertRecord.acknowledged && (
                  <View style={[styles.alertBadge, alertRecord.recovered && styles.recoveredBadge]}>
                    <Text style={[styles.alertBadgeText, alertRecord.recovered && styles.recoveredBadgeText]}>Acknowledged</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.alertDescription, alertRecord.recovered && styles.recoveredDescription]}>
                {alertRecord.recovered ? `Below the ${reading?.setpointC.toFixed(1) ?? '25.0'}°C demo setpoint. Kept until Reset session.` : `Reached the ${reading?.setpointC.toFixed(1) ?? '25.0'}°C demo setpoint.`}
              </Text>
              {!alertRecord.acknowledged && !alertRecord.recovered && (
                <ActionButton title="Acknowledge" onPress={acknowledge} palette={palette} />
              )}
            </View>
          )}
        </View>

        <View style={styles.airflowCard}>
          <Text style={styles.airflowTitle}>{physicalFan ? 'Fan relay status' : 'Simulated airflow'}</Text>
          <View style={styles.airflowColumns}>
            <View style={styles.airflowColumn}>
              <Text style={styles.airflowLabel}>{physicalFan ? 'Fan relay' : 'Simulated fan'}</Text>
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
                {!physicalFan && <Text style={styles.airflowPercent}>{reading ? `${fanSpeedPct}%` : '—'}</Text>}
              </View>
            </View>
            <View style={styles.airflowDivider} />
            <View style={styles.airflowColumn}>
              <Text style={styles.airflowLabel}>{physicalFan ? 'Vent visual' : 'Simulated vent'}</Text>
              <View style={styles.ventFrame} accessible={false}>
                {reading ? [0, 1, 2, 3].map((slat) => (
                  <Animated.View key={slat} style={[styles.ventSlat, { transform: [{ perspective: 300 }, { rotateX: ventAngle }] }]} />
                )) : <Text style={styles.visualPlaceholder}>—</Text>}
              </View>
              <View style={styles.airflowValueRow}>
                <Text style={styles.airflowState}>{physicalFan && reading ? 'App-only' : ventState}</Text>
                {!physicalFan && <Text style={styles.airflowPercent}>{reading ? `${fanSpeedPct}%` : '—'}</Text>}
              </View>
            </View>
          </View>
          <View style={styles.airflowBottomRule} />
          <Text style={styles.airflowNote}>{physicalFan ? 'ESP32 relay controls the fan; the app cannot verify fan rotation' : 'Visual only · no equipment connected'}</Text>
          {!!visualDataState && <Text style={styles.airflowDataState}>{visualDataState}</Text>}
        </View>

        <View style={styles.connectionWrap}><ConnectionSection /></View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.xxl },
    backButton: { flexDirection: 'row', alignItems: 'center', gap: space.sm, alignSelf: 'flex-start', minHeight: 44, marginTop: space.sm, paddingRight: space.md, borderRadius: radius.pill },
    backPressed: { backgroundColor: colors.greenSurface },
    backCircle: { width: 36, height: 36, borderWidth: 1.5, borderColor: colors.greenText, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    backText: { ...type.label, color: colors.greenText },
    heading: { marginTop: space.lg, marginBottom: space.xl, gap: space.xs },
    headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.sm },
    title: { ...type.title, color: colors.ink, flexShrink: 1 },
    sourceText: { ...type.caption, color: colors.muted },
    statusPill: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 32, paddingHorizontal: space.md, borderRadius: radius.pill, backgroundColor: colors.greenSurface, flexShrink: 1 },
    statusPillWarning: { backgroundColor: colors.warningSurface },
    connectionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.greenText },
    connectionDotWarning: { backgroundColor: colors.warningInk },
    connectionText: { ...type.caption, color: colors.greenText, fontWeight: '700', flexShrink: 1 },
    connectionTextWarning: { color: colors.warningInk },
    readings: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: space.lg },
    readingLabelRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    readingLabel: { ...type.label, color: colors.ink },
    temperature: { ...type.display, color: colors.ink, marginTop: space.md, fontVariant: ['tabular-nums'] },
    temperatureCompact: { fontSize: 60, lineHeight: 70 },
    temperatureUnit: { fontSize: 30, letterSpacing: -0.5, color: colors.greenText },
    setpointRow: { minHeight: 44, backgroundColor: colors.greenSurface, borderRadius: radius.control, paddingHorizontal: space.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.sm },
    setpointLabel: { ...type.label, color: colors.ink },
    setpointValue: { ...type.label, color: colors.ink, fontVariant: ['tabular-nums'] },
    secondaryReadings: { flexDirection: 'row', gap: space.lg, marginTop: space.lg, paddingTop: space.lg, borderTopWidth: 1, borderTopColor: colors.border },
    secondaryReading: { flex: 1, gap: space.sm, minWidth: 0 },
    secondaryDivider: { width: 1, backgroundColor: colors.border },
    secondaryLabel: { ...type.caption, color: colors.muted },
    secondaryValue: { ...type.heading, color: colors.ink, fontVariant: ['tabular-nums'] },
    sampleAge: { ...type.caption, color: colors.muted, marginTop: space.md },
    statusDescription: { ...type.caption, color: colors.warningInk, marginTop: space.xs },
    inspectionSection: { marginTop: space.xxl, gap: space.md },
    sectionHeadingRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.sm },
    sectionTitle: { ...type.heading, color: colors.ink },
    reference: { ...type.caption, color: colors.muted },
    clearPanel: { minHeight: 56, paddingHorizontal: space.lg, backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
    clearTitle: { ...type.body, color: colors.ink, fontWeight: '700', flexShrink: 1 },
    clearBadge: { borderRadius: radius.pill, backgroundColor: colors.greenSurface, paddingHorizontal: space.md, paddingVertical: space.xs },
    clearBadgeText: { ...type.caption, color: colors.greenText, fontWeight: '700' },
    alertPanel: { padding: space.lg, borderRadius: radius.card, backgroundColor: colors.alertSurface, gap: space.md },
    recoveredPanel: { backgroundColor: colors.greenSurface },
    alertHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm, flexWrap: 'wrap' },
    alertTitle: { ...type.heading, color: colors.warningInk, flexShrink: 1 },
    recoveredTitle: { color: colors.ink },
    alertBadge: { borderRadius: radius.pill, backgroundColor: colors.warningInk, paddingHorizontal: space.md, paddingVertical: space.xs },
    recoveredBadge: { backgroundColor: colors.greenText },
    alertBadgeText: { ...type.caption, color: colors.alertSurface, fontWeight: '700' },
    recoveredBadgeText: { color: colors.background },
    alertDescription: { ...type.body, color: colors.warningInk },
    recoveredDescription: { color: colors.body },
    airflowCard: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: space.lg, marginTop: space.xxl },
    airflowTitle: { ...type.heading, color: colors.ink, marginBottom: space.lg },
    airflowColumns: { flexDirection: 'row', gap: space.md },
    airflowColumn: { flex: 1, minWidth: 0, alignItems: 'center' },
    airflowDivider: { width: 1, backgroundColor: colors.border },
    airflowLabel: { ...type.caption, color: colors.muted, alignSelf: 'flex-start', marginBottom: space.md },
    fanHousing: { width: 88, height: 88, borderRadius: 44, borderWidth: 4, borderColor: colors.greenText, backgroundColor: colors.greenSurface, alignItems: 'center', justifyContent: 'center' },
    fanRotor: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
    fanArm: { position: 'absolute', width: 72, height: 72, alignItems: 'center' },
    fanBlade: { width: 15, height: 24, marginTop: 4, borderRadius: 12, backgroundColor: colors.greenText },
    fanHub: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.greenText },
    ventFrame: { width: 88, height: 88, borderRadius: radius.control, borderWidth: 3, borderColor: colors.greenText, backgroundColor: colors.greenSurface, alignItems: 'center', justifyContent: 'space-around', paddingVertical: space.sm },
    ventSlat: { width: 64, height: 11, borderRadius: 2, backgroundColor: colors.greenText },
    visualPlaceholder: { ...type.heading, color: colors.muted },
    airflowValueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', alignSelf: 'stretch', gap: space.xs, marginTop: space.md },
    airflowState: { ...type.label, color: colors.ink, flexShrink: 1 },
    airflowPercent: { ...type.label, color: colors.greenText, fontVariant: ['tabular-nums'] },
    airflowBottomRule: { height: 1, backgroundColor: colors.border, marginTop: space.lg, marginBottom: space.md },
    airflowNote: { ...type.caption, color: colors.muted },
    connectionWrap: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: space.xxl, paddingTop: space.xl },
    airflowDataState: { ...type.caption, color: colors.warningInk, marginTop: space.xs },
  });
}
