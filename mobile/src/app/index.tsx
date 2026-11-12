import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDemoSession } from '../demo-session';
import { TrendLine } from '../trend-line';
import { ActionButton, BrandHeader, Palette, displayCompact, radius, spacing, text, usePalette } from '../ui';

export default function HomeScreen() {
  const router = useRouter();
  const palette = usePalette();
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 370 || fontScale >= 1.3;
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { reading, samples, alertRecord, status, sampleAgeMs, stale } = useDemoSession();
  const fan = reading?.fanSpeedPct;
  const setpointC = reading?.setpointC ?? 25; // firmware's demo setpoint; same fallback as House 1
  // One vocabulary for the inspection state; acknowledging happens on House 1 only.
  const inspection = !alertRecord ? 'clear' : alertRecord.recovered ? 'recovered' : alertRecord.acknowledged ? 'acknowledged' : 'inspect';
  const reviewLabel = { clear: 'No inspection needed', inspect: 'Inspect House 1', acknowledged: 'Acknowledged', recovered: 'Reading recovered' }[inspection];
  const setpointText = `${+setpointC.toFixed(1)}°C`;
  const inspectionHelp = {
    // Kept to one line at phone width.
    clear: `Prompts appear at the ${setpointText} demo setpoint.`,
    inspect: `Reached ${setpointText}. Acknowledge it on House 1.`,
    acknowledged: `Still at or above ${setpointText}.`,
    recovered: `Below ${setpointText}. Clears with Reset session.`,
  }[inspection];
  const warm = inspection === 'inspect' || inspection === 'acknowledged'; // still at or above the setpoint
  // App-only vent state; follows the simulated fan percentage, as on House 1.
  const ventState = fan === undefined ? '—' : fan === 0 ? 'Closed' : fan === 50 ? 'Half-open' : fan === 100 ? 'Open' : 'Partly open';
  const statusWarning = stale || status.startsWith('Disconnected');

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

        <View style={styles.houseCard}>
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
          <ActionButton
            title="View House 1"
            onPress={() => router.push('/house-1')}
            palette={palette}
            primary
            chevron
            accessibilityLabel={`View House 1. Wokwi simulated data. Temperature ${reading ? `${reading.temperatureC.toFixed(1)} degrees Celsius` : 'unavailable'}, humidity ${reading ? `${reading.humidityPct.toFixed(1)} percent` : 'unavailable'}, simulated fan ${reading ? `${reading.fanSpeedPct} percent` : 'unavailable'}. ${status}. ${reviewLabel}.`}
          />
        </View>

        <View
          style={[styles.inspectionCard, inspection === 'inspect' && styles.inspectionCardAlert]}
          accessible
          accessibilityLabel={`Inspection. ${reviewLabel}. ${inspectionHelp}`}
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.houseLabel}>INSPECTION</Text>
          <View style={styles.inspectionRow}>
            <View style={[styles.inspectionIcon, warm && styles.inspectionIconAlert]}>
              <Text style={[styles.inspectionGlyph, warm && styles.inspectionGlyphAlert]}>{inspection === 'inspect' ? '!' : '✓'}</Text>
            </View>
            <Text style={[styles.inspectionText, inspection === 'inspect' && styles.inspectionTextAlert]}>{reviewLabel}</Text>
          </View>
          <Text style={[styles.inspectionHelp, inspection === 'inspect' && styles.inspectionTextAlert]}>{inspectionHelp}</Text>
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
    inspectionCard: { marginTop: spacing.xxl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: spacing.lg, gap: spacing.sm },
    inspectionCardAlert: { backgroundColor: colors.alertSurface, borderColor: colors.alertSurface },
    inspectionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    inspectionIcon: { width: 28, height: 28, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenSurface },
    inspectionIconAlert: { backgroundColor: colors.warningInk },
    inspectionGlyph: { ...text.body, fontWeight: '700', color: colors.greenText },
    inspectionGlyphAlert: { color: colors.alertSurface },
    inspectionText: { ...text.body, fontWeight: '700', color: colors.ink, flexShrink: 1 },
    inspectionTextAlert: { color: colors.warningInk },
    inspectionHelp: { ...text.caption, color: colors.muted },
  });
}
