// buyer/(tabs)/stores/_layout.tsx
import { Stack } from 'expo-router';

export default function StoresLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="products/[storeId]" />
    </Stack>
  );
}