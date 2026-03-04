import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Volume2 } from 'lucide-react-native';
import Colors from '../constants/Colors';
import { t } from '@/utils/i18n';
import { useAudio } from '../hooks/useAudio';

export const AudioPermissionBanner: React.FC = () => {
  const { hasUserInteracted, settings, enableAudio, isPlaying } = useAudio();
  const [dismissed, setDismissed] = React.useState(false);

  // Show banner when:
  // 1. Platform is web (mobile apps don't need user interaction for audio) AND
  // 2. User hasn't interacted yet AND
  // 3. At least one audio feature is enabled (music OR sound effects)
  const shouldShow = Platform.OS === 'web' &&
                    !dismissed &&
                    !hasUserInteracted &&
                    !isPlaying &&
                    // Only prompt when background music is enabled (SFX are user-initiated)
                    settings.musicEnabled;

  if (!shouldShow) {
    return null;
  }

  const handleEnableAudio = async () => {
    await enableAudio();
  };
  
  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.banner}>
        <Volume2 size={20} color={Colors.accent[500]} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{t('audio.enableTitle')}</Text>
          <Text style={styles.subtitle}>{t('audio.enableSubtitle')}</Text>
        </View>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleEnableAudio}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{t('audio.enableButton')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.dismissButton}
          onPress={handleDismiss}
          accessibilityLabel="Dismiss audio banner"
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Text style={styles.dismissText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'transparent',
    zIndex: 2000,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass.surfaceSoft,
    borderColor: Colors.glass.borderStrong,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    shadowColor: Colors.glass.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 10,
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(14px)' } as any) : null),
    // Remove external margins; container handles positioning
  },
  dismissButton: {
    marginLeft: 8,
    paddingHorizontal: 6,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  dismissText: {
    fontSize: 18,
    color: Colors.text.secondary,
    fontWeight: '700',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  button: {
    backgroundColor: Colors.glass.accentGradientSoft,
    borderWidth: 1,
    borderColor: Colors.glass.borderStrong,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
});
