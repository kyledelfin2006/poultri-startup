import { Image, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

export type Palette = {
  background: string;
  surface: string;
  ink: string;
  body: string;
  muted: string;
  quiet: string;
  border: string;
  greenText: string;
  chart: string;
  lime: string;
  limePressed: string;
  onLime: string;
  alertSurface: string;
  greenSurface: string;
  inputBorder: string;
  onForest: string;
  onForestMuted: string;
  onForestAccent: string;
  forest: string;
  forestLine: string;
  warningSurface: string;
  warningInk: string;
  danger: string;
  focus: string;
};

// Text pairs were checked for WCAG contrast: body text 4.5:1 or higher, large text 3:1 or higher.
const lightPalette: Palette = {
  background: '#EEF4E7',
  surface: '#FFFFFF',
  ink: '#0F2E1F',
  body: '#1F3A2C',
  muted: '#4A6252',
  quiet: '#56695C',
  border: '#B9CBB4',
  greenText: '#2C5A3D',
  chart: '#5E8F3A',
  lime: '#C4EA3F',
  limePressed: '#AAD532',
  onLime: '#1B3A2A',
  alertSurface: '#F6DCC8',
  greenSurface: '#DDEBD0',
  inputBorder: '#7E9A84',
  onForest: '#F5F8F0',
  onForestMuted: '#C9DCC4',
  onForestAccent: '#C6EC7A',
  forest: '#1B3A2A',
  forestLine: '#3E5E4A',
  warningSurface: '#F6DCC8',
  warningInk: '#6B3424',
  danger: '#8A3B2A',
  focus: '#1B3A2A',
};

const darkPalette: Palette = {
  background: '#14231B',
  surface: '#1F3327',
  ink: '#F1F6EC',
  body: '#E0EADB',
  muted: '#B6C9B4',
  quiet: '#A3B8A2',
  border: '#4C6553',
  greenText: '#CFE8AE',
  chart: '#C4EA3F',
  lime: '#C4EA3F',
  limePressed: '#AAD532',
  onLime: '#1B3A2A',
  alertSurface: '#4F3428',
  greenSurface: '#2A4433',
  inputBorder: '#7E9A84',
  onForest: '#F5F8F0',
  onForestMuted: '#C9DCC4',
  onForestAccent: '#C6EC7A',
  forest: '#1B3A2A',
  forestLine: '#3E5E4A',
  warningSurface: '#4F3428',
  warningInk: '#FFD9C2',
  danger: '#F2B8A4',
  focus: '#C6EC7A',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { card: 16, control: 12, pill: 999 } as const;

export const type = {
  display: { fontSize: 72, lineHeight: 80, fontWeight: '800' as const, letterSpacing: -2.5 },
  title: { fontSize: 34, lineHeight: 40, fontWeight: '800' as const, letterSpacing: -1 },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '800' as const },
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

// Icons drawn from borders and bars so no icon package is needed.
export function Chevron({ color, size = 9, direction = 'right' }: { color: string; size?: number; direction?: 'right' | 'left' }) {
  const rotate = direction === 'right' ? '45deg' : '225deg';
  return (
    <View
      accessible={false}
      style={{ width: size, height: size, borderTopWidth: 2, borderRightWidth: 2, borderColor: color, transform: [{ rotate }] }}
    />
  );
}

export function StatusMark({ kind, color }: { kind: 'check' | 'alert'; color: string }) {
  if (kind === 'check') {
    return <View accessible={false} style={{ width: 7, height: 12, marginTop: -3, borderRightWidth: 2.5, borderBottomWidth: 2.5, borderColor: color, transform: [{ rotate: '45deg' }] }} />;
  }
  return (
    <View accessible={false} style={{ alignItems: 'center', gap: 2 }}>
      <View style={{ width: 3, height: 10, borderRadius: 2, backgroundColor: color }} />
      <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: color }} />
    </View>
  );
}

// Bars from session samples. Hidden from screen readers; callers add a text caption.
export function Sparkline({ values, setpoint, barColor, lastColor, lineColor, height = 56 }: { values: number[]; setpoint: number; barColor: string; lastColor: string; lineColor: string; height?: number }) {
  if (values.length < 2) return null;
  const lo = Math.min(...values, setpoint) - 0.5;
  const hi = Math.max(...values, setpoint) + 0.5;
  const pos = (v: number) => ((v - lo) / (hi - lo)) * height;
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants" style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
      {values.map((v, i) => (
        <View key={i} style={{ flex: 1, height: Math.max(3, pos(v)), borderRadius: 2, backgroundColor: i === values.length - 1 ? lastColor : barColor }} />
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
