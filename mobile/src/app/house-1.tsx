import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDemoSession } from '../demo-session';
import { ActionButton, BrandHeader, Palette, SectionTitle, usePalette } from '../ui';

export default function HouseDetailScreen() {
  const router = useRouter();
  const palette = usePalette();
  const { width, fontScale } = useWindowDimensions();
  const stackedReadings = width < 380 || fontScale >= 1.3;
  const styles = useMemo(() => createStyles(palette), [palette]);
  const {
    bridgeUrl,
    setBridgeUrl,
    connected,
    connecting,
    message,
    reading,
    baseline,
    alertRecord,
    sampleAgeMs,
    stale,
    status,
    statusDescription,
    connect,
    acknowledge,
    resetDemo,
  } = useDemoSession();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <BrandHeader palette={palette} />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
          style={styles.backButton}
        >
          <Text style={styles.backText}>Back to house overview</Text>
        </Pressable>

        <View style={styles.heading}>
          <Text accessibilityRole="header" style={styles.title}>House 1</Text>
          <Text style={styles.subtitle}>Wokwi simulated data · House readings and inspection</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SectionTitle palette={palette}>Environmental readings</SectionTitle>
            <View style={[styles.statePill, (stale || status.startsWith('Disconnected')) && styles.statePillWarning]}>
              <Text style={[styles.stateText, (stale || status.startsWith('Disconnected')) && styles.stateTextWarning]}>{status}</Text>
            </View>
          </View>

          <View style={[styles.primaryReading, stackedReadings && styles.primaryReadingStacked]}>
            <View style={styles.readingLabelGroup}>
              <Text style={styles.readingLabel}>Temperature</Text>
              <Text style={styles.setpoint}>Demo setpoint {reading?.setpointC.toFixed(1) ?? '25.0'}°C</Text>
            </View>
            <Text style={[styles.temperatureValue, stackedReadings && styles.temperatureValueStacked]} accessibilityLabel={`Temperature ${reading ? `${reading.temperatureC.toFixed(1)} degrees Celsius` : 'unavailable'}`}>
              {reading ? `${reading.temperatureC.toFixed(1)}°C` : '—'}
            </Text>
          </View>

          <View style={styles.divider} />
          <View style={[styles.readingRow, stackedReadings && styles.readingRowStacked]}>
            <Text style={styles.readingLabel}>Humidity</Text>
            <Text style={styles.readingValue}>{reading ? `${reading.humidityPct.toFixed(1)}%` : '—'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Sample age</Text>
            <Text style={styles.metaValue}>{reading ? `${Math.floor(sampleAgeMs / 1000)}s${stale ? ' · stale' : ''}` : 'No reading received yet'}</Text>
          </View>
          <Text style={styles.supporting}>
            {status === 'Not connected' ? 'Enter your laptop URL in the Local bridge section below.' : statusDescription}
          </Text>
          <Text style={styles.simulationNote}>Wokwi simulated data · humidity is display-only</Text>
        </View>

        <View style={styles.section}>
          <SectionTitle palette={palette}>Simulated fan</SectionTitle>
          <View style={styles.fanReadingRow}>
            <Text style={styles.fanValue}>{reading ? `${reading.fanSpeedPct}%` : '—'}</Text>
            <Text style={styles.fanCaption}>Fan indicator</Text>
          </View>
          <Text style={styles.supporting}>The Wokwi LED represents fan output. No physical fan is connected or controlled.</Text>
        </View>

        <View style={[styles.section, alertRecord && !alertRecord.recovered && styles.alertSection]} accessibilityLiveRegion="polite">
          <SectionTitle palette={palette}>Inspection prompt</SectionTitle>
          <Text style={styles.supporting}>
            {baseline === null ? 'Waiting for the reference reading.' : `Session reference: ${baseline.toFixed(1)}°C`}
          </Text>
          {!alertRecord ? (
            <Text style={styles.supporting}>
              {`No inspection prompt · demo setpoint ${reading?.setpointC.toFixed(1) ?? '25.0'}°C.`}
            </Text>
          ) : (
            <>
              <Text style={[styles.alertTitle, alertRecord.recovered && styles.recoveredTitle]}>
                {alertRecord.recovered ? 'Reading recovered' : 'Temperature threshold reached'}
              </Text>
              <Text style={styles.supporting}>
                {alertRecord.acknowledged ? 'Acknowledged' : 'Please inspect House 1'}
                {alertRecord.recovered ? ' · prompt retained' : ''}
              </Text>
              {!alertRecord.acknowledged && (
                <ActionButton title="Acknowledge prompt" onPress={acknowledge} palette={palette} />
              )}
            </>
          )}
        </View>

        <View style={styles.section}>
          <SectionTitle palette={palette}>Local bridge</SectionTitle>
          <Text style={styles.supporting}>Connect to the laptop bridge on the same Wi-Fi network.</Text>
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
          <ActionButton
            title={connecting ? 'Connecting…' : connected ? 'Reconnect' : 'Connect to bridge'}
            onPress={() => void connect()}
            palette={palette}
            disabled={connecting}
          />
          {connecting && <ActivityIndicator color={palette.greenText} />}
          {!!message && !connecting && (
            <Text style={styles.message}>
              {status === 'Not connected'
                ? 'Enter the laptop bridge URL, then connect.'
                : reading && message === 'Connected. Waiting for a fresh Wokwi reading.'
                  ? 'Connected to the local bridge.'
                  : message}
            </Text>
          )}
        </View>

        <ActionButton title="Reset demo" onPress={resetDemo} palette={palette} secondary />
        <Text style={styles.footer}>Prototype only · no physical sensor or farm validation</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 12, paddingBottom: 32, gap: 15 },
    backButton: { alignSelf: 'flex-start', minHeight: 40, justifyContent: 'center', paddingVertical: 6, paddingRight: 12 },
    backText: { color: colors.greenText, fontSize: 14, fontWeight: '700' },
    heading: { gap: 4, marginBottom: 2 },
    title: { color: colors.ink, fontSize: 28, fontWeight: '800' },
    subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20 },
    section: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 18, gap: 12 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
    statePill: { minHeight: 30, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: colors.greenSurface },
    statePillWarning: { backgroundColor: '#FFF3D0' },
    stateText: { color: colors.greenText, fontSize: 12, fontWeight: '700' },
    stateTextWarning: { color: '#71520B' },
    primaryReading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 6 },
    primaryReadingStacked: { flexDirection: 'column', alignItems: 'stretch' },
    readingLabelGroup: { gap: 5 },
    readingLabel: { color: colors.muted, fontSize: 14, fontWeight: '600' },
    setpoint: { color: colors.muted, fontSize: 13 },
    temperatureValue: { color: colors.greenText, fontSize: 44, fontWeight: '800', textAlign: 'right', fontVariant: ['tabular-nums'] },
    temperatureValueStacked: { textAlign: 'left' },
    divider: { height: 1, backgroundColor: colors.border },
    readingRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    readingRowStacked: { alignItems: 'flex-start', flexDirection: 'column', justifyContent: 'center', paddingVertical: 7 },
    readingValue: { color: colors.ink, fontSize: 20, fontWeight: '700', fontVariant: ['tabular-nums'] },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 },
    metaLabel: { color: colors.muted, fontSize: 12 },
    metaValue: { color: colors.body, fontSize: 12, fontWeight: '700' },
    supporting: { color: colors.muted, fontSize: 14, lineHeight: 20 },
    simulationNote: { color: colors.greenText, fontSize: 12, lineHeight: 18, fontWeight: '700' },
    fanReadingRow: { flexDirection: 'row', alignItems: 'baseline', gap: 12 },
    fanValue: { color: colors.greenText, fontSize: 34, fontWeight: '800', fontVariant: ['tabular-nums'] },
    fanCaption: { color: colors.body, fontSize: 14, fontWeight: '600' },
    alertSection: { backgroundColor: colors.redSurface, borderColor: colors.red },
    alertTitle: { color: colors.red, fontSize: 18, fontWeight: '800' },
    recoveredTitle: { color: colors.greenText },
    input: { minHeight: 50, borderColor: colors.inputBorder, borderWidth: 1, borderRadius: 10, paddingHorizontal: 13, backgroundColor: colors.surface, color: colors.body, fontSize: 15 },
    message: { color: colors.muted, fontSize: 13, lineHeight: 18 },
    footer: { color: colors.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  });
}
