import { Image, Pressable, StyleSheet, Text, View, useColorScheme, type TextStyle } from 'react-native';

// Type scale. System font only: no rounded/geometric sans ships with expo-font here,
// and adding a font package needs approval (agents.md). Colors stay at the call site.
export const text = {
  display: { fontSize: 72, lineHeight: 84, fontWeight: '800', letterSpacing: -2.5, fontVariant: ['tabular-nums'] },
  title: { fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -1 },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '800' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '700', letterSpacing: 0.2 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
} satisfies Record<string, TextStyle>;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

// Two radii only: cards and panels, or pills/buttons/circles.
export const radius = { card: 16, pill: 999 } as const;

// Display on narrow screens or large font scale.
export const displayCompact: TextStyle = { fontSize: 56, lineHeight: 66 };

export type Palette = {
  background: string;
  surface: string;
  ink: string;
  body: string;
  muted: string;
  quiet: string;
  border: string;
  forest: string;
  greenText: string;
  lime: string;
  primary: string;
  onPrimary: string;
  alertSurface: string;
  greenSurface: string;
  inputBorder: string;
  onForest: string;
  warningSurface: string;
  warningInk: string;
  alertAction: string; // Acknowledge button fill
  onAlertAction: string;
};

// Every text/background pair used by the screens is ≥4.5:1; outlines (inputBorder) are ≥3:1.
const lightPalette: Palette = {
  background: '#EEF4E7', // pale sage page
  surface: '#FFFFFF', // cards
  ink: '#0F2E1F', // deep green: headings, key numbers
  body: '#1F3F2E',
  muted: '#3E5E4B', // mid green: secondary text
  quiet: '#4A6B57', // placeholders
  border: '#C9D8BE',
  forest: '#0F2E1F',
  greenText: '#2C5E3B',
  lime: '#B5E04A',
  primary: '#B5E04A', // lime primary action
  onPrimary: '#0F2E1F',
  alertSurface: '#F7DCCB',
  greenSurface: '#DDEBCF',
  inputBorder: '#6B8771',
  onForest: '#F4F8EE',
  warningSurface: '#F7DCCB',
  warningInk: '#7A3720',
  alertAction: '#573B31',
  onAlertAction: '#FFF6ED',
};

const darkPalette: Palette = {
  background: '#0E1A13',
  surface: '#17271E',
  ink: '#EEF5E6',
  body: '#D6E3CE',
  muted: '#A9C0A8',
  quiet: '#9DB59D',
  border: '#2E4537',
  forest: '#1A3024',
  greenText: '#B5E04A',
  lime: '#B5E04A',
  primary: '#B5E04A',
  onPrimary: '#0F2E1F',
  alertSurface: '#4A2A1F',
  greenSurface: '#223829',
  inputBorder: '#6A8572',
  onForest: '#F4F8EE',
  warningSurface: '#4A2A1F',
  warningInk: '#FFD9C4',
  alertAction: '#573B31',
  onAlertAction: '#FFF6ED',
};

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
      minHeight: 50,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
      backgroundColor: secondary ? 'transparent' : palette.forest,
      borderWidth: secondary ? 1 : 0,
      borderColor: palette.inputBorder,
      opacity: disabled ? 0.5 : 1,
    },
    text: { color: secondary ? palette.greenText : palette.onForest, fontSize: 15, fontWeight: '700' as const },
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [componentStyles.button, pressed && !disabled && { opacity: 0.78 }]}
    >
      <Text style={componentStyles.text}>{title}</Text>
    </Pressable>
  );
}

export function SectionTitle({ children, palette }: { children: string; palette: Palette }) {
  return <Text style={{ color: palette.ink, fontSize: 18, fontWeight: '800' }}>{children}</Text>;
}

const styles = StyleSheet.create({
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    minHeight: 48,
    borderRadius: radius.card,
  },
  logo: { width: 38, height: 38 },
  wordmark: { width: 112, height: 42 },
  metricIcon: { width: 16, height: 16 },
});
