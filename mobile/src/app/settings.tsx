import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConnectionSection } from '../connection';
import { Chevron, Palette, space, type, usePalette } from '../ui';

export default function SettingsScreen() {
  const router = useRouter();
  const palette = usePalette();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          hitSlop={space.sm}
          style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
        >
          <View style={styles.backCircle}><Chevron color={palette.greenText} size={8} direction="left" /></View>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text accessibilityRole="header" style={styles.title}>Settings</Text>
        <ConnectionSection />
        <View style={styles.about}>
          <Text style={styles.aboutTitle}>About this demo</Text>
          <Text style={styles.aboutText}>All readings are Wokwi simulated data. The 25°C demo setpoint, fan levels, and airflow labels are demo values, not farm settings or poultry-health limits.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.xxl, gap: space.xl },
    back: { flexDirection: 'row', alignItems: 'center', gap: space.sm, alignSelf: 'flex-start', minHeight: 44, paddingRight: space.md },
    backPressed: { opacity: 0.7 },
    backCircle: { width: 36, height: 36, borderWidth: 1.5, borderColor: colors.greenText, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    backText: { ...type.label, color: colors.greenText },
    title: { ...type.title, color: colors.ink },
    about: { gap: space.sm },
    aboutTitle: { ...type.heading, color: colors.ink },
    aboutText: { ...type.body, color: colors.body },
  });
}
