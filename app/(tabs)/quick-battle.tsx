import React from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground, Platform, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { GameProvider, useGame } from '@/context/GameContext';
import { GameBoard } from '@/components/GameBoard';
import Colors from '@/constants/Colors';
import { useSceneTrigger } from '@/context/SceneManagerContext';
import { COMMON_ANCHORS } from '@/types/scenes';
import { useAnchorPolling } from '@/hooks/useAnchorPolling';
import { ANCHOR_POLL_LONG_ATTEMPTS } from '@/constants/tutorial';

const APP_BACKGROUND = require('@/assets/images/background/cosmic_nebula.png');
const QUICK_BATTLE_ZOOM_SCALE = parseFloat(process.env.EXPO_PUBLIC_ZOOM_SCALE || '1');

function QuickBattleContent() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { gameState } = useGame();
  const sceneTrigger = useSceneTrigger();

  const handleBackPress = () => {
    router.push('/(tabs)/battle');
  };

  // Only show back button when no game is active (deck selection screen)
  const showBackButton = !gameState || gameState.isGameOver;
  const isWebZoomMode = Platform.OS === 'web' && width < 768 && QUICK_BATTLE_ZOOM_SCALE !== 1;
  const backgroundViewportStyle = Platform.OS === 'web' && !isWebZoomMode
    ? ({ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, width: '100vw', height: '100vh' } as any)
    : null;

  useAnchorPolling(
    [COMMON_ANCHORS.FIELD_AREA, COMMON_ANCHORS.END_TURN_BUTTON],
    () => {
      sceneTrigger({ type: 'onEnterScreen', screen: 'battle' });
    },
    { maxAttempts: ANCHOR_POLL_LONG_ATTEMPTS }
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        source={APP_BACKGROUND}
        style={[styles.background, backgroundViewportStyle]}
        resizeMode="cover"
      />
      <LinearGradient
        colors={[Colors.background.overlayPrimaryStrong, Colors.background.overlayPrimarySoft]}
        style={[styles.background, backgroundViewportStyle]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />

      {/* Back Button - only visible during deck selection */}
      {showBackButton && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      )}
      
      <GameBoard />
    </View>
  );
}

export default function QuickBattleScreen() {
  return (
    <GameProvider>
      <QuickBattleContent />
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 100,
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.glass.surfaceStrong,
    borderWidth: 1,
    borderColor: Colors.glass.borderStrong,
    shadowColor: Colors.glass.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(12px)' } as any) : null),
  },
});
