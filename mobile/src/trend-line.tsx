import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Palette, text } from './ui';

const MIN_RANGE_C = 1; // keep small wobbles from filling the full height

export type Segment = { left: number; top: number; length: number; angleRad: number };

// Line segments through `values`, spread across width × height (y grows downward).
export function trendSegments(values: number[], width: number, height: number, thickness = 2): Segment[] {
  if (values.length < 2 || width <= 0 || height <= 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max(0, MIN_RANGE_C - (max - min)) / 2;
  const low = min - pad;
  const range = max - min + pad * 2;
  const inset = thickness / 2;
  const points = values.map((value, i) => ({
    x: (i / (values.length - 1)) * width,
    y: inset + (1 - (value - low) / range) * (height - thickness),
  }));
  return points.slice(1).map((b, i) => {
    const a = points[i];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    return {
      left: (a.x + b.x) / 2 - length / 2,
      top: (a.y + b.y) / 2 - thickness / 2,
      length,
      angleRad: Math.atan2(b.y - a.y, b.x - a.x),
    };
  });
}

// Temperature trend from samples received since connecting. Never synthesizes earlier readings.
export function TrendLine({ values, palette, height = 40 }: { values: number[]; palette: Palette; height?: number }) {
  const [width, setWidth] = useState(0);
  if (values.length < 2) {
    return <Text style={[styles.caption, { color: palette.muted, minHeight: height }]}>Collecting samples</Text>;
  }
  const segments = trendSegments(values, width, height);
  const first = values[0];
  const last = values[values.length - 1];
  return (
    <View
      accessible
      accessibilityLabel={`Temperature trend since connecting, ${values.length} samples, from ${first.toFixed(1)} to ${last.toFixed(1)} degrees Celsius`}
      style={{ height }}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
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
});
