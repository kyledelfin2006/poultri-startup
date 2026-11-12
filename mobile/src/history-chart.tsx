import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { bucketize, chartPaths, HistoryPoint } from './history';
import { Palette, space, type } from './ui';

const BUCKETS = 48;
const PLOT_HEIGHT = 150;

function clock(ms: number) {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function HistoryChart({ points, hours, to, setpoint, palette }: { points: HistoryPoint[]; hours: number; to: number; setpoint: number; palette: Palette }) {
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [width, setWidth] = useState(0);
  const from = to - hours * 3_600_000;
  const buckets = bucketize(points, from, to, BUCKETS);
  const present = buckets.filter((value): value is number => value !== null);
  const lo = Math.floor(Math.min(...present, setpoint) - 1);
  const hi = Math.ceil(Math.max(...present, setpoint) + 1);
  const { line, area, last, y } = chartPaths(buckets, width, PLOT_HEIGHT, lo, hi);
  const setpointY = y(setpoint);
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
        <View style={styles.plot} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
          {width > 0 && (
            <Svg width={width} height={PLOT_HEIGHT}>
              {!!area && <Path d={area} fill={palette.chart} fillOpacity={0.22} />}
              <Line x1={0} x2={width} y1={setpointY} y2={setpointY} stroke={palette.greenText} strokeWidth={1} strokeDasharray="4 4" />
              {!!line && <Path d={line} fill="none" stroke={palette.chart} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}
              {last && <Circle cx={last.x} cy={last.y} r={4} fill={palette.ink} stroke={palette.surface} strokeWidth={2} />}
            </Svg>
          )}
          <Text style={[styles.setpointLabel, { top: Math.max(0, setpointY - 18) }]}>Demo setpoint {setpoint.toFixed(1)}°C</Text>
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
    setpointLabel: { position: 'absolute', left: 0, ...type.caption, fontSize: 12, color: colors.greenText, fontWeight: '700', backgroundColor: colors.surface, paddingHorizontal: space.xs },
    xAxis: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 34 + space.sm },
  });
}
