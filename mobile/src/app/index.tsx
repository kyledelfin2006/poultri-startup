import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDemoSession } from '../demo-session';
import { TrendLine } from '../trend-line';
import { BrandHeader, Palette, displayCompact, radius, spacing, text, usePalette } from '../ui';

export default function HomeScreen() {
  const router = useRouter();
  const palette = usePalette();
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 370 || fontScale >= 1.3;
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { reading, samples, alertRecord, status, sampleAgeMs, stale } = useDemoSession();
  // App-only vent state; follows the simulated fan percentage, as on House 1.
  const fan = reading?.fanSpeedPct;
  const setpointC = reading?.setpointC ?? 25; // firmware's demo setpoint; same fallback as House 1
  const ventState = fan === undefined ? '—' : fan === 0 ? 'Closed' : fan === 50 ? 'Half-open' : fan === 100 ? 'Open' : 'Partly open';
  const needsAttention = !!alertRecord && !alertRecord.recovered;
  const statusWarning = stale || status.startsWith('Disconnected');
  const reviewLabel = alertRecord
    ? alertRecord.recovered ? 'Reading recovered' : alertRecord.acknowledged ? 'Prompt acknowledged' : 'Inspection needed'
    : 'No inspection prompt';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <BrandHeader palette={palette} />
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            accessibilityHint="Opens the bridge connection settings."
            style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsButtonPressed]}
          >
            {/* Sliders icon drawn with views; an icon package needs approval (agents.md). */}
            <View style={styles.slidersIcon} accessible={false}>
              {[5, 13, 8].map((knobLeft) => (
                <View key={knobLeft} style={styles.sliderTrack}>
                  <View style={[styles.sliderKnob, { left: knobLeft }]} />
                </View>
              ))}
            </View>
          </Pressable>
        </View>
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={styles.title}>House overview</Text>
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
          <View style={styles.cardTop}>
            <Text style={styles.houseLabel}>HOUSE 1</Text>
            <Text style={styles.updated}>{reading ? `Updated ${Math.floor(sampleAgeMs / 1000)}s ago` : 'No readings yet'}</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, statusWarning ? styles.warningDot : reading ? styles.liveDot : styles.waitingDot]} />
            <Text style={[styles.statusText, statusWarning && styles.statusTextWarning]}>{status}</Text>
          </View>
          <Text style={[styles.temperature, compact && styles.temperatureCompact]} accessibilityLabel={reading ? `Temperature ${reading.temperatureC.toFixed(1)} degrees Celsius` : 'Temperature unavailable'}>
            {reading ? reading.temperatureC.toFixed(1) : '—'}<Text style={styles.temperatureUnit}>{reading ? '°C' : ''}</Text>
          </Text>
          <Text style={styles.metricLabel}>Current temperature</Text>
          <View style={styles.trend}>
            <TrendLine values={samples} palette={palette} setpoint={setpointC} />
            {samples.length >= 2 && (
              <View style={styles.trendLegend}>
                <Text style={styles.metricLabel}>Since connecting</Text>
                <View style={styles.setpointLegend}>
                  <View style={styles.legendDashes}>
                    <View style={styles.legendDash} />
                    <View style={styles.legendDash} />
                  </View>
                  <Text style={styles.metricLabel}>Demo setpoint {+setpointC.toFixed(1)}°C</Text>
                </View>
              </View>
            )}
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.secondaryMetrics}>
            <View style={styles.secondaryMetric}>
              <Text style={styles.metricLabel}>Simulated fan</Text>
              <Text style={styles.metricValue}>{reading ? `${reading.fanSpeedPct}%` : '—'}</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.secondaryMetric}>
              <Text style={styles.metricLabel}>Simulated airflow</Text>
              <Text style={styles.metricValue}>{ventState}</Text>
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
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
    settingsButton: { width: 44, height: 44, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.inputBorder, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
    settingsButtonPressed: { backgroundColor: colors.greenSurface },
    slidersIcon: { width: 20, height: 18, justifyContent: 'space-between' },
    sliderTrack: { height: 2, borderRadius: radius.pill, backgroundColor: colors.ink, justifyContent: 'center' },
    sliderKnob: { position: 'absolute', width: 6, height: 6, marginTop: -2, borderRadius: radius.pill, borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.surface },
    heading: { marginTop: spacing.xl, marginBottom: spacing.xl, gap: spacing.xs },
    title: { ...text.title, color: colors.ink },
    sourceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    sourceDot: { width: 7, height: 7, borderRadius: radius.pill, backgroundColor: colors.greenText },
    sourceText: { ...text.label, color: colors.greenText },
    houseCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: spacing.xl },
    pressed: { opacity: 0.84 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: spacing.sm },
    houseLabel: { ...text.label, color: colors.ink },
    updated: { ...text.caption, color: colors.muted, flexShrink: 1, textAlign: 'right' },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.lg },
    statusDot: { width: 7, height: 7, borderRadius: radius.pill },
    liveDot: { backgroundColor: colors.greenText },
    waitingDot: { backgroundColor: colors.muted },
    warningDot: { backgroundColor: colors.warningInk },
    statusText: { ...text.label, color: colors.ink },
    statusTextWarning: { color: colors.warningInk },
    trend: { marginTop: spacing.lg, marginBottom: spacing.lg, gap: spacing.xs },
    trendLegend: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
    setpointLegend: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    legendDashes: { flexDirection: 'row', gap: spacing.xs },
    legendDash: { width: 4, height: 1, backgroundColor: colors.muted },
    temperature: { ...text.display, color: colors.ink },
    temperatureCompact: displayCompact,
    temperatureUnit: { ...text.title, color: colors.greenText },
    metricLabel: { ...text.caption, color: colors.muted },
    cardDivider: { height: 1, backgroundColor: colors.border },
    secondaryMetrics: { flexDirection: 'row', paddingVertical: spacing.lg, gap: spacing.lg },
    secondaryMetric: { flex: 1, minWidth: 0, gap: spacing.sm },
    verticalDivider: { width: 1, backgroundColor: colors.border },
    metricValue: { ...text.heading, color: colors.ink, fontVariant: ['tabular-nums'] },
    lastKnown: { ...text.caption, color: colors.muted, marginBottom: spacing.md },
    cardFooter: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    openLabel: { ...text.body, fontWeight: '800', color: colors.greenText },
    openArrow: { ...text.heading, fontWeight: '400', color: colors.greenText },
    inspection: { marginTop: spacing.xxl },
    sectionTitle: { ...text.heading, color: colors.ink, marginBottom: spacing.lg },
    inspectionRule: { height: 1, backgroundColor: colors.border },
    inspectionRow: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    inspectionRowAlert: { backgroundColor: colors.alertSurface, paddingHorizontal: spacing.md, borderRadius: radius.card, marginVertical: spacing.sm },
    inspectionIcon: { width: 28, height: 28, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenSurface },
    inspectionIconAlert: { backgroundColor: colors.warningInk },
    inspectionGlyph: { ...text.body, fontWeight: '700', color: colors.greenText },
    inspectionGlyphAlert: { color: colors.alertSurface },
    inspectionText: { ...text.body, fontWeight: '700', color: colors.ink, flexShrink: 1 },
    inspectionTextAlert: { color: colors.warningInk },
    inspectionNote: { ...text.caption, color: colors.muted, marginBottom: spacing.md },
  });
}
