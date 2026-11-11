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
import { useDemoSession } from '../demo-session';
import { BrandHeader, displayFont, MetricIcon, Palette, usePalette } from '../ui';

export default function HouseDetailScreen() {
  const router = useRouter();
  const palette = usePalette();
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 370 || fontScale >= 1.3;
  const styles = useMemo(() => createStyles(palette), [palette]);
  const {
    connected, reading, baseline, alertRecord, sampleAgeMs, stale, status,
    statusDescription, acknowledge,
  } = useDemoSession();
  const fanSpeedPct = reading?.fanSpeedPct;
  const physicalFan = reading?.source === 'Local ESP32 + DHT22';
  const fanValue = !reading ? '—' : physicalFan ? (fanSpeedPct ? 'ON' : 'OFF') : `${fanSpeedPct}%`;
  const statusWarning = stale || status.startsWith('Disconnected');
  const connectionWarning = status === 'Not connected' || statusWarning;
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
          style={styles.backButton}
        >
          <View style={styles.backCircle}><Text style={styles.backArrow}>‹</Text></View>
          <Text style={styles.backText}>House overview</Text>
        </Pressable>

        <View style={styles.heading}>
          <View style={styles.headingRow}>
            <Text accessibilityRole="header" style={styles.title}>House 1</Text>
            <View style={[styles.connectionState, connectionWarning && styles.connectionStateWarning]}>
              <View style={[styles.connectionDot, connectionWarning && styles.connectionDotWarning]} />
              <Text style={[styles.connectionText, connectionWarning && styles.connectionTextWarning]}>{status}</Text>
            </View>
          </View>
          <Text style={styles.sourceText}>{reading?.source ?? 'Waiting for sensor data'}</Text>
        </View>

        <View style={styles.readings}>
          <View style={styles.heroTop}>
            <Text style={styles.heroEyebrow}>CURRENT READING</Text>
            <View style={styles.sourceBadge}><View style={styles.sourceDot} /><Text style={styles.sourceBadgeText}>{!reading ? 'WAITING' : reading.source === 'Wokwi simulated data' ? 'SIMULATED' : 'HARDWARE'}</Text></View>
          </View>
          <View style={[styles.heroMain, compact && styles.heroMainCompact]}>
            <View style={styles.temperatureBlock}>
              <View style={styles.readingLabelRow}>
                <MetricIcon kind="temperature" color={palette.onForestMuted} />
                <Text style={styles.readingLabel}>Temperature</Text>
              </View>
              <Text style={[styles.temperature, compact && styles.temperatureCompact]} accessibilityLabel={reading ? `Temperature ${reading.temperatureC.toFixed(1)} degrees Celsius` : 'Temperature unavailable'}>
                {reading ? reading.temperatureC.toFixed(1) : '—'}<Text style={styles.temperatureUnit}>{reading ? '°C' : ''}</Text>
              </Text>
            </View>
          </View>
          <View style={styles.secondaryReadings}>
            <View style={styles.secondaryReading}>
              <View style={styles.readingLabelRow}>
                <MetricIcon kind="humidity" color={palette.onForestMuted} />
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
          <View style={styles.sampleRow}>
            <Text style={styles.sampleAge}>{reading ? `Updated ${Math.floor(sampleAgeMs / 1000)}s ago${stale ? ' · stale' : ''}` : 'Waiting for a sensor reading'}</Text>
            {statusWarning && <Text style={styles.statusDescription}>{stale ? 'LAST KNOWN' : 'UNAVAILABLE'}</Text>}
          </View>
          {statusWarning && <Text style={styles.statusDescriptionDetail}>{statusDescription}</Text>}
        </View>

        <View style={styles.inspectionSection} accessibilityLiveRegion="polite">
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionTitle}>Inspection</Text>
            {baseline !== null && <Text style={styles.reference}>Reference {baseline.toFixed(1)}°C</Text>}
          </View>
          {!alertRecord ? (
            <View style={styles.clearPanel}>
              <View style={styles.promptIcon}><View style={styles.promptDot} /></View>
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
              {!alertRecord.acknowledged && !alertRecord.recovered && (
                <Pressable accessibilityRole="button" onPress={acknowledge} style={({ pressed }) => [styles.ackButton, pressed && styles.ackPressed]}>
                  <Text style={styles.ackText}>Acknowledge</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>

        <View style={styles.airflowCard}>
          <Text style={styles.airflowTitle}>{physicalFan ? 'Fan relay status' : 'Airflow simulation'}</Text>
          <Text style={styles.airflowSubtitle}>{physicalFan ? 'ESP32 switches the fan relay; the vent remains visual' : 'App-only visuals based on the demo fan value'}</Text>
          <View style={styles.airflowColumns}>
            <View style={styles.airflowColumn}>
              <Text style={styles.airflowLabel}>{physicalFan ? 'Fan relay' : 'Fan'}</Text>
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
              <Text style={styles.airflowLabel}>{physicalFan ? 'Vent visual' : 'Vent'}</Text>
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
          <Text style={styles.airflowNote}>{physicalFan ? 'ESP32 relay controls the fan; app cannot verify fan rotation' : 'Visual only · no fan, vent, or servo connected'}</Text>
          {!!visualDataState && <Text style={styles.airflowDataState}>{visualDataState}</Text>}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open bridge setup. ${status}.`}
          onPress={() => router.push('/bridge-setup')}
          style={({ pressed }) => [styles.bridgeSetupLink, pressed && styles.bridgeSetupPressed]}
        >
          <View style={styles.bridgeSetupCopy}>
            <Text style={styles.bridgeSetupTitle}>Bridge setup</Text>
            <Text style={styles.bridgeSetupHint}>Connection and demo settings</Text>
          </View>
          <Text style={styles.bridgeSetupArrow}>›</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 15, paddingBottom: 36 },
    backButton: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start', minHeight: 48, marginTop: 9 },
    backCircle: { width: 36, height: 36, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
    backArrow: { color: colors.greenText, fontSize: 26, lineHeight: 30, marginTop: -3 },
    backText: { color: colors.greenText, fontSize: 14, fontWeight: '700' },
    heading: { marginTop: 14, marginBottom: 17, gap: 5 },
    headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
    title: { color: colors.ink, fontFamily: displayFont, fontSize: 34, fontWeight: '800', letterSpacing: -0.6 },
    sourceText: { color: colors.muted, fontSize: 13, marginTop: 2 },
    connectionState: { flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 1, minHeight: 32, paddingHorizontal: 10, backgroundColor: colors.greenSurface, borderRadius: 18 },
    connectionStateWarning: { backgroundColor: colors.warningSurface },
    connectionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.greenText },
    connectionDotWarning: { backgroundColor: colors.warningInk },
    connectionText: { color: colors.greenText, fontSize: 12, fontWeight: '700', flexShrink: 1 },
    connectionTextWarning: { color: colors.warningInk },
    readings: { backgroundColor: colors.forest, borderRadius: 24, padding: 21, overflow: 'hidden' },
    heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
    heroEyebrow: { color: colors.onForestMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
    sourceBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.forestLine, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 6 },
    sourceDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.onForestAccent },
    sourceBadgeText: { color: colors.onForestMuted, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
    heroMain: { marginTop: 22, marginBottom: 19 },
    heroMainCompact: { marginTop: 18 },
    temperatureBlock: { minWidth: 0 },
    readingLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    readingLabel: { color: colors.onForestMuted, fontSize: 13, fontWeight: '600' },
    temperature: { color: colors.onForest, fontFamily: displayFont, fontSize: 82, lineHeight: 86, fontWeight: '800', letterSpacing: -1.7, marginTop: 7, fontVariant: ['tabular-nums'] },
    temperatureCompact: { fontSize: 70, lineHeight: 74 },
    temperatureUnit: { color: colors.onForestAccent, fontFamily: displayFont, fontSize: 29, letterSpacing: -0.3 },
    secondaryReadings: { flexDirection: 'row', gap: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.forestLine },
    secondaryReading: { flex: 1, gap: 7, minWidth: 0 },
    secondaryDivider: { width: 1, backgroundColor: colors.forestLine },
    secondaryLabel: { color: colors.onForestMuted, fontSize: 13 },
    secondaryValue: { color: colors.onForest, fontFamily: displayFont, fontSize: 27, fontWeight: '800', fontVariant: ['tabular-nums'] },
    sampleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 7, marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.forestLine },
    sampleAge: { color: colors.onForestMuted, fontSize: 12 },
    statusDescription: { color: colors.warningInk, fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
    statusDescriptionDetail: { color: colors.onForestMuted, fontSize: 12, lineHeight: 17, marginTop: 6 },
    inspectionSection: { marginTop: 24 },
    sectionHeadingRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
    sectionTitle: { color: colors.ink, fontFamily: displayFont, fontSize: 23, fontWeight: '800', letterSpacing: -0.2 },
    reference: { color: colors.muted, fontSize: 12 },
    clearPanel: { minHeight: 74, paddingHorizontal: 15, paddingVertical: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 19, flexDirection: 'row', alignItems: 'center', gap: 11 },
    promptIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.greenSurface, alignItems: 'center', justifyContent: 'center' },
    promptDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.greenText },
    clearTitle: { color: colors.ink, fontSize: 15, fontWeight: '700', flex: 1, flexShrink: 1 },
    clearBadge: { color: colors.greenText, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 6, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    alertPanel: { padding: 18, borderRadius: 19, backgroundColor: colors.alertSurface, borderWidth: 1, borderColor: colors.warningSurface, gap: 11 },
    recoveredPanel: { backgroundColor: colors.greenSurface, borderColor: colors.greenSurface },
    alertHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    alertTitle: { color: colors.warningInk, fontFamily: displayFont, fontSize: 22, fontWeight: '800', flexShrink: 1 },
    recoveredTitle: { color: colors.ink },
    alertBadge: { color: colors.warningInk, borderWidth: 1, borderColor: colors.warningInk, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 6, fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
    recoveredBadge: { color: colors.greenText, borderColor: colors.greenText },
    ackButton: { minHeight: 48, borderRadius: 14, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center', marginTop: 2, paddingHorizontal: 16 },
    ackPressed: { opacity: 0.8 },
    ackText: { color: colors.onForest, fontSize: 14, fontWeight: '800' },
    airflowCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 22, padding: 19, marginTop: 20 },
    airflowTitle: { color: colors.ink, fontFamily: displayFont, fontSize: 23, fontWeight: '800', letterSpacing: -0.2 },
    airflowSubtitle: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 4, marginBottom: 18 },
    airflowColumns: { flexDirection: 'row', gap: 15 },
    airflowColumn: { flex: 1, minWidth: 0, alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: 17, padding: 13 },
    airflowDivider: { width: 1, backgroundColor: colors.border },
    airflowLabel: { color: colors.muted, fontSize: 12, fontWeight: '700', alignSelf: 'flex-start', marginBottom: 12 },
    fanHousing: { width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderColor: colors.greenText, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
    fanRotor: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
    fanArm: { position: 'absolute', width: 72, height: 72, alignItems: 'center' },
    fanBlade: { width: 15, height: 24, marginTop: 4, borderRadius: 12, backgroundColor: colors.lime },
    fanHub: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.greenText },
    ventFrame: { width: 88, height: 84, borderRadius: 12, borderWidth: 3, borderColor: colors.greenText, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'space-around', paddingVertical: 8 },
    ventSlat: { width: 65, height: 11, borderRadius: 5, backgroundColor: colors.greenText },
    visualPlaceholder: { color: colors.muted, fontSize: 28 },
    airflowValueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', alignSelf: 'stretch', gap: 4, marginTop: 13 },
    airflowState: { color: colors.ink, fontFamily: displayFont, fontSize: 17, fontWeight: '800', flexShrink: 1 },
    airflowPercent: { color: colors.greenText, fontFamily: displayFont, fontSize: 19, fontWeight: '800', fontVariant: ['tabular-nums'] },
    airflowBottomRule: { height: 1, backgroundColor: colors.border, marginTop: 17, marginBottom: 11 },
    airflowNote: { color: colors.muted, fontSize: 11, lineHeight: 16 },
    airflowDataState: { color: colors.warningInk, fontSize: 11, marginTop: 5 },
    bridgeSetupLink: { minHeight: 68, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, marginTop: 20, paddingHorizontal: 17, paddingVertical: 12 },
    bridgeSetupPressed: { opacity: 0.78 },
    bridgeSetupCopy: { flex: 1, gap: 3 },
    bridgeSetupTitle: { color: colors.ink, fontFamily: displayFont, fontSize: 18, fontWeight: '800' },
    bridgeSetupHint: { color: colors.muted, fontSize: 12 },
    bridgeSetupArrow: { color: colors.greenText, fontSize: 26, lineHeight: 28, marginLeft: 12 },
  });
}
