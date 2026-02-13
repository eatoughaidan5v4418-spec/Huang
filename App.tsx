import { StatusBar } from 'expo-status-bar';
import { NativeBaseProvider } from 'native-base';
import { useColorModeValue } from 'native-base';
import { Stack } from 'expo-router';
import { theme } from './constants/theme';

export default function App() {
  return (
    <NativeBaseProvider theme={theme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: useColorModeValue('#ffffff', '#1a1a1a'),
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="add-expense" options={{ presentation: 'modal' }} />
        <Stack.Screen name="statistics" />
      </Stack>
      <StatusBar style="auto" />
    </NativeBaseProvider>
  );
}
