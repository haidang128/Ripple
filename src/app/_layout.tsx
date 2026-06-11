import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { supabase } from '@/shared/api/supabase';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useCompletionStore } from '@/shared/stores/completion-store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  useEffect(() => {
    useCompletionStore.getState().initialize();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      useAuthStore.getState().setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!loaded && !error) return null;

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen
          name="action-detail"
          options={{ presentation: 'transparentModal' }}
        />
        <Stack.Screen
          name="celebration"
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
        <Stack.Screen
          name="share-card"
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="settings"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="forgot-password"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="level-up"
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
        <Stack.Screen
          name="levels"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="history"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
    </>
  );
}
