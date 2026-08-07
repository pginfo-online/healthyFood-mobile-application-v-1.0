import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="store/[id]" options={{ headerShown: true, title: 'Store Details' }} />
      <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="cart" options={{ headerShown: true, title: 'My Cart' }} />
      <Stack.Screen name="checkout" options={{ headerShown: true, title: 'Checkout' }} />
      <Stack.Screen name="order-tracking/[id]" options={{ headerShown: true, title: 'Track Order' }} />
    </Stack>
  );
}
