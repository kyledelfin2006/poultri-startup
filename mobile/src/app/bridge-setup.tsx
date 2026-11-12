import { Redirect } from 'expo-router';

// Bridge setup now lives in Settings (shared ConnectionSection with the reset confirmation).
// This route stays so existing links to /bridge-setup keep working.
export default function BridgeSetupScreen() {
  return <Redirect href="/settings" />;
}
