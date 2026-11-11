import { Image, Platform, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

export const systemFont = Platform.select({ android: 'sans-serif', ios: 'System', default: 'sans-serif' });
export const displayFont = Platform.select({ android: 'sans-serif-condensed', ios: 'Avenir Next', default: 'sans-serif-condensed' });

export type Palette = {
  background: string;
  surface: string;
  surfaceAlt: string;
  ink: string;
  body: string;
  muted: string;
  quiet: string;
  border: string;
  forest: string;
  greenText: string;
  lime: string;
  alertSurface: string;
  greenSurface: string;
  inputBorder: string;
  onForest: string;
  onForestMuted: string;
  onForestAccent: string;
  forestRaised: string;
  forestLine: string;
  warningSurface: string;
  warningInk: string;
};

const lightPalette: Palette = {
  background: '#F4F8F2',
  surface: '#FFFFFF',
  surfaceAlt: '#E8F1E5',
  ink: '#153B2A',
  body: '#294B37',
  muted: '#536D5C',
  quiet: '#5D7665',
  border: '#D5E3D5',
  forest: '#075A35',
  greenText: '#17683B',
  lime: '#8ED63B',
  alertSurface: '#F0F2C8',
  greenSurface: '#E4F0DF',
  inputBorder: '#AFC7B1',
  onForest: '#F6FAF4',
  onForestMuted: '#D6E8D5',
  onForestAccent: '#A6E65A',
  forestRaised: '#146A40',
  forestLine: '#43805A',
  warningSurface: '#F0F2C8',
  warningInk: '#4E551E',
};

const darkPalette: Palette = {
  background: '#0C1F16',
  surface: '#152D20',
  surfaceAlt: '#1D3A29',
  ink: '#F2F7EF',
  body: '#DCE9DA',
  muted: '#B6CBB8',
  quiet: '#A9C0AC',
  border: '#365743',
  forest: '#0A4B2D',
  greenText: '#A7DF80',
  lime: '#98DC4B',
  alertSurface: '#3A421C',
  greenSurface: '#203D2B',
  inputBorder: '#52745B',
  onForest: '#F6FAF4',
  onForestMuted: '#D6E8D5',
  onForestAccent: '#A6E65A',
  forestRaised: '#146A40',
  forestLine: '#43805A',
  warningSurface: '#3A421C',
  warningInk: '#E9F28A',
};

export function usePalette() {
  return useColorScheme() === 'dark' ? darkPalette : lightPalette;
}

export function BrandHeader({ palette }: { palette: Palette }) {
  return (
    <View style={[styles.brand, { backgroundColor: palette.surface }]}>
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
      minHeight: 52,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
      backgroundColor: secondary ? 'transparent' : palette.forest,
      borderWidth: secondary ? 1 : 0,
      borderColor: palette.inputBorder,
      opacity: disabled ? 0.5 : 1,
    },
    text: { color: secondary ? palette.greenText : palette.onForest, fontFamily: systemFont, fontSize: 15, fontWeight: '700' as const, letterSpacing: 0.1 },
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
  return <Text style={{ color: palette.ink, fontFamily: displayFont, fontSize: 19, fontWeight: '800' }}>{children}</Text>;
}

const styles = StyleSheet.create({
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    minHeight: 44,
    borderRadius: 11,
    paddingHorizontal: 3,
  },
  logo: { width: 35, height: 35 },
  wordmark: { width: 108, height: 36 },
  metricIcon: { width: 16, height: 16 },
});
