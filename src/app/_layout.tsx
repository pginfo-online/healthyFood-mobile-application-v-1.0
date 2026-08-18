import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, user, hasOnboarded } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Auth routing logic
  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inCustomerGroup = segments[0] === '(customer)';
    const inDeliveryGroup = segments[0] === '(delivery)';

    // Hide splash screen when routing is determined
    SplashScreen.hideAsync().catch(() => {});

    if (!hasOnboarded) {
      // Redirect to onboarding if not done, but allow login and register
      if (
        segments[0] !== '(auth)' ||
        (segments[1] !== 'onboarding' && segments[1] !== 'login' && segments[1] !== 'register')
      ) {
        router.replace('/(auth)/onboarding');
      }
    } else if (!isAuthenticated) {
      // Redirect to login if not authenticated
      if (!inAuthGroup || (segments[1] !== 'login' && segments[1] !== 'register')) {
        router.replace('/(auth)/login');
      }
    } else if (user) {
      // Redirect authenticated users to their home screens
      if (user.role === 'delivery_partner') {
        if (!inDeliveryGroup) {
          router.replace('/(delivery)');
        }
      } else {
        // Customer or Admin/Store Owner fallback to customer view on mobile
        if (!inCustomerGroup) {
          router.replace('/(customer)');
        }
      }
    }
  }, [isAuthenticated, user, hasOnboarded, segments]);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(customer)" options={{ headerShown: false }} />
        <Stack.Screen name="(delivery)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
