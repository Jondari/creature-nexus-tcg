import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { formatTimeRemaining } from '../utils/cardUtils';
import Colors from '../constants/Colors';
import { t } from '@/utils/i18n';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface CountdownTimerProps {
  timeRemaining: number;
  onComplete?: () => void;
}

export default function CountdownTimer({ timeRemaining, onComplete }: CountdownTimerProps) {
  const [remainingTime, setRemainingTime] = useState(timeRemaining);
  const progress = useSharedValue(0);
  const onCompleteRef = useRef(onComplete);
  const completionNotifiedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setRemainingTime(timeRemaining);
    progress.value = 0;

    const notifyComplete = () => {
      if (completionNotifiedRef.current) return;
      completionNotifiedRef.current = true;
      onCompleteRef.current?.();
    };

    const updateProgress = (nextTime: number) => {
      const totalTime = 12 * 60 * 60 * 1000;
      const elapsed = totalTime - nextTime;
      const nextProgress = Math.max(0, Math.min(1, elapsed / totalTime));
      progress.value = withTiming(nextProgress, { duration: 500 });
    };

    if (timeRemaining > 0) {
      completionNotifiedRef.current = false;
      updateProgress(timeRemaining);
    } else {
      progress.value = withTiming(1, { duration: 500 });
      notifyComplete();
      return;
    }

    const interval = setInterval(() => {
      setRemainingTime((previousTime) => {
        const nextTime = Math.max(0, previousTime - 1000);
        updateProgress(nextTime);
        if (nextTime === 0) {
          clearInterval(interval);
          notifyComplete();
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);
  
  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('home.nextPack.title')}</Text>
      <Text style={styles.timer}>{formatTimeRemaining(remainingTime)}</Text>
      
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, progressBarStyle]} />
      </View>
      
      <Text style={styles.hint}>
        {remainingTime > 0 
          ? t('home.nextPack.comeBack')
          : t('home.nextPack.ready')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    backgroundColor: Colors.glass.surfaceSoft,
    borderWidth: 1,
    borderColor: Colors.glass.borderSoft,
    shadowColor: Colors.glass.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 9,
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(16px)' } as any) : null),
    borderRadius: 12,
    width: '90%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  timer: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.accent[500],
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 8,
    width: '100%',
    backgroundColor: Colors.background.primary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.accent[500],
  },
  hint: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  }
});
