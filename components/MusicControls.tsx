import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Volume2, VolumeX, Music, Minus, Plus } from 'lucide-react-native';
import Colors from '../constants/Colors';
import { useAudio } from '../hooks/useAudio';

interface MusicControlsProps {
  showCurrentTrack?: boolean;
}

export const MusicControls: React.FC<MusicControlsProps> = ({ showCurrentTrack = true }) => {
  const { 
    settings, 
    currentMusicType, 
    isPlaying,
    setMusicEnabled,
    setSoundEffectsEnabled,
    setMusicVolume,
    setSoundEffectsVolume
  } = useAudio();

  const handleMusicVolumeChange = (delta: number) => {
    const newVolume = Math.max(0, Math.min(1, settings.musicVolume + delta));
    setMusicVolume(newVolume);
  };

  const handleSoundEffectsVolumeChange = (delta: number) => {
    const newVolume = Math.max(0, Math.min(1, settings.soundEffectsVolume + delta));
    setSoundEffectsVolume(newVolume);
  };

  const handleMusicToggle = (value: boolean) => {
    setMusicEnabled(value);
  };

  const handleSoundEffectsToggle = (value: boolean) => {
    setSoundEffectsEnabled(value);
  };

  const getMusicTypeLabel = () => {
    if (!currentMusicType) return 'No music';
    return currentMusicType === 'battle' ? 'Battle Music' : 'Background Music';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Settings</Text>
      
      {/* Music Enable/Disable */}
      <View style={styles.settingRow}>
        <View style={styles.settingLabel}>
          <Music size={20} color={Colors.text.primary} />
          <Text style={styles.labelText}>Background Music</Text>
        </View>
        <Switch
          value={settings.musicEnabled}
          onValueChange={handleMusicToggle}
          trackColor={{ 
            false: Colors.neutral[700], 
            true: Colors.accent[600] 
          }}
          thumbColor={settings.musicEnabled ? Colors.accent[500] : Colors.neutral[400]}
        />
      </View>

      {/* Music Volume Control */}
      {settings.musicEnabled && (
        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            {settings.musicVolume === 0 ? (
              <VolumeX size={20} color={Colors.text.secondary} />
            ) : (
              <Volume2 size={20} color={Colors.text.primary} />
            )}
            <Text style={styles.labelText}>Music Volume</Text>
          </View>
          <View style={styles.volumeContainer}>
            <TouchableOpacity 
              style={styles.volumeButton}
              onPress={() => handleMusicVolumeChange(-0.1)}
              disabled={settings.musicVolume <= 0}
            >
              <Minus size={16} color={settings.musicVolume <= 0 ? Colors.text.secondary : Colors.text.primary} />
            </TouchableOpacity>
            
            <View style={styles.volumeDisplay}>
              <Text style={styles.volumeText}>
                {Math.round(settings.musicVolume * 100)}%
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.volumeButton}
              onPress={() => handleMusicVolumeChange(0.1)}
              disabled={settings.musicVolume >= 1}
            >
              <Plus size={16} color={settings.musicVolume >= 1 ? Colors.text.secondary : Colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Sound Effects Enable/Disable */}
      <View style={styles.settingRow}>
        <View style={styles.settingLabel}>
          <Volume2 size={20} color={Colors.text.primary} />
          <Text style={styles.labelText}>Sound Effects</Text>
        </View>
        <Switch
          value={settings.soundEffectsEnabled}
          onValueChange={handleSoundEffectsToggle}
          trackColor={{ 
            false: Colors.neutral[700], 
            true: Colors.accent[600] 
          }}
          thumbColor={settings.soundEffectsEnabled ? Colors.accent[500] : Colors.neutral[400]}
        />
      </View>

      {/* Sound Effects Volume Control */}
      {settings.soundEffectsEnabled && (
        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            {settings.soundEffectsVolume === 0 ? (
              <VolumeX size={20} color={Colors.text.secondary} />
            ) : (
              <Volume2 size={20} color={Colors.text.primary} />
            )}
            <Text style={styles.labelText}>Effects Volume</Text>
          </View>
          <View style={styles.volumeContainer}>
            <TouchableOpacity 
              style={styles.volumeButton}
              onPress={() => handleSoundEffectsVolumeChange(-0.1)}
              disabled={settings.soundEffectsVolume <= 0}
            >
              <Minus size={16} color={settings.soundEffectsVolume <= 0 ? Colors.text.secondary : Colors.text.primary} />
            </TouchableOpacity>
            
            <View style={styles.volumeDisplay}>
              <Text style={styles.volumeText}>
                {Math.round(settings.soundEffectsVolume * 100)}%
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.volumeButton}
              onPress={() => handleSoundEffectsVolumeChange(0.1)}
              disabled={settings.soundEffectsVolume >= 1}
            >
              <Plus size={16} color={settings.soundEffectsVolume >= 1 ? Colors.text.secondary : Colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Current Track Info */}
      {showCurrentTrack && settings.musicEnabled && (
        <View style={styles.currentTrack}>
          <Text style={styles.currentTrackLabel}>Now Playing:</Text>
          <Text style={[
            styles.currentTrackText, 
            { color: isPlaying ? Colors.accent[500] : Colors.text.secondary }
          ]}>
            {getMusicTypeLabel()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  labelText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 8,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  volumeButton: {
    backgroundColor: Colors.background.primary,
    borderRadius: 6,
    padding: 8,
    marginHorizontal: 4,
  },
  volumeDisplay: {
    backgroundColor: Colors.background.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 8,
    minWidth: 50,
  },
  volumeText: {
    fontSize: 14,
    color: Colors.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  currentTrack: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[700],
  },
  currentTrackLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  currentTrackText: {
    fontSize: 14,
    fontWeight: '500',
  },
});