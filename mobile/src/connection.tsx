import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { useDemoSession } from './demo-session';
import { ActionButton, Palette, radius, space, type, usePalette } from './ui';

// Bridge URL, connect, and reset controls. Shared by House 1 and Settings.
export function ConnectionSection() {
  const palette = usePalette();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { bridgeUrl, setBridgeUrl, connected, connecting, message, reading, stale, status, connect, resetDemo } = useDemoSession();
  const statusWarning = stale || status.startsWith('Disconnected');

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Connection</Text>
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
        style={styles.input}
        value={bridgeUrl}
      />
      <ActionButton title={connecting ? 'Connecting…' : connected ? 'Reconnect' : 'Connect to bridge'} onPress={() => void connect()} palette={palette} disabled={connecting} />
      {connecting && <ActivityIndicator color={palette.greenText} />}
      {!!message && !connecting && (
        <View style={styles.messageRow}>
          <View style={[styles.dot, statusWarning && styles.dotWarning]} />
          <Text style={[styles.message, statusWarning && styles.messageWarning]}>
            {status === 'Not connected' ? 'Enter the bridge URL, then connect.' : reading && message === 'Connected. Waiting for Wokwi.' ? 'Connected to the bridge.' : message}
          </Text>
        </View>
      )}
      <View style={styles.reset}><ActionButton title="Reset session" onPress={resetDemo} palette={palette} secondary /></View>
    </View>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    section: { gap: space.md },
    sectionTitle: { ...type.heading, color: colors.ink },
    inputLabel: { ...type.label, color: colors.ink, marginTop: space.xs },
    input: { minHeight: 52, borderColor: colors.inputBorder, borderWidth: 1, borderRadius: radius.control, paddingHorizontal: space.md, backgroundColor: colors.surface, color: colors.ink, ...type.body },
    messageRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.xs },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.greenText },
    dotWarning: { backgroundColor: colors.warningInk },
    message: { ...type.caption, color: colors.greenText, flex: 1 },
    messageWarning: { color: colors.warningInk },
    reset: { marginTop: space.sm },
  });
}
