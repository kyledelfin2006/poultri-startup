import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDemoSession } from '../demo-session';
import { BrandHeader, Palette, usePalette } from '../ui';

export default function HomeScreen() {
  const router = useRouter();
  const palette = usePalette();
  const { width, fontScale } = useWindowDimensions();
  const stackMetrics = width < 370 || fontScale >= 1.3;
  const { reading, alertRecord, status, statusDescription, sampleAgeMs, stale } = useDemoSession();
  const styles = useMemo(() => createStyles(palette), [palette]);

  const reviewLabel = alertRecord
    ? alertRecord.recovered
      ? 'Reading recovered'
      : alertRecord.acknowledged
        ? 'Prompt acknowledged'
        : 'Inspection prompt active'
    : 'No inspection prompt';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <BrandHeader palette={palette} />
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={styles.title}>House overview</Text>
          <Text style={styles.subtitle}>One house · Wokwi demo</Text>
        </View>

        <Pressable
          onPress={() => router.push('/house-1')}
          accessibilityRole="button"
          accessibilityLabel={`Open Poultri House 1. Temperature ${reading ? `${reading.temperatureC.toFixed(1)} degrees Celsius` : 'unavailable'}, humidity ${reading ? `${reading.humidityPct.toFixed(1)} percent` : 'unavailable'}, simulated fan ${reading ? `${reading.fanSpeedPct} percent` : 'unavailable'}. ${status}. ${reviewLabel}.`}
          style={({ pressed }) => [styles.houseCard, pressed && styles.pressed]}
        >
          <View style={styles.cardHeading}>
            <View style={styles.cardTitleGroup}>
              <Text style={styles.houseTitle}>House 1</Text>
              <Text style={styles.simulationTag}>WOKWI SIMULATION</Text>
            </View>
            <View style={[styles.connectionPill, (stale || status.startsWith('Disconnected')) && styles.connectionPillWarning]}>
              <View style={[styles.connectionDot, stale || status.startsWith('Disconnected') ? styles.warningDot : reading ? styles.connectedDot : styles.idleDot]} />
              <Text style={styles.connectionText}>{status}</Text>
            </View>
          </View>

          <View style={[styles.metrics, stackMetrics && styles.metricsStacked]}>
            <Metric label="Temperature" value={reading ? `${reading.temperatureC.toFixed(1)}°C` : '—'} styles={styles} />
            <View style={[styles.metricDivider, stackMetrics && styles.metricDividerStacked]} />
            <Metric label="Humidity" value={reading ? `${reading.humidityPct.toFixed(1)}%` : '—'} styles={styles} />
            <View style={[styles.metricDivider, stackMetrics && styles.metricDividerStacked]} />
            <Metric label="Simulated fan" value={reading ? `${reading.fanSpeedPct}%` : '—'} styles={styles} />
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.cardMeta}>
              {reading ? `Sample age ${Math.floor(sampleAgeMs / 1000)}s${stale ? ' · stale' : ''}` : statusDescription}
            </Text>
            <Text style={styles.openHouse}>Open House 1</Text>
          </View>

          <View style={[styles.reviewBanner, alertRecord && !alertRecord.recovered && styles.reviewBannerActive, alertRecord?.recovered && styles.reviewBannerRecovered]}>
            <Text style={[styles.reviewText, alertRecord && !alertRecord.recovered && styles.reviewTextActive, alertRecord?.recovered && styles.reviewTextRecovered]}>
              {reviewLabel}
            </Text>
            {alertRecord?.acknowledged && <Text style={styles.reviewDetail}>Acknowledged</Text>}
          </View>
        </Pressable>

        <Text style={styles.footer}>Wokwi simulated data · no physical sensor or farm validation</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value, styles }: { label: string; value: string; styles: ReturnType<typeof createStyles> }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 12, paddingBottom: 30, gap: 22 },
    heading: { gap: 4, marginTop: 10 },
    title: { color: colors.ink, fontSize: 28, fontWeight: '800' },
    subtitle: { color: colors.muted, fontSize: 15, lineHeight: 21 },
    houseCard: { borderRadius: 20, padding: 20, backgroundColor: colors.forest, gap: 18 },
    pressed: { opacity: 0.9 },
    cardHeading: { gap: 12 },
    cardTitleGroup: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
    houseTitle: { color: colors.onForest, fontSize: 24, fontWeight: '800' },
    simulationTag: { color: '#D9F7B7', fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
    connectionPill: { alignSelf: 'flex-start', minHeight: 30, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 10, borderRadius: 20, backgroundColor: '#145C36' },
    connectionPillWarning: { backgroundColor: '#674D16' },
    connectionDot: { width: 8, height: 8, borderRadius: 4 },
    connectedDot: { backgroundColor: '#A6EF54' },
    warningDot: { backgroundColor: '#FFD34C' },
    idleDot: { backgroundColor: '#D9E8DC' },
    connectionText: { color: colors.onForest, fontSize: 12, fontWeight: '700', flexShrink: 1 },
    metrics: { flexDirection: 'row', alignItems: 'stretch', gap: 10 },
    metricsStacked: { flexDirection: 'column' },
    metric: { flex: 1, minWidth: 0, gap: 6, paddingVertical: 7 },
    metricLabel: { color: '#D6E9D9', fontSize: 12, fontWeight: '600' },
    metricValue: { color: '#B6F36C', fontSize: 25, fontWeight: '800', fontVariant: ['tabular-nums'] },
    metricDivider: { width: 1, backgroundColor: '#3E7654' },
    metricDividerStacked: { width: '100%', height: 1 },
    cardFooter: { gap: 8, borderTopWidth: 1, borderTopColor: '#3E7654', paddingTop: 14 },
    cardMeta: { color: '#E0EBE1', fontSize: 13, lineHeight: 19 },
    openHouse: { color: '#B6F36C', fontSize: 14, fontWeight: '800' },
    reviewBanner: { padding: 12, borderRadius: 12, backgroundColor: '#145C36', gap: 3 },
    reviewBannerActive: { backgroundColor: '#FFF0ED' },
    reviewBannerRecovered: { backgroundColor: '#EAF6E7' },
    reviewText: { color: '#DFF2D9', fontSize: 14, fontWeight: '800' },
    reviewTextActive: { color: '#B83228' },
    reviewTextRecovered: { color: '#245D31' },
    reviewDetail: { color: '#596B5E', fontSize: 12 },
    footer: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  });
}
