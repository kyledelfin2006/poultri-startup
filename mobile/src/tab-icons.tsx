import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';
import { usePalette } from './ui';

type Kind = 'home' | 'history' | 'buddy';

// Ionicons: filled when the tab is selected, outline otherwise.
const NAMES = {
  home: ['home', 'home-outline'],
  history: ['bar-chart', 'bar-chart-outline'],
  buddy: ['chatbubble-ellipses', 'chatbubble-ellipses-outline'],
} as const;

export function TabIcon({ kind, focused }: { kind: Kind; focused: boolean }) {
  const palette = usePalette();
  return (
    <View
      accessible={false}
      style={{ width: 48, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: focused ? palette.forest : 'transparent' }}
    >
      <Ionicons name={NAMES[kind][focused ? 0 : 1]} size={20} color={focused ? palette.onForest : palette.muted} accessible={false} />
    </View>
  );
}

export function SettingsIcon({ color }: { color: string }) {
  return <Ionicons name="options-outline" size={22} color={color} accessible={false} />;
}
