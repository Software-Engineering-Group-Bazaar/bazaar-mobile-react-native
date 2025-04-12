import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot_password"/>
        <Stack.Screen name="confirm_reset"/>
        <Stack.Screen name="new_password"/>
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
