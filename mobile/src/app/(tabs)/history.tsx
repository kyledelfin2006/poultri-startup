import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDemoSession } from '../../demo-session';
import { summarize } from '../../history';
import { HistoryChart } from '../../history-chart';
import { useHistory } from '../../use-history';
import { ActionButton, Chevron, Palette, radius, space, type, usePalette } from '../../ui';

const RANGES = [6, 12, 24] as const;

export default function HistoryScreen() {
  const router = useRouter();
  const palette = usePalette();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { activeUrl, reading } = useDemoSession();
  const [hours, setHours] = useState<number>(24);
  const [now, setNow] = useState(Date.now);
  const { points, error, loaded } = useHistory(activeUrl, hours);
  const setpoint = reading?.setpointC ?? 25;
  const summary = summarize(points, setpoint);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(timer);
  }, []);

  const stat = (label: string, value: number | undefined) => (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value === undefined ? '—' : `${value.toFixed(1)}°C`}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={styles.title}>Temperature history</Text>
          <Text style={styles.sub}>House 1 · Wokwi simulated data</Text>
        </View>

        <View accessibilityRole="tablist" style={styles.segment}>
          {RANGES.map((range) => {
            const selected = range === hours;
            return (
              <Pressable
                key={range}
                accessibilityRole="tab"
                accessibilityLabel={`${range} hours`}
                accessibilityState={{ selected }}
                onPress={() => setHours(range)}
                style={[styles.segmentItem, selected && styles.segmentItemSelected]}
              >
                <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{range}h</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Last {hours} hours</Text>
          {!!summary?.replayed && (
            <View style={styles.replay} accessible accessibilityLabel={`Includes replayed sample data. ${summary.replayed} of ${summary.count} points come from the replay script, not this Wokwi run. All data is simulated.`}>
              <Text style={styles.replayTitle}>Includes replayed sample data</Text>
              <Text style={styles.replayText}>{summary.replayed} of {summary.count} points come from the replay script, not this Wokwi run. All data is simulated.</Text>
            </View>
          )}
          {!activeUrl ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Connect to the bridge to load recorded history.</Text>
              <ActionButton title="Open settings" onPress={() => router.push('/settings')} palette={palette} />
            </View>
          ) : points.length === 0 ? (
            <Text style={styles.emptyText}>
              {error && !loaded ? `Could not load history: ${error}` : 'No history yet. The bridge records one point every 10 seconds while the simulation runs.'}
            </Text>
          ) : (
            <>
              <Text style={styles.latest}>{summary?.latest.toFixed(1)}<Text style={styles.latestUnit}>°C</Text></Text>
              <Text style={styles.sub}>Latest sample</Text>
              <View style={styles.chart}>
                <HistoryChart points={points} hours={hours} to={now} setpoint={setpoint} palette={palette} />
              </View>
            </>
          )}
        </View>

        <View style={styles.stats}>
          {stat('Min', summary?.min)}
          {stat('Average', summary?.avg)}
          {stat('Max', summary?.max)}
        </View>

        <Text style={styles.note}>Recorded by the bridge, one point every 10 seconds. History clears when the bridge restarts.</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ask Buddy about this trend"
          onPress={() => router.push({ pathname: '/buddy', params: { q: `Summarize the last ${hours} hours`, h: String(hours), n: String(Date.now()) } })}
          style={({ pressed }) => [styles.ask, pressed && styles.askPressed]}
        >
          <Text style={styles.askText}>Ask Buddy about this trend</Text>
          <Chevron color={palette.greenText} size={9} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.xxl, gap: space.lg },
    heading: { gap: space.xs, marginTop: space.sm },
    title: { ...type.title, color: colors.ink },
    sub: { ...type.caption, color: colors.muted },
    segment: { flexDirection: 'row', backgroundColor: colors.greenSurface, borderRadius: radius.pill, padding: space.xs },
    segmentItem: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
    segmentItemSelected: { backgroundColor: colors.lime },
    segmentText: { ...type.label, color: colors.greenText },
    segmentTextSelected: { color: colors.onLime },
    card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: space.lg, gap: space.sm },
    cardLabel: { ...type.label, color: colors.ink },
    replay: { backgroundColor: colors.warningSurface, borderRadius: radius.control, padding: space.md, gap: space.xs },
    replayTitle: { ...type.label, color: colors.warningInk },
    replayText: { ...type.caption, color: colors.warningInk },
    latest: { ...type.title, fontSize: 44, lineHeight: 50, color: colors.ink, fontVariant: ['tabular-nums'] },
    latestUnit: { fontSize: 22, color: colors.greenText },
    chart: { marginTop: space.md },
    empty: { gap: space.md },
    emptyText: { ...type.body, color: colors.body },
    stats: { flexDirection: 'row', gap: space.md },
    stat: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.control, borderWidth: 1, borderColor: colors.border, padding: space.md, gap: space.xs },
    statLabel: { ...type.caption, color: colors.muted },
    statValue: { ...type.label, fontSize: 17, color: colors.ink, fontVariant: ['tabular-nums'] },
    note: { ...type.caption, color: colors.muted },
    ask: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, borderRadius: radius.card, backgroundColor: colors.greenSurface },
    askPressed: { backgroundColor: colors.border },
    askText: { ...type.label, color: colors.greenText },
  });
}
