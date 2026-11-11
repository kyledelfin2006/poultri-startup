import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { useDemoSession } from './demo-session';
import { ActionButton, Palette, radius, spacing, text } from './ui';

// Bridge URL field, connect action, and connection message. Shared by House 1 and Settings.
export function BridgeConnectionFields({ palette }: { palette: Palette }) {
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { bridgeUrl, setBridgeUrl, connected, connecting, message, reading, stale, status, connect } = useDemoSession();
  const statusWarning = stale || status.startsWith('Disconnected');

  return (
    <>
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
        <View style={styles.connectionMessage}>
          <View style={[styles.connectionDot, statusWarning && styles.connectionDotWarning]} />
          <Text style={[styles.message, statusWarning && styles.messageWarning]}>
            {status === 'Not connected' ? 'Enter the laptop bridge URL, then connect.' : reading && message === 'Connected. Waiting for a fresh Wokwi reading.' ? 'Connected to the local bridge.' : message}
          </Text>
        </View>
      )}
    </>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    inputLabel: { ...text.label, color: colors.ink, marginTop: spacing.xs },
    input: { ...text.body, minHeight: 48, borderColor: colors.inputBorder, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.md, backgroundColor: colors.greenSurface, color: colors.ink },
    connectionMessage: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
    connectionDot: { width: 7, height: 7, borderRadius: radius.pill, backgroundColor: colors.greenText },
    connectionDotWarning: { backgroundColor: colors.warningInk },
    message: { ...text.caption, color: colors.greenText, flex: 1 },
    messageWarning: { color: colors.warningInk },
  });
}
