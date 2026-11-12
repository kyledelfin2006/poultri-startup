import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDemoSession } from '../../demo-session';
import { SettingsIcon } from '../../tab-icons';
import { ActionButton, airflowLabel, BrandHeader, MetricIcon, Palette, radius, space, Sparkline, StatusMark, type, usePalette } from '../../ui';

export default function HomeScreen() {
  const router = useRouter();
  const palette = usePalette();
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 370 || fontScale >= 1.3;
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { reading, alertRecord, status, sampleAgeMs, stale, samples } = useDemoSession();
  const needsAttention = !!alertRecord && !alertRecord.recovered;
  // From iot: label readings by their source; a local ESP32 drives an on/off fan relay.
  const sourceLabel = reading?.source ?? 'Waiting for sensor data';
  const physicalFan = reading?.source === 'Local ESP32 + DHT22';
  const statusWarning = stale || status.startsWith('Disconnected');
  const setpoint = reading?.setpointC ?? 25;
  const reviewLabel = alertRecord
    ? alertRecord.recovered ? 'Recovered' : alertRecord.acknowledged ? 'Acknowledged' : 'Inspect House 1'
    : 'No inspection needed';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <BrandHeader palette={palette} />
          <Pressable accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/settings')} hitSlop={space.xs} style={({ pressed }) => [styles.gear, pressed && styles.gearPressed]}>
            <SettingsIcon color={palette.greenText} />
          </Pressable>
        </View>
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={styles.title}>House overview</Text>
          <View style={styles.sourceRow}>
            <View style={styles.sourceDot} />
            <Text style={styles.sourceText}>{sourceLabel}</Text>
          </View>
        </View>

        <View
          accessible
          accessibilityLabel={`House 1. ${sourceLabel}. Temperature ${reading ? `${reading.temperatureC.toFixed(1)} degrees Celsius` : 'unavailable'}, humidity ${reading ? `${reading.humidityPct.toFixed(1)} percent` : 'unavailable'}, ${physicalFan ? 'fan relay' : 'simulated fan'} ${reading ? (physicalFan ? (reading.fanSpeedPct ? 'on' : 'off') : `${reading.fanSpeedPct} percent`) : 'unavailable'}. ${status}. ${reviewLabel}.`}
          style={styles.houseCard}
        >
          <View style={styles.cardTop}>
            <Text style={styles.houseTitle}>House 1</Text>
            <View style={[styles.statusPill, statusWarning && styles.statusPillWarning]}>
              <View style={[styles.statusDot, statusWarning ? styles.warningDot : reading ? styles.liveDot : styles.waitingDot]} />
              <Text style={[styles.statusText, statusWarning && styles.statusTextWarning]}>{status}</Text>
            </View>
          </View>
          <View style={styles.primaryMetric}>
            <Text style={[styles.temperature, compact && styles.temperatureCompact]}>
              {reading ? reading.temperatureC.toFixed(1) : '—'}<Text style={styles.temperatureUnit}>{reading ? '°C' : ''}</Text>
            </Text>
            <View style={styles.metricLabelRow}>
              <MetricIcon kind="temperature" color={palette.muted} />
              <Text style={styles.metricLabel}>{reading ? `Current temperature · updated ${Math.floor(sampleAgeMs / 1000)}s ago` : 'Current temperature'}</Text>
            </View>
          </View>
          <View style={styles.trend}>
            <Sparkline values={samples} setpoint={setpoint} barColor={palette.chart} lastColor={palette.ink} lineColor={palette.greenText} />
            <Text style={styles.trendCaption}>
              {samples.length < 2 ? 'Collecting samples' : `Since connecting · dashed line: ${setpoint.toFixed(1)}°C demo setpoint`}
            </Text>
          </View>
          <View style={styles.secondaryMetrics}>
            <View style={styles.secondaryMetric}>
              <View style={styles.metricLabelRow}>
                <MetricIcon kind="humidity" color={palette.muted} />
                <Text style={styles.metricLabel}>Humidity</Text>
              </View>
              <Text style={styles.metricValue}>{reading ? `${reading.humidityPct.toFixed(1)}%` : '—'}</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.secondaryMetric}>
              <Text style={styles.metricLabel}>{physicalFan ? 'Fan relay' : 'Simulated fan'}</Text>
              <Text style={styles.metricValue}>{!reading ? '—' : physicalFan ? (reading.fanSpeedPct ? 'ON' : 'OFF') : `${reading.fanSpeedPct}%`}</Text>
              {reading && !physicalFan && <Text style={styles.metricLabel}>{airflowLabel(reading.fanSpeedPct)} airflow · simulated</Text>}
            </View>
          </View>
          {reading && statusWarning && <Text style={styles.lastKnown}>Last sample {Math.floor(sampleAgeMs / 1000)}s ago · last known values</Text>}
        </View>

        <View style={styles.cta}>
          <ActionButton title="View House 1" onPress={() => router.push('/house-1')} palette={palette} />
        </View>

        <View style={styles.inspection}>
          <Text style={styles.sectionTitle}>Inspection</Text>
          <View style={[styles.inspectionRow, needsAttention && styles.inspectionRowAlert]}>
            <View style={[styles.inspectionIcon, needsAttention && styles.inspectionIconAlert]}>
              <StatusMark kind={needsAttention ? 'alert' : 'check'} color={needsAttention ? palette.alertSurface : palette.greenText} />
            </View>
            <Text style={[styles.inspectionText, needsAttention && styles.inspectionTextAlert]}>{reviewLabel}</Text>
          </View>
          {alertRecord?.recovered && <Text style={styles.inspectionNote}>Kept until Reset session</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.xxl },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    gear: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: colors.greenText, alignItems: 'center', justifyContent: 'center' },
    gearPressed: { backgroundColor: colors.greenSurface },
    heading: { marginTop: space.xl, marginBottom: space.xl, gap: space.xs },
    title: { ...type.title, color: colors.ink },
    sourceRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    sourceDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.greenText },
    sourceText: { ...type.caption, color: colors.greenText, fontWeight: '700' },
    houseCard: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: space.lg },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.sm },
    houseTitle: { ...type.heading, color: colors.ink },
    statusPill: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 32, paddingHorizontal: space.md, borderRadius: radius.pill, backgroundColor: colors.greenSurface, flexShrink: 1 },
    statusPillWarning: { backgroundColor: colors.warningSurface },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    liveDot: { backgroundColor: colors.greenText },
    waitingDot: { backgroundColor: colors.muted },
    warningDot: { backgroundColor: colors.warningInk },
    statusText: { ...type.caption, color: colors.greenText, fontWeight: '700', flexShrink: 1 },
    statusTextWarning: { color: colors.warningInk },
    primaryMetric: { marginTop: space.xl },
    temperature: { ...type.display, color: colors.ink, fontVariant: ['tabular-nums'] },
    temperatureCompact: { fontSize: 58, lineHeight: 68 },
    temperatureUnit: { fontSize: 30, letterSpacing: -0.5, color: colors.greenText },
    metricLabelRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    metricLabel: { ...type.caption, color: colors.muted, flexShrink: 1 },
    trend: { marginTop: space.lg, marginBottom: space.lg, gap: space.sm },
    trendCaption: { ...type.caption, color: colors.muted },
    secondaryMetrics: { flexDirection: 'row', paddingTop: space.lg, borderTopWidth: 1, borderTopColor: colors.border, gap: space.lg },
    secondaryMetric: { flex: 1, minWidth: 0, gap: space.sm },
    verticalDivider: { width: 1, backgroundColor: colors.border },
    metricValue: { ...type.heading, color: colors.ink, fontVariant: ['tabular-nums'] },
    lastKnown: { ...type.caption, color: colors.warningInk, marginTop: space.md },
    cta: { marginTop: space.lg },
    inspection: { marginTop: space.xxl, gap: space.md },
    sectionTitle: { ...type.heading, color: colors.ink },
    inspectionRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.md, borderRadius: radius.control, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    inspectionRowAlert: { backgroundColor: colors.alertSurface, borderColor: colors.alertSurface },
    inspectionIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenSurface },
    inspectionIconAlert: { backgroundColor: colors.warningInk },
    inspectionText: { ...type.body, color: colors.ink, fontWeight: '700', flexShrink: 1 },
    inspectionTextAlert: { color: colors.warningInk },
    inspectionNote: { ...type.caption, color: colors.muted },
  });
}
