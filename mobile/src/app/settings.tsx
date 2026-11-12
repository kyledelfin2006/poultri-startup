import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BridgeConnectionFields } from '../bridge-connection';
import { BrandHeader, Icon, Palette, radius, spacing, text, usePalette } from '../ui';

// Placeholder settings screen: only the bridge connection for now.
export default function SettingsScreen() {
  const router = useRouter();
  const palette = usePalette();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <BrandHeader palette={palette} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to house overview"
          onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
          style={styles.backButton}
        >
          <View style={styles.backCircle}><Icon name="chevron-left" color={palette.greenText} /></View>
          <Text style={styles.backText}>House overview</Text>
        </Pressable>

        <Text accessibilityRole="header" style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bridge connection</Text>
          <Text style={styles.sectionNote}>The laptop bridge relays Wokwi simulated data to this app.</Text>
          <BridgeConnectionFields palette={palette} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
    backButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'flex-start', minHeight: 44, marginTop: spacing.sm },
    backCircle: { width: 32, height: 32, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
    backText: { ...text.label, color: colors.greenText },
    title: { ...text.title, color: colors.ink, marginTop: spacing.lg, marginBottom: spacing.xl },
    section: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.xl, gap: spacing.md },
    sectionTitle: { ...text.heading, color: colors.ink },
    sectionNote: { ...text.caption, color: colors.muted },
  });
}
