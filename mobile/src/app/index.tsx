import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDemoSession } from '../demo-session';
import { BrandHeader, MetricIcon, Palette, displayCompact, spacing, text, usePalette } from '../ui';

export default function HomeScreen() {
  const router = useRouter();
  const palette = usePalette();
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 370 || fontScale >= 1.3;
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { reading, alertRecord, status, sampleAgeMs, stale } = useDemoSession();
  const needsAttention = !!alertRecord && !alertRecord.recovered;
  const statusWarning = stale || status.startsWith('Disconnected');
  const reviewLabel = alertRecord
    ? alertRecord.recovered ? 'Reading recovered' : alertRecord.acknowledged ? 'Prompt acknowledged' : 'Inspection needed'
    : 'No inspection prompt';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <BrandHeader palette={palette} />
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={styles.title}>Overview</Text>
          <View style={styles.sourceRow}>
            <View style={styles.sourceDot} />
            <Text style={styles.sourceText}>Wokwi simulated data</Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/house-1')}
          accessibilityRole="button"
          accessibilityLabel={`Open House 1. Wokwi simulated data. Temperature ${reading ? `${reading.temperatureC.toFixed(1)} degrees Celsius` : 'unavailable'}, humidity ${reading ? `${reading.humidityPct.toFixed(1)} percent` : 'unavailable'}, simulated fan ${reading ? `${reading.fanSpeedPct} percent` : 'unavailable'}. ${status}. ${reviewLabel}.`}
          style={({ pressed }) => [styles.houseCard, pressed && styles.pressed]}
        >
          <Image source={require('../../assets/house-line.png')} style={styles.houseArt} resizeMode="contain" accessible={false} />
          <View style={styles.cardTop}>
            <Text style={styles.houseTitle}>House 1</Text>
            <View style={styles.openCircle}><Text style={styles.openCircleArrow}>→</Text></View>
          </View>
          <View style={[styles.statusPill, statusWarning && styles.statusPillWarning]}>
            <View style={[styles.statusDot, statusWarning ? styles.warningDot : reading ? styles.liveDot : styles.waitingDot]} />
            <Text style={[styles.statusText, statusWarning && styles.statusTextWarning]}>{status}</Text>
          </View>
          <View style={styles.primaryMetric}>
            <Text style={[styles.temperature, compact && styles.temperatureCompact]} accessibilityLabel={reading ? `Temperature ${reading.temperatureC.toFixed(1)} degrees Celsius` : 'Temperature unavailable'}>
              {reading ? reading.temperatureC.toFixed(1) : '—'}<Text style={styles.temperatureUnit}>{reading ? '°C' : ''}</Text>
            </Text>
            <View style={styles.metricLabelRow}>
              <MetricIcon kind="temperature" color={palette.onForestMuted} />
              <Text style={styles.metricLabel}>Temperature</Text>
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
              <Text style={styles.metricLabel}>Simulated fan</Text>
              <Text style={styles.metricValue}>{reading ? `${reading.fanSpeedPct}%` : '—'}</Text>
            </View>
          </View>
          {reading && statusWarning && <Text style={styles.lastKnown}>Last sample {Math.floor(sampleAgeMs / 1000)}s ago · last known values</Text>}
          <View style={styles.cardFooter}>
            <Text style={styles.openLabel}>Open House 1</Text>
            <Text style={styles.openArrow}>↗</Text>
          </View>
        </Pressable>

        <View style={styles.inspection}>
          <Text style={styles.sectionTitle}>Inspection</Text>
          <View style={styles.inspectionRule} />
          <View style={[styles.inspectionRow, needsAttention && styles.inspectionRowAlert]}>
            <View style={[styles.inspectionIcon, needsAttention && styles.inspectionIconAlert]}>
              <Text style={[styles.inspectionGlyph, needsAttention && styles.inspectionGlyphAlert]}>{needsAttention ? '!' : '✓'}</Text>
            </View>
            <Text style={[styles.inspectionText, needsAttention && styles.inspectionTextAlert]}>{reviewLabel}</Text>
          </View>
          {alertRecord?.recovered && <Text style={styles.inspectionNote}>Prompt retained until reset</Text>}
          <View style={styles.inspectionRule} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
    heading: { marginTop: spacing.xl, marginBottom: spacing.xl, gap: spacing.xs },
    title: { ...text.title, color: colors.ink },
    sourceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    sourceDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.greenText },
    sourceText: { ...text.label, color: colors.greenText },
    houseCard: { position: 'relative', overflow: 'hidden', backgroundColor: colors.forest, borderRadius: 20, padding: spacing.xl },
    pressed: { opacity: 0.84 },
    houseArt: { position: 'absolute', width: 118, height: 82, right: 21, top: 43, tintColor: colors.onForestAccent, opacity: 0.38 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    houseTitle: { ...text.heading, color: colors.onForest },
    openCircle: { width: 35, height: 35, borderWidth: 1, borderColor: colors.onForestAccent, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    openCircleArrow: { ...text.heading, fontWeight: '400', color: colors.onForestAccent },
    statusPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.sm, marginTop: spacing.md, minHeight: 30, paddingHorizontal: spacing.sm, borderRadius: 16, backgroundColor: colors.forestRaised },
    statusPillWarning: { backgroundColor: colors.warningSurface },
    statusDot: { width: 7, height: 7, borderRadius: 4 },
    liveDot: { backgroundColor: colors.onForest },
    waitingDot: { backgroundColor: colors.onForestMuted },
    warningDot: { backgroundColor: colors.warningInk },
    statusText: { ...text.label, color: colors.onForest },
    statusTextWarning: { color: colors.warningInk },
    primaryMetric: { marginTop: spacing.xxl, marginBottom: spacing.lg },
    temperature: { ...text.display, color: colors.onForest },
    temperatureCompact: displayCompact,
    temperatureUnit: { ...text.title, color: colors.onForestAccent },
    metricLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    metricLabel: { ...text.caption, color: colors.onForestMuted },
    cardDivider: { height: 1, backgroundColor: colors.forestLine },
    secondaryMetrics: { flexDirection: 'row', paddingVertical: spacing.lg, gap: spacing.lg },
    secondaryMetric: { flex: 1, minWidth: 0, gap: spacing.sm },
    verticalDivider: { width: 1, backgroundColor: colors.forestLine },
    metricValue: { ...text.heading, color: colors.onForest, fontVariant: ['tabular-nums'] },
    lastKnown: { ...text.caption, color: colors.onForestMuted, marginBottom: spacing.md },
    cardFooter: { borderTopWidth: 1, borderTopColor: colors.forestLine, paddingTop: spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    openLabel: { ...text.body, fontWeight: '800', color: colors.onForestAccent },
    openArrow: { ...text.heading, fontWeight: '400', color: colors.onForestAccent },
    inspection: { marginTop: spacing.xxl },
    sectionTitle: { ...text.heading, color: colors.ink, marginBottom: spacing.lg },
    inspectionRule: { height: 1, backgroundColor: colors.border },
    inspectionRow: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    inspectionRowAlert: { backgroundColor: colors.alertSurface, paddingHorizontal: spacing.md, borderRadius: 10, marginVertical: spacing.sm },
    inspectionIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenSurface },
    inspectionIconAlert: { backgroundColor: colors.warningInk },
    inspectionGlyph: { ...text.body, fontWeight: '700', color: colors.greenText },
    inspectionGlyphAlert: { color: colors.alertSurface },
    inspectionText: { ...text.body, fontWeight: '700', color: colors.ink, flexShrink: 1 },
    inspectionTextAlert: { color: colors.warningInk },
    inspectionNote: { ...text.caption, color: colors.muted, marginBottom: spacing.md },
  });
}
