import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDemoSession } from '../demo-session';
import { BrandHeader, displayFont, MetricIcon, Palette, systemFont, usePalette } from '../ui';

export default function HomeScreen() {
  const router = useRouter();
  const palette = usePalette();
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 370 || fontScale >= 1.3;
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { reading, alertRecord, status, sampleAgeMs, stale } = useDemoSession();
  const needsAttention = !!alertRecord && !alertRecord.recovered;
  const statusWarning = stale || status === 'Not connected' || status.startsWith('Disconnected');
  const physicalFan = reading?.source === 'Local ESP32 + DHT22';
  const fanLabel = physicalFan ? 'Fan relay' : 'Simulated fan';
  const fanValue = !reading ? '—' : physicalFan ? (reading.fanSpeedPct > 0 ? 'ON' : 'OFF') : `${reading.fanSpeedPct}%`;
  const fanSummary = !reading
    ? 'fan unavailable'
    : physicalFan
      ? `fan relay ${reading.fanSpeedPct > 0 ? 'on' : 'off'}`
      : `simulated fan ${reading.fanSpeedPct} percent`;
  const reviewLabel = alertRecord
    ? alertRecord.recovered ? 'Reading recovered' : alertRecord.acknowledged ? 'Prompt acknowledged' : 'Inspection needed'
    : 'No inspection prompt';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <BrandHeader palette={palette} />
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={styles.title}>House overview</Text>
          <Text style={styles.subtitle}>Your poultry house, at a glance.</Text>
        </View>
        <View style={styles.sourceRow}>
          <View style={styles.sourceDot} />
          <Text style={styles.sourceText}>{reading?.source ?? 'Waiting for sensor data'}</Text>
        </View>

        <Pressable
          onPress={() => router.push('/house-1')}
          accessibilityRole="button"
          accessibilityLabel={`Open House 1. ${reading?.source ?? 'Waiting for sensor data'}. Temperature ${reading ? `${reading.temperatureC.toFixed(1)} degrees Celsius` : 'unavailable'}, humidity ${reading ? `${reading.humidityPct.toFixed(1)} percent` : 'unavailable'}, ${fanSummary}. ${status}. ${reviewLabel}.`}
          style={({ pressed }) => [styles.houseCard, pressed && styles.pressed]}
        >
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.cardEyebrow}>POULTRY HOUSE</Text>
              <Text style={styles.houseTitle}>House 1</Text>
            </View>
            <View style={[styles.statusPill, statusWarning && styles.statusPillWarning]}>
              <View style={[styles.statusDot, statusWarning ? styles.warningDot : reading ? styles.liveDot : styles.waitingDot]} />
              <Text style={[styles.statusText, statusWarning && styles.statusTextWarning]}>{status}</Text>
            </View>
          </View>
          <Image source={require('../../assets/house-line.png')} style={styles.houseArt} resizeMode="contain" accessible={false} />
          <View style={[styles.primaryMetric, compact && styles.primaryMetricCompact]}>
            <View style={styles.temperatureBlock}>
              <View style={styles.metricLabelRow}>
                <MetricIcon kind="temperature" color={palette.onForestMuted} />
                <Text style={styles.metricLabel}>Temperature</Text>
              </View>
              <Text style={[styles.temperature, compact && styles.temperatureCompact]} accessibilityLabel={reading ? `Temperature ${reading.temperatureC.toFixed(1)} degrees Celsius` : 'Temperature unavailable'}>
                {reading ? reading.temperatureC.toFixed(1) : '—'}<Text style={styles.temperatureUnit}>{reading ? '°C' : ''}</Text>
              </Text>
            </View>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.secondaryMetrics}>
            <View style={styles.secondaryMetric}>
              <View style={styles.metricLabelRow}>
                <MetricIcon kind="humidity" color={palette.onForestMuted} />
                <Text style={styles.metricLabel}>Humidity</Text>
              </View>
              <Text style={styles.metricValue}>{reading ? `${reading.humidityPct.toFixed(1)}%` : '—'}</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.secondaryMetric}>
              <Text style={styles.metricLabel}>{fanLabel}</Text>
              <Text style={styles.metricValue}>{fanValue}</Text>
            </View>
          </View>
          <Text style={styles.lastKnown}>
            {reading ? `Sample ${Math.floor(sampleAgeMs / 1000)}s ago${statusWarning ? ' · last known values' : ''}` : 'Waiting for the first sensor sample'}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.openLabel}>View house details</Text>
            <Text style={styles.openArrow}>›</Text>
          </View>
        </Pressable>

        <View style={[styles.inspection, needsAttention && styles.inspectionAlert]}>
          <View style={styles.inspectionIcon}>
            <View style={[styles.inspectionDot, needsAttention && styles.inspectionDotAlert]} />
          </View>
          <View style={styles.inspectionCopy}>
            <Text style={styles.sectionTitle}>Inspection</Text>
            <Text style={[styles.inspectionText, needsAttention && styles.inspectionTextAlert]}>{reviewLabel}</Text>
            {alertRecord?.recovered && <Text style={styles.inspectionNote}>Prompt retained until reset</Text>}
          </View>
          <Text style={styles.inspectionArrow}>›</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 16, paddingBottom: 36 },
    heading: { marginTop: 25, marginBottom: 14, gap: 5 },
    title: { color: colors.ink, fontFamily: displayFont, fontSize: 36, fontWeight: '800', letterSpacing: -0.7 },
    subtitle: { color: colors.muted, fontFamily: systemFont, fontSize: 15, lineHeight: 21 },
    sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    sourceDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.lime },
    sourceText: { color: colors.greenText, fontSize: 12, fontWeight: '700', letterSpacing: 0.15 },
    houseCard: { position: 'relative', overflow: 'hidden', backgroundColor: colors.forest, borderRadius: 24, padding: 22, marginTop: 15 },
    pressed: { opacity: 0.9, transform: [{ scale: 0.995 }] },
    houseArt: { position: 'absolute', width: 124, height: 88, right: 20, top: 58, tintColor: colors.onForestAccent, opacity: 0.22 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    cardEyebrow: { color: colors.onForestMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.1 },
    houseTitle: { color: colors.onForest, fontFamily: displayFont, fontSize: 27, fontWeight: '800', letterSpacing: -0.3, marginTop: 3 },
    statusPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 7, minHeight: 32, paddingHorizontal: 11, borderRadius: 18, backgroundColor: colors.forestRaised, maxWidth: '54%' },
    statusPillWarning: { backgroundColor: colors.warningSurface },
    statusDot: { width: 7, height: 7, borderRadius: 4 },
    liveDot: { backgroundColor: colors.onForestAccent },
    waitingDot: { backgroundColor: colors.onForestMuted },
    warningDot: { backgroundColor: colors.warningInk },
    statusText: { color: colors.onForest, fontSize: 12, fontWeight: '700', flexShrink: 1 },
    statusTextWarning: { color: colors.warningInk },
    primaryMetric: { marginTop: 30, marginBottom: 21 },
    primaryMetricCompact: { marginTop: 25 },
    temperatureBlock: { minWidth: 0 },
    temperature: { color: colors.onForest, fontFamily: displayFont, fontSize: 71, lineHeight: 78, fontWeight: '800', letterSpacing: -1.5, fontVariant: ['tabular-nums'], marginTop: 6 },
    temperatureCompact: { fontSize: 62, lineHeight: 68 },
    temperatureUnit: { color: colors.onForestAccent, fontFamily: displayFont, fontSize: 27, letterSpacing: -0.3 },
    metricLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    metricLabel: { color: colors.onForestMuted, fontSize: 13 },
    cardDivider: { height: 1, backgroundColor: colors.forestLine },
    secondaryMetrics: { flexDirection: 'row', paddingVertical: 17, gap: 17 },
    secondaryMetric: { flex: 1, minWidth: 0, gap: 8 },
    verticalDivider: { width: 1, backgroundColor: colors.forestLine },
    metricValue: { color: colors.onForest, fontFamily: displayFont, fontSize: 26, fontWeight: '800', fontVariant: ['tabular-nums'] },
    lastKnown: { color: colors.onForestMuted, fontSize: 12, marginBottom: 14 },
    cardFooter: { borderTopWidth: 1, borderTopColor: colors.forestLine, paddingTop: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    openLabel: { color: colors.onForestAccent, fontSize: 14, fontWeight: '800', letterSpacing: 0.1 },
    openArrow: { color: colors.onForestAccent, fontSize: 26, lineHeight: 28 },
    inspection: { minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 20, padding: 17, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    inspectionAlert: { backgroundColor: colors.alertSurface, borderColor: colors.warningSurface },
    inspectionIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenSurface },
    inspectionDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.greenText },
    inspectionDotAlert: { backgroundColor: colors.warningInk },
    inspectionCopy: { flex: 1, minWidth: 0 },
    sectionTitle: { color: colors.muted, fontFamily: displayFont, fontSize: 14, fontWeight: '800', letterSpacing: 0.35 },
    inspectionText: { color: colors.ink, fontFamily: systemFont, fontSize: 16, fontWeight: '700', flexShrink: 1, marginTop: 3 },
    inspectionTextAlert: { color: colors.warningInk },
    inspectionNote: { color: colors.body, fontSize: 12, marginTop: 4 },
    inspectionArrow: { color: colors.greenText, fontSize: 26, lineHeight: 28 },
  });
}
