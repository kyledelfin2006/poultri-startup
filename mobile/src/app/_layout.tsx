import { Nunito_800ExtraBold, useFonts } from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DemoProvider } from '../demo-session';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // Rounded type for display, title, and heading; on a load error the system font is used instead.
  const [fontsLoaded, fontError] = useFonts({ Nunito_800ExtraBold });
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <DemoProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="house-1" />
          <Stack.Screen name="settings" />
        </Stack>
      </DemoProvider>
    </SafeAreaProvider>
  );
}
