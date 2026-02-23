import { StatusBar } from 'expo-status-bar';
import { NativeBaseProvider } from 'native-base';
import { Stack } from 'expo-router';
import { theme } from './constants/theme';

export default function App() {
  return (
    <NativeBaseProvider theme={theme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#F0F4F8',
          },
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="auto" />
    </NativeBaseProvider>
  );
}
