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
  yellow: string;
  red: string;
  redSurface: string;
  greenSurface: string;
  inputBorder: string;
  onForest: string;
};

const lightPalette: Palette = {
  background: '#F5F8F1',
  surface: '#FFFFFF',
  ink: '#173C28',
  body: '#344B3B',
  muted: '#596B5E',
  quiet: '#6B7A6F',
  border: '#D9E3D8',
  forest: '#064B2D',
  greenText: '#064B2D',
  lime: '#8DDC2F',
  yellow: '#FFD34C',
  red: '#B83228',
  redSurface: '#FFF0ED',
  greenSurface: '#EAF6E7',
  inputBorder: '#B6C7B8',
  onForest: '#FFFFFF',
};

const darkPalette: Palette = {
  background: '#111A14',
  surface: '#1A261E',
  ink: '#F0F6EF',
  body: '#D5E1D6',
  muted: '#B9C9BC',
  quiet: '#A8B9AA',
  border: '#35463A',
  forest: '#064B2D',
  greenText: '#A5EB50',
  lime: '#A5EB50',
  yellow: '#FFD34C',
  red: '#FF887A',
  redSurface: '#3A211E',
  greenSurface: '#1D3524',
  inputBorder: '#536659',
  onForest: '#FFFFFF',
};

export function usePalette() {
  return useColorScheme() === 'dark' ? darkPalette : lightPalette;
}

export function BrandHeader({ palette }: { palette: Palette }) {
  return (
    <View style={[styles.brand, { backgroundColor: '#FFFFFF', borderColor: palette.border }]}>
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
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
      backgroundColor: palette.forest,
      borderWidth: secondary ? 1 : 0,
      borderColor: palette.border,
      opacity: disabled ? 0.5 : 1,
    },
    text: { color: secondary ? palette.ink : palette.onForest, fontSize: 15, fontWeight: '700' as const },
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [componentStyles.button, secondary && { backgroundColor: palette.surface }, pressed && !disabled && { opacity: 0.78 }]}
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
    gap: 9,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 12,
  },
  logo: { width: 38, height: 38 },
  wordmark: { width: 136, height: 46 },
});
