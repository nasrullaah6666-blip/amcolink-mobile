import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { AppText } from '@/components/ui';
import { config } from '@/lib/config';
import { AuthProvider, useAuth } from '@/auth/session';
import { listenForTaps, refreshPush } from '@/lib/push';
import { CountryProvider } from '@/lib/countryPref';
import { colors, space } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

/** Phone alerts: keeps this phone's token saved for the signed-in person and opens the right screen when an alert is tapped. */
function PushBridge() {
  const { user } = useAuth();
  useEffect(() => listenForTaps(), []);
  useEffect(() => { if (user) refreshPush(user.id); }, [user]);
  return null;
}

// Lists are kept for a minute so going back is instant; failed loads retry twice (poor networks).
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 2 } } });

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  if (config.configProblem) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: space.xxl, gap: space.md }}>
          <AppText variant="title" tone="green">Amcolink</AppText>
          <AppText variant="body" tone="error">{config.configProblem}</AppText>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <CountryProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <PushBridge />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
      </CountryProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
