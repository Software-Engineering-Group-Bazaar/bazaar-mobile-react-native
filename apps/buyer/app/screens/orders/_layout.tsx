// app/screens/orders/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function OrdersLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#4E8D7C' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      {/* This tells Expo Router to render your index.tsx here */}
      <Stack.Screen
        name="index"
        options={{ title: 'Moje narudžbe' }}
      />
    </Stack>
  );
}
