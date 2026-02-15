import React, { Suspense, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { playImpactSound } from '../utils/game/soundManager';
import { HITSTOP_DURATION_MS } from '../constants/animation';
import { DamageNumber } from './Animation/DamageNumber';
import type { Element } from '../types/game';

// Lazy-load Skia overlay so the Skia module is only evaluated after CanvasKit is ready
const LazySkiaFlashOverlay = React.lazy(() => import('./Animation/SkiaFlashOverlay'));

interface DamageEffectProps {
  children: React.ReactNode;
  isActive: boolean;
  duration?: number;
  damage?: number;
  isLethal?: boolean;
  attackElement?: Element;
  onAnimationComplete?: () => void;
}

// Element-based impact colors
const ELEMENT_COLORS: Record<string, string> = {
  fire: '#FF4500',   // OrangeRed
  water: '#1E90FF',  // DodgerBlue
  air: '#E0E0E0',    // LightGray
  earth: '#2E8B57',  // SeaGreen
};

const DEFAULT_IMPACT_COLOR = '#FF0000'; // Red

function getImpactColor(element?: Element): string {
  if (element && element !== 'all') return ELEMENT_COLORS[element] || DEFAULT_IMPACT_COLOR;
  return DEFAULT_IMPACT_COLOR;
}

export function DamageEffect({
  children,
  isActive,
  duration = 1000,
  damage,
  isLethal,
  attackElement,
  onAnimationComplete,
}: DamageEffectProps) {
  const shakeX = useSharedValue(0);
  const flashProgress = useSharedValue(0);
  const particleProgress = useSharedValue(0);

  useEffect(() => {
    if (!isActive || duration === 0) return;

    // Play impact sound when damage animation starts
    playImpactSound();

    const shakeIntensity = isLethal ? 12 : 8;
    const stepMs = 40;

    // Shake with hitstop
    shakeX.value = withDelay(
      HITSTOP_DURATION_MS,
      withSequence(
        withTiming(shakeIntensity, { duration: stepMs }),
        withTiming(-shakeIntensity, { duration: stepMs }),
        withTiming(shakeIntensity * 0.7, { duration: stepMs }),
        withTiming(-shakeIntensity * 0.7, { duration: stepMs }),
        withTiming(shakeIntensity * 0.4, { duration: stepMs }),
        withTiming(-shakeIntensity * 0.4, { duration: stepMs }),
        withTiming(0, { duration: stepMs }),
      ),
    );

    // Flash pulse
    flashProgress.value = withDelay(
      HITSTOP_DURATION_MS,
      withSequence(
        withTiming(isLethal ? 0.8 : 0.6, { duration: 60, easing: Easing.out(Easing.quad) }),
        withTiming(0.1, { duration: 150 }),
        withTiming(isLethal ? 0.5 : 0.3, { duration: 60 }),
        withTiming(0, { duration: duration * 0.4 }),
      ),
    );

    // Particles burst
    particleProgress.value = withDelay(
      HITSTOP_DURATION_MS,
      withSequence(
        withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 200 }),
      ),
    );

    const totalMs = HITSTOP_DURATION_MS + duration * 0.8;
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, totalMs);

    return () => {
      clearTimeout(timer);
      shakeX.value = 0;
      flashProgress.value = 0;
      particleProgress.value = 0;
    };
  }, [isActive, duration, isLethal]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  if (duration === 0) {
    return <>{children}</>;
  }

  const impactColor = getImpactColor(attackElement);
  const particleCount = isLethal ? 12 : 8;

  return (
    <Animated.View style={shakeStyle}>
      {children}
      {isActive && (
        <Suspense fallback={<FallbackFlash color={impactColor} />}>
          <LazySkiaFlashOverlay
            color={impactColor}
            flashProgress={flashProgress}
            particleProgress={particleProgress}
            particleCount={particleCount}
          />
        </Suspense>
      )}
      {isActive && damage != null && (
        <DamageNumber damage={damage} isLethal={isLethal} />
      )}
    </Animated.View>
  );
}

// Simple red flash fallback while Skia chunk loads (should be near-instant)
function FallbackFlash({ color }: { color: string }) {
  return (
    <View
      style={[styles.fallbackOverlay, { backgroundColor: color }]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  fallbackOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    opacity: 0.4,
  },
});
