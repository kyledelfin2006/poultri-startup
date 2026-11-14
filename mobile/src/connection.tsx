import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useDemoSession } from './demo-session';
import { ActionButton, Palette, radius, space, type, usePalette } from './ui';

// Bridge URL, connect, and reset controls. Shared by House 1 and Settings.
export function ConnectionSection() {
  const palette = usePalette();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { bridgeUrl, setBridgeUrl, connected, connecting, message, reading, stale, status, connect, resetDemo } = useDemoSession();
  const statusWarning = stale || status.startsWith('Disconnected');
  const [confirmingReset, setConfirmingReset] = useState(false); // reset is destructive for the demo, so it takes two taps

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
      <View style={styles.reset}>
        {confirmingReset ? (
          <View style={styles.confirm} accessibilityLiveRegion="polite">
            <Text style={styles.confirmText}>Reset clears the inspection prompt and session reference.</Text>
            <View style={styles.confirmRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Reset session now"
                onPress={() => { resetDemo(); setConfirmingReset(false); }}
                style={({ pressed }) => [styles.dangerButton, styles.dangerFilled, pressed && styles.dangerPressed]}
              >
                <Text style={styles.dangerFilledText}>Reset</Text>
              </Pressable>
              <View style={styles.cancel}><ActionButton title="Cancel" onPress={() => setConfirmingReset(false)} palette={palette} secondary /></View>
            </View>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityHint="Asks for confirmation before clearing the prompt."
            onPress={() => setConfirmingReset(true)}
            style={({ pressed }) => [styles.dangerButton, pressed && styles.dangerPressed]}
          >
            <Text style={styles.dangerText}>Reset session</Text>
          </Pressable>
        )}
      </View>
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
    confirm: { gap: space.md, padding: space.md, borderRadius: radius.control, borderWidth: 1.5, borderColor: colors.danger },
    confirmText: { ...type.body, color: colors.danger },
    confirmRow: { flexDirection: 'row', gap: space.md },
    cancel: { flex: 1 },
    dangerButton: { flex: 1, minHeight: 48, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.lg },
    dangerFilled: { backgroundColor: colors.danger },
    dangerPressed: { opacity: 0.8 },
    dangerText: { ...type.label, color: colors.danger },
    // surface on danger: 7.67:1 light, 7.79:1 dark (white fails on the dark-mode danger tone).
    dangerFilledText: { ...type.label, color: colors.surface },
  });
}
