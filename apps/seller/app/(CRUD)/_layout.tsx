import { Stack } from 'expo-router';

export default function CRUDLayout() {
  return (
    <Stack>
      <Stack.Screen name="prodavnica_detalji" options={{ title: 'Pregled proizvoda' }} />
      <Stack.Screen name="postavke_prodavnice" />
    </Stack>
  );
}
