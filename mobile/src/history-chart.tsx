import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { bucketize, HistoryPoint } from './history';
import { Palette, space, type } from './ui';

const BUCKETS = 48;
const PLOT_HEIGHT = 150;

function clock(ms: number) {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Bar chart of bucketed averages. Drawn from Views so no chart or SVG package is needed.
export function HistoryChart({ points, hours, to, setpoint, palette }: { points: HistoryPoint[]; hours: number; to: number; setpoint: number; palette: Palette }) {
  const styles = useMemo(() => createStyles(palette), [palette]);
  const from = to - hours * 3_600_000;
  const buckets = bucketize(points, from, to, BUCKETS);
  const present = buckets.filter((value): value is number => value !== null);
  const lo = Math.floor(Math.min(...present, setpoint) - 1);
  const hi = Math.ceil(Math.max(...present, setpoint) + 1);
  const pos = (value: number) => ((value - lo) / (hi - lo)) * PLOT_HEIGHT;
  const lastIndex = buckets.reduce((last, value, index) => (value === null ? last : index), -1);
  const label = present.length
    ? `Temperature over the last ${hours} hours, from ${Math.min(...present).toFixed(1)} to ${Math.max(...present).toFixed(1)} degrees Celsius. Demo setpoint ${setpoint.toFixed(1)} degrees.`
    : `No temperature data in the last ${hours} hours.`;

  return (
    <View accessible accessibilityLabel={label} style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.yAxis}>
          {[hi, Math.round((hi + lo) / 2), lo].map((tick) => (
            <Text key={tick} style={styles.tick}>{tick}°</Text>
          ))}
        </View>
        <View style={styles.plot}>
          <View style={styles.bars}>
            {buckets.map((value, index) => (
              <View key={index} style={[styles.bar, { height: value === null ? 0 : Math.max(3, pos(value)), backgroundColor: index === lastIndex ? palette.ink : palette.chart }]} />
            ))}
          </View>
          <View style={[styles.setpointLine, { bottom: pos(setpoint) }]} />
          <Text style={[styles.setpointLabel, { bottom: pos(setpoint) + 2 }]}>Demo setpoint {setpoint.toFixed(1)}°C</Text>
        </View>
      </View>
      <View style={styles.xAxis}>
        <Text style={styles.tick}>{clock(from)}</Text>
        <Text style={styles.tick}>{clock((from + to) / 2)}</Text>
        <Text style={styles.tick}>Now</Text>
      </View>
    </View>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    wrap: { gap: space.sm },
    row: { flexDirection: 'row', gap: space.sm },
    yAxis: { height: PLOT_HEIGHT, justifyContent: 'space-between', alignItems: 'flex-end', width: 34 },
    tick: { ...type.caption, fontSize: 12, color: colors.muted, fontVariant: ['tabular-nums'] },
    plot: { flex: 1, height: PLOT_HEIGHT, borderBottomWidth: 1, borderBottomColor: colors.border },
    bars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
    bar: { flex: 1, borderRadius: 2 },
    setpointLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderStyle: 'dashed', borderColor: colors.greenText },
    setpointLabel: { position: 'absolute', left: 0, ...type.caption, fontSize: 12, color: colors.greenText, fontWeight: '700', backgroundColor: colors.surface, paddingHorizontal: space.xs },
    xAxis: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 34 + space.sm },
  });
}
