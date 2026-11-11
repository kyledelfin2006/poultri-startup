import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Palette, text } from './ui';

const MIN_RANGE_C = 1; // keep small wobbles from filling the full height
const DASH = 4;
const DASH_GAP = 4;

export type Segment = { left: number; top: number; length: number; angleRad: number };
export type TrendGeometry = { segments: Segment[]; referenceY: number | null };

// Line segments through `values`, spread across width × height (y grows downward).
// `reference` (the setpoint) is included in the vertical range so its line always fits.
export function trendGeometry(values: number[], width: number, height: number, reference?: number, thickness = 2): TrendGeometry {
  if (values.length < 2 || width <= 0 || height <= 0) return { segments: [], referenceY: null };
  const scaled = reference === undefined ? values : [...values, reference];
  const min = Math.min(...scaled);
  const max = Math.max(...scaled);
  const pad = Math.max(0, MIN_RANGE_C - (max - min)) / 2;
  const low = min - pad;
  const range = max - min + pad * 2;
  const inset = thickness / 2;
  const toY = (value: number) => inset + (1 - (value - low) / range) * (height - thickness);
  const points = values.map((value, i) => ({ x: (i / (values.length - 1)) * width, y: toY(value) }));
  const segments = points.slice(1).map((b, i) => {
    const a = points[i];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    return {
      left: (a.x + b.x) / 2 - length / 2,
      top: (a.y + b.y) / 2 - thickness / 2,
      length,
      angleRad: Math.atan2(b.y - a.y, b.x - a.x),
    };
  });
  return { segments, referenceY: reference === undefined ? null : toY(reference) };
}

// Temperature trend from samples received since connecting. Never synthesizes earlier readings.
// The dashed setpoint line is drawn only when the trend itself has data.
export function TrendLine({ values, palette, setpoint, height = 40 }: { values: number[]; palette: Palette; setpoint?: number; height?: number }) {
  const [width, setWidth] = useState(0);
  if (values.length < 2) {
    return <Text style={[styles.caption, { color: palette.muted, minHeight: height }]}>Collecting samples</Text>;
  }
  const { segments, referenceY } = trendGeometry(values, width, height, setpoint);
  const first = values[0];
  const last = values[values.length - 1];
  const dashCount = Math.floor((width + DASH_GAP) / (DASH + DASH_GAP));
  const setpointText = setpoint === undefined ? '' : `, demo setpoint ${setpoint.toFixed(1)} degrees Celsius`;
  return (
    <View
      accessible
      accessibilityLabel={`Temperature trend since connecting, ${values.length} samples, from ${first.toFixed(1)} to ${last.toFixed(1)} degrees Celsius${setpointText}`}
      style={{ height }}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {referenceY !== null && Array.from({ length: dashCount }, (_, i) => (
        <View key={`dash-${i}`} style={[styles.dash, { left: i * (DASH + DASH_GAP), top: referenceY - 0.5, backgroundColor: palette.muted }]} />
      ))}
      {segments.map((s, i) => (
        <View
          key={i}
          style={[styles.segment, { left: s.left, top: s.top, width: s.length, backgroundColor: palette.greenText, transform: [{ rotate: `${s.angleRad}rad` }] }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  caption: { ...text.caption },
  segment: { position: 'absolute', height: 2, borderRadius: 1 },
  dash: { position: 'absolute', width: DASH, height: 1 },
});
