import { Stack } from 'expo-router';

export default function AuthLayout() {
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="kyc-verification" />
      <Stack.Screen name="trip-details" />
    </Stack>
  );
}