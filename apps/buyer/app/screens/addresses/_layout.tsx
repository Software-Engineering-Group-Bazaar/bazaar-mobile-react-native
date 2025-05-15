// app/screens/orders/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import CustomHeader from 'proba-package/custom-header/index'; 
import { NavigatorContext } from 'expo-router/build/views/Navigator';

export default function OrdersLayout() {
  return (
    <>
      <CustomHeader />
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="ConfirmAddressScreen"
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  );
}
