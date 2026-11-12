import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { answer, SUGGESTIONS } from '../../buddy';
import { useDemoSession } from '../../demo-session';
import { summarize } from '../../history';
import { useHistory } from '../../use-history';
import { Chevron, Palette, radius, space, type, usePalette } from '../../ui';

type Message = { id: number; from: 'buddy' | 'user'; text: string };

const GREETING: Message = { id: 0, from: 'buddy', text: "Hi, I'm Buddy. Ask me about the simulated readings." };

export default function BuddyScreen() {
  const palette = usePalette();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { q, h, n } = useLocalSearchParams<{ q?: string; h?: string; n?: string }>();
  const { activeUrl, reading, stale, alertRecord } = useDemoSession();
  const inspection = !alertRecord ? 'clear' : alertRecord.recovered ? 'recovered' : alertRecord.acknowledged ? 'acknowledged' : 'inspect';
  const hours = Number(h) >= 1 && Number(h) <= 24 ? Number(h) : 24;
  const { points } = useHistory(activeUrl, hours);
  const summary = summarize(points, reading?.setpointC ?? 25);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [draft, setDraft] = useState('');
  const scroller = useRef<ScrollView>(null);
  const handled = useRef('');

  const ask = useCallback((question: string) => {
    const text = question.trim();
    if (!text) return;
    const reply = answer(text, { reading, inspection, stale, summary, hours });
    setMessages((previous) => [
      ...previous,
      { id: previous.length, from: 'user', text },
      { id: previous.length + 1, from: 'buddy', text: reply },
    ]);
  }, [reading, inspection, stale, summary, hours]);

  useEffect(() => {
    if (!q || !n || handled.current === n) return;
    handled.current = n;
    ask(q);
  }, [q, n, ask]);

  function send() {
    ask(draft);
    setDraft('');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Image source={require('../../../assets/poultri-logo.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="Official Poultri logo" />
          <View style={styles.headerText}>
            <Text accessibilityRole="header" style={styles.title}>Poultri Buddy</Text>
            <Text style={styles.sub}>Scripted demo helper · no AI model</Text>
          </View>
        </View>

        <ScrollView ref={scroller} style={styles.flex} contentContainerStyle={styles.messages} onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })} keyboardShouldPersistTaps="handled">
          {messages.map((message) => (
            <View key={message.id} style={[styles.bubble, message.from === 'user' ? styles.userBubble : styles.buddyBubble]}>
              <Text style={[styles.bubbleText, message.from === 'user' && styles.userText]}>{message.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.chips}>
            {SUGGESTIONS.map((suggestion) => (
              <Pressable key={suggestion} accessibilityRole="button" onPress={() => ask(suggestion)} style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}>
                <Text style={styles.chipText}>{suggestion}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.inputRow}>
            <TextInput
              accessibilityLabel="Ask Buddy a question"
              onChangeText={setDraft}
              onSubmitEditing={send}
              placeholder="Ask about the readings"
              placeholderTextColor={palette.quiet}
              returnKeyType="send"
              style={styles.input}
              value={draft}
            />
            <Pressable accessibilityRole="button" accessibilityLabel="Send" onPress={send} hitSlop={space.xs} style={({ pressed }) => [styles.send, pressed && styles.sendPressed]}>
              <Chevron color={palette.onLime} size={10} />
            </Pressable>
          </View>
          <Text style={styles.note}>Answers come from this app&apos;s readings. No health advice.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.md },
    logo: { width: 44, height: 44 },
    headerText: { flex: 1, gap: space.xs },
    title: { ...type.heading, color: colors.ink },
    sub: { ...type.caption, color: colors.muted },
    messages: { paddingHorizontal: space.xl, paddingVertical: space.md, gap: space.md },
    bubble: { maxWidth: '86%', borderRadius: radius.card, paddingHorizontal: space.lg, paddingVertical: space.md },
    buddyBubble: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    // Lime stays on the send action only; user bubbles use the quiet green surface.
    userBubble: { alignSelf: 'flex-end', backgroundColor: colors.greenSurface, borderWidth: 1, borderColor: colors.border },
    bubbleText: { ...type.body, color: colors.ink },
    userText: { color: colors.ink },
    footer: { paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: space.md, gap: space.md },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
    chip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: space.lg, borderRadius: radius.pill, backgroundColor: colors.greenSurface },
    chipPressed: { backgroundColor: colors.border },
    chipText: { ...type.label, color: colors.greenText },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    input: { flex: 1, minHeight: 52, borderColor: colors.inputBorder, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: space.lg, backgroundColor: colors.surface, color: colors.ink, ...type.body },
    send: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.lime },
    sendPressed: { backgroundColor: colors.limePressed },
    note: { ...type.caption, color: colors.muted },
  });
}
