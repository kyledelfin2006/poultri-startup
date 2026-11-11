import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDemoSession } from '../demo-session';
import { ActionButton, BrandHeader, displayFont, Palette, usePalette } from '../ui';

export default function BridgeSetupScreen() {
  const router = useRouter();
  const palette = usePalette();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const {
    bridgeUrl,
    setBridgeUrl,
    connected,
    connecting,
    message,
    stale,
    status,
    statusDescription,
    connect,
    resetDemo,
  } = useDemoSession();
  const warning = stale || status === 'Not connected' || status.startsWith('Disconnected') || message.startsWith('Could not connect') || message.startsWith('Enter the laptop URL');
  const shownStatusDescription = message.startsWith('Demo reset.') ? message : statusDescription;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <BrandHeader palette={palette} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to House 1"
          onPress={() => router.canGoBack() ? router.back() : router.replace('/house-1')}
          style={styles.backButton}
        >
          <View style={styles.backCircle}><Text style={styles.backArrow}>‹</Text></View>
          <Text style={styles.backText}>House 1</Text>
        </Pressable>

        <View style={styles.heading}>
          <Text accessibilityRole="header" style={styles.title}>Bridge setup</Text>
          <Text style={styles.subtitle}>Connect the app to a local ESP32/DHT22 or Wokwi source through your laptop.</Text>
        </View>

        <View style={[styles.statusCard, warning && styles.statusCardWarning]} accessibilityLiveRegion="polite">
          <View style={[styles.statusDot, warning && styles.statusDotWarning]} />
          <View style={styles.statusCopy}>
            <Text style={[styles.statusTitle, warning && styles.statusTitleWarning]}>{status}</Text>
            <Text style={[styles.statusDescription, warning && styles.statusDescriptionWarning]}>{shownStatusDescription}</Text>
          </View>
        </View>

        <View style={styles.connectionCard}>
          <Text style={styles.cardTitle}>Local bridge</Text>
          <Text style={styles.cardIntro}>Enter the laptop’s local bridge address printed by the bridge.</Text>
          <Text style={styles.inputLabel}>Bridge URL</Text>
          <TextInput
            accessibilityLabel="Laptop bridge URL"
            accessibilityHint="Enter the laptop's local bridge URL."
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            onChangeText={setBridgeUrl}
            placeholder="http://<laptop-LAN-IP>:4174"
            placeholderTextColor={palette.quiet}
            returnKeyType="done"
            style={styles.input}
            value={bridgeUrl}
          />
          <ActionButton
            title={connecting ? 'Connecting…' : connected ? 'Reconnect' : 'Connect to bridge'}
            onPress={() => void connect()}
            palette={palette}
            disabled={connecting}
          />
          {connecting && <ActivityIndicator color={palette.greenText} />}
        </View>

        <View style={styles.resetCard}>
          <Text style={styles.cardTitle}>Demo session</Text>
          <Text style={styles.resetDescription}>Clear the reference reading and inspection prompt. This does not change the sensor value.</Text>
          <ActionButton title="Reset session" onPress={resetDemo} palette={palette} secondary />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 15, paddingBottom: 36, gap: 16 },
    backButton: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start', minHeight: 48, marginTop: -7 },
    backCircle: { width: 36, height: 36, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
    backArrow: { color: colors.greenText, fontSize: 26, lineHeight: 30, marginTop: -3 },
    backText: { color: colors.greenText, fontSize: 14, fontWeight: '700' },
    heading: { gap: 5 },
    title: { color: colors.ink, fontFamily: displayFont, fontSize: 36, fontWeight: '800', letterSpacing: -0.6 },
    subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20 },
    statusCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, padding: 16, borderRadius: 17, backgroundColor: colors.greenSurface },
    statusCardWarning: { backgroundColor: colors.warningSurface },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4, backgroundColor: colors.greenText },
    statusDotWarning: { backgroundColor: colors.warningInk },
    statusCopy: { flex: 1, gap: 3 },
    statusTitle: { color: colors.greenText, fontFamily: displayFont, fontSize: 17, fontWeight: '800' },
    statusTitleWarning: { color: colors.warningInk },
    statusDescription: { color: colors.body, fontSize: 12, lineHeight: 18 },
    statusDescriptionWarning: { color: colors.warningInk },
    connectionCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 22, padding: 19, gap: 12 },
    cardTitle: { color: colors.ink, fontFamily: displayFont, fontSize: 24, fontWeight: '800', letterSpacing: -0.2 },
    cardIntro: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: -5 },
    inputLabel: { color: colors.ink, fontSize: 13, fontWeight: '700', marginTop: 2 },
    input: { minHeight: 50, borderColor: colors.inputBorder, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, backgroundColor: colors.background, color: colors.ink, fontSize: 14 },
    resetCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 22, padding: 19, gap: 12 },
    resetDescription: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: -5 },
  });
}
