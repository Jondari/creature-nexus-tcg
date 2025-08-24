import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/context/AuthContext';
import { DeckProvider } from '@/context/DeckContext';
import { SettingsProvider } from '@/context/SettingsContext';
import GlobalAlertProvider from '@/components/GlobalAlertProvider';
import { StoryModeProvider } from '@/context/StoryModeContext';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Colors from '@/constants/Colors';
import { SplashScreen } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';
import AnimatedSplashScreen from '@/components/AnimatedSplashScreen';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Hide Android navigation bar
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBackgroundColorAsync('transparent');
    }
  }, []);

  // Return null to keep splash screen visible while fonts load
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GlobalAlertProvider>
      <SettingsProvider>
        <AuthProvider>
          <DeckProvider>
            <StoryModeProvider>
              <Stack screenOptions={{ 
                headerShown: false,
                contentStyle: { backgroundColor: Colors.background.primary }
              }}>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
              </Stack>
              <StatusBar style="light" hidden={Platform.OS === 'android'} />
              
              {/* Animated Splash Screen */}
              {showAnimatedSplash && (
                <AnimatedSplashScreen
                  duration={2500} // 2.5 seconds
                  onComplete={() => setShowAnimatedSplash(false)}
                />
              )}
            </StoryModeProvider>
          </DeckProvider>
        </AuthProvider>
      </SettingsProvider>
    </GlobalAlertProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.primary,
  },
  text: {
    color: Colors.text.primary,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  }
});