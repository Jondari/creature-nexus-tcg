import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Volume2 } from 'lucide-react-native';
import Colors from '../constants/Colors';
import { useAudio } from '../hooks/useAudio';

export const AudioPermissionBanner: React.FC = () => {
  const { hasUserInteracted, settings, enableAudio, isPlaying } = useAudio();

  // Show banner when:
  // 1. Platform is web (mobile apps don't need user interaction for audio) AND
  // 2. User hasn't interacted yet AND
  // 3. At least one audio feature is enabled (music OR sound effects)
  const shouldShow = Platform.OS === 'web' &&
                    !hasUserInteracted &&
                    !isPlaying &&
                    (settings.musicEnabled || settings.soundEffectsEnabled);

  if (!shouldShow) {
    return null;
  }

  const handleEnableAudio = async () => {
    await enableAudio();
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.banner}>
        <Volume2 size={20} color={Colors.accent[500]} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Enable Audio</Text>
          <Text style={styles.subtitle}>Tap to enable background music and sound effects</Text>
        </View>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleEnableAudio}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Enable</Text>
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
    backgroundColor: Colors.background.card,
    borderColor: Colors.accent[500],
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    // Remove external margins; container handles positioning
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
    backgroundColor: Colors.accent[500],
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
