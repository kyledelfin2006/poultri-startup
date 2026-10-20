import { Image, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

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
  background: '#F2F0E9',
  surface: '#F2F0E9',
  ink: '#1C2B26',
  body: '#263630',
  muted: '#64766B',
  quiet: '#75877A',
  border: '#C8D0C4',
  forest: '#263630',
  greenText: '#355B45',
  lime: '#A9CE83',
  alertSurface: '#EBC9B0',
  greenSurface: '#D8E5D2',
  inputBorder: '#A7B9A8',
  onForest: '#F5F7EF',
  onForestMuted: '#D0DED0',
  onForestAccent: '#B8DB91',
  forestRaised: '#405E49',
  forestLine: '#657B6A',
  warningSurface: '#EBC9B0',
  warningInk: '#693D31',
};

const darkPalette: Palette = {
  background: '#18241E',
  surface: '#24342B',
  ink: '#F4F5ED',
  body: '#E5EBDD',
  muted: '#B8CAB6',
  quiet: '#A8BBA9',
  border: '#526659',
  forest: '#263630',
  greenText: '#C4DFA9',
  lime: '#A9CE83',
  alertSurface: '#5D4035',
  greenSurface: '#344B3A',
  inputBorder: '#718675',
  onForest: '#F5F7EF',
  onForestMuted: '#D0DED0',
  onForestAccent: '#B8DB91',
  forestRaised: '#405E49',
  forestLine: '#657B6A',
  warningSurface: '#5D4035',
  warningInk: '#FFE0CB',
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
      borderRadius: 9,
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
    borderRadius: 8,
  },
  logo: { width: 38, height: 38 },
  wordmark: { width: 112, height: 42 },
  metricIcon: { width: 16, height: 16 },
});
