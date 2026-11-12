import { Tabs } from 'expo-router/js-tabs';
import { TabIcon } from '../../tab-icons';
import { type, usePalette } from '../../ui';

export default function TabsLayout() {
  const palette = usePalette();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: palette.surface, borderTopColor: palette.border },
        tabBarActiveTintColor: palette.ink,
        tabBarInactiveTintColor: palette.muted,
        tabBarLabelStyle: { ...type.caption, fontSize: 12, fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon kind="home" focused={focused} /> }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: ({ focused }) => <TabIcon kind="history" focused={focused} /> }} />
      <Tabs.Screen name="buddy" options={{ title: 'Buddy', tabBarIcon: ({ focused }) => <TabIcon kind="buddy" focused={focused} /> }} />
    </Tabs>
  );
}
