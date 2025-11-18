// app/_layout.tsx
import { Stack } from 'expo-router';
import { Provider as PaperProvider, Portal } from 'react-native-paper';

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {





  return (
    <SafeAreaProvider>
      <PaperProvider>
        <Portal.Host>
          <Stack screenOptions={{ headerShown: false }} />
        </Portal.Host>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
