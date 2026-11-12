import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import type { MarkKind } from './house-state';
import { darkPalette, lightPalette, type Palette } from './palette';

export type { Palette };

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { card: 16, control: 12, pill: 999 } as const;

// Rounded sans for display, title, and heading. Loaded in app/_layout.tsx; body text stays the system font.
// The font file carries the weight, so these styles set no fontWeight (avoids faux bold).
export const ROUNDED_FONT = 'Nunito_800ExtraBold';

export const type = {
  display: { fontFamily: ROUNDED_FONT, fontSize: 72, lineHeight: 80, letterSpacing: -2.5 },
  title: { fontFamily: ROUNDED_FONT, fontSize: 34, lineHeight: 40, letterSpacing: -1 },
  heading: { fontFamily: ROUNDED_FONT, fontSize: 20, lineHeight: 26 },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' as const },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '700' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
} as const;

// Derived from the simulated fan percentage; no separate airflow measurement exists.
export function airflowLabel(fanSpeedPct: number) {
  return fanSpeedPct === 0 ? 'Still' : fanSpeedPct < 75 ? 'Moderate' : 'Strong';
}

export function usePalette() {
  return useColorScheme() === 'dark' ? darkPalette : lightPalette;
}

export function BrandHeader({ palette }: { palette: Palette }) {
  return (
    <View style={[styles.brand, { backgroundColor: palette.background === lightPalette.background ? 'transparent' : lightPalette.background }]}>
      <Image
        source={require('../assets/poultri-logo.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Official Poultri logo"
      />
      <Image
        source={require('../assets/poultri-wordmark.png')}
        style={styles.wordmark}
        resizeMode="contain"
        accessibilityLabel="Poultri wordmark"
      />
    </View>
  );
}

export function MetricIcon({ kind, color }: { kind: 'temperature' | 'humidity'; color: string }) {
  return <Image source={kind === 'temperature' ? require('../assets/temperature-icon.png') : require('../assets/humidity-icon.png')} style={[styles.metricIcon, { tintColor: color }]} resizeMode="contain" accessible={false} />;
}

// Icons come from Ionicons (@expo/vector-icons). They are decorative; the surrounding control carries the label.
export function Chevron({ color, size = 9, direction = 'right' }: { color: string; size?: number; direction?: 'right' | 'left' }) {
  return <Ionicons name={direction === 'right' ? 'chevron-forward' : 'chevron-back'} size={size * 2} color={color} accessible={false} />;
}

export function StatusMark({ kind, color }: { kind: MarkKind; color: string }) {
  if (kind === 'alert2') {
    return (
      <View accessible={false} style={{ flexDirection: 'row' }}>
        <Ionicons name="alert" size={14} color={color} accessible={false} />
        <Ionicons name="alert" size={14} color={color} accessible={false} />
      </View>
    );
  }
  return <Ionicons name={kind === 'check' ? 'checkmark' : kind === 'dash' ? 'remove' : 'alert'} size={16} color={color} accessible={false} />;
}

// Bars from session samples. Hidden from screen readers; callers add a text caption.
export function Sparkline({ values, setpoint, barColor, lastColor, lineColor, height = 56 }: { values: number[]; setpoint: number; barColor: string; lastColor: string; lineColor: string; height?: number }) {
  if (values.length < 2) return null;
  const lo = Math.min(...values, setpoint) - 0.5;
  const hi = Math.max(...values, setpoint) + 0.5;
  const pos = (v: number) => ((v - lo) / (hi - lo)) * height;
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants" style={{ height, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
      {values.map((v, i) => (
        <View key={i} style={{ flex: 1, maxWidth: 4, height: Math.max(3, pos(v)), borderRadius: 2, backgroundColor: i === values.length - 1 ? lastColor : barColor }} />
      ))}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: pos(setpoint), borderTopWidth: 1, borderStyle: 'dashed', borderColor: lineColor }} />
    </View>
  );
}

export function ActionButton({
  title,
  onPress,
  palette,
  disabled = false,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  palette: Palette;
  disabled?: boolean;
  secondary?: boolean;
}) {
  const componentStyles = StyleSheet.create({
    button: {
      minHeight: 52,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: space.xl,
      backgroundColor: secondary ? 'transparent' : palette.lime,
      borderWidth: secondary ? 1.5 : 0,
      borderColor: palette.greenText,
      opacity: disabled ? 0.5 : 1,
    },
    text: { color: secondary ? palette.greenText : palette.onLime, ...type.label },
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={space.xs}
      style={({ pressed }) => [componentStyles.button, pressed && !disabled && { backgroundColor: secondary ? palette.greenSurface : palette.limePressed }]}
    >
      <Text style={componentStyles.text}>{title}</Text>
    </Pressable>
  );
}

export function SectionTitle({ children, palette }: { children: string; palette: Palette }) {
  return <Text style={[type.heading, { color: palette.ink }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space.sm,
    minHeight: 48,
    borderRadius: radius.control,
  },
  logo: { width: 38, height: 38 },
  wordmark: { width: 112, height: 42 },
  metricIcon: { width: 16, height: 16 },
});
