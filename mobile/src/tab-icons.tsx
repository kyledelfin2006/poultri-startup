import { View } from 'react-native';
import { usePalette } from './ui';

type Kind = 'home' | 'history' | 'buddy';

// Icons drawn from Views so no icon package is needed.
function Glyph({ kind, color }: { kind: Kind; color: string }) {
  if (kind === 'home') {
    return (
      <View style={{ alignItems: 'center' }}>
        <View style={{ width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderBottomWidth: 7, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color }} />
        <View style={{ width: 14, height: 9, borderWidth: 2, borderTopWidth: 0, borderColor: color }} />
      </View>
    );
  }
  if (kind === 'history') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 16 }}>
        {[8, 16, 11].map((height, index) => (
          <View key={index} style={{ width: 4, height, borderRadius: 2, backgroundColor: color }} />
        ))}
      </View>
    );
  }
  return (
    <View style={{ width: 22, height: 16, borderRadius: 6, borderWidth: 2, borderColor: color, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      {[0, 1, 2].map((index) => (
        <View key={index} style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: color }} />
      ))}
    </View>
  );
}

export function TabIcon({ kind, focused }: { kind: Kind; focused: boolean }) {
  const palette = usePalette();
  return (
    <View
      accessible={false}
      style={{ width: 48, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: focused ? palette.forest : 'transparent' }}
    >
      <Glyph kind={kind} color={focused ? palette.lime : palette.muted} />
    </View>
  );
}

export function SettingsIcon({ color }: { color: string }) {
  return (
    <View accessible={false} style={{ gap: 5 }}>
      {[2, 10, 5].map((left, index) => (
        <View key={index} style={{ width: 20, height: 2, borderRadius: 1, backgroundColor: color }}>
          <View style={{ position: 'absolute', top: -2, left, width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
        </View>
      ))}
    </View>
  );
}
