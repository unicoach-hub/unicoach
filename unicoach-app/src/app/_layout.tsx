import { Onest_400Regular, Onest_500Medium, Onest_600SemiBold } from '@expo-google-fonts/onest';
import { Urbanist_700Bold, Urbanist_800ExtraBold, Urbanist_900Black, useFonts } from '@expo-google-fonts/urbanist';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { AppSplash } from '@/components/brand/AppSplash';
import { AuthProvider, useAuth } from '@/lib/auth';
import { SavedProvider } from '@/lib/saved';
import { ScholarshipSavedProvider } from '@/lib/scholarshipSaved';
import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Urbanist_700Bold,
    Urbanist_800ExtraBold,
    Urbanist_900Black,
    Onest_400Regular,
    Onest_500Medium,
    Onest_600SemiBold,
  });

  // The native splash (static icon) stays up only until fonts are in; then the animated one takes over.
  if (!fontsLoaded && !fontError) return null;

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();
  const [splashGone, setSplashGone] = useState(false);
  const hideNative = useCallback(() => {
    SplashScreen.hideAsync();
  }, []);
  const onSplashHidden = useCallback(() => setSplashGone(true), []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      {/* Mount the app only once we know whether the saved session is still valid. */}
      {!loading && (
        <SignedInData userId={user?.profileCompleted ? user._id : undefined}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
          <Stack.Protected guard={!user}>
            <Stack.Screen name="welcome" />
            <Stack.Screen name="login" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="register" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="forgot-password" options={{ animation: 'slide_from_right' }} />
          </Stack.Protected>
          {/* Signed in but study plan not filled yet: the 5 onboarding questions come first. */}
          <Stack.Protected guard={!!user && !user.profileCompleted} redirectTo="/welcome">
            <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          </Stack.Protected>
          <Stack.Protected guard={!!user?.profileCompleted} redirectTo={user ? '/onboarding' : '/welcome'}>
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen name="journey" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="shortlist" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="delete-account" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="course/[cfId]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="edit-profile" options={{ animation: 'slide_from_right' }} />
          </Stack.Protected>
        </Stack>
        </SignedInData>
      )}
      {!splashGone && <AppSplash done={!loading} onReady={hideNative} onHidden={onSplashHidden} />}
    </View>
  );
}

// Saved courses and scholarships load once per signed-in student and are shared by every screen.
function SignedInData({ userId, children }: { userId?: string; children: ReactNode }) {
  if (!userId) return children;
  return (
    <SavedProvider key={userId}>
      <ScholarshipSavedProvider>{children}</ScholarshipSavedProvider>
    </SavedProvider>
  );
}
