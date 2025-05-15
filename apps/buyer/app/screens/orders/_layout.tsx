// app/screens/orders/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import CustomHeader from 'proba-package/custom-header/index'; 

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
          name="review"
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="details"
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="productDetails/[productId]"
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="orderRoute"
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  );
}
