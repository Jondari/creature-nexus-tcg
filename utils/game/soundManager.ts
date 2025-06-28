import { Audio } from 'expo-av';

class SoundManager {
  private sounds: Map<string, Audio.Sound> = new Map();
  private isEnabled: boolean = true;

  async loadSound(name: string, source: any): Promise<void> {
    try {
      const { sound } = await Audio.Sound.createAsync(source, {
        shouldPlay: false,
        isLooping: false,
      });
      this.sounds.set(name, sound);
    } catch (error) {
      console.warn(`Failed to load sound ${name}:`, error);
    }
  }

  async playSound(name: string): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const sound = this.sounds.get(name);
      if (sound) {
        // Reset to beginning and play
        await sound.setPositionAsync(0);
        await sound.playAsync();
      } else {
        console.warn(`Sound ${name} not found`);
      }
    } catch (error) {
      console.warn(`Failed to play sound ${name}:`, error);
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  isAudioEnabled(): boolean {
    return this.isEnabled;
  }

  async unloadAllSounds(): Promise<void> {
    for (const [name, sound] of this.sounds) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.warn(`Failed to unload sound ${name}:`, error);
      }
    }
    this.sounds.clear();
  }
}

// Create singleton instance
export const soundManager = new SoundManager();

// Initialize sounds
export const initializeSounds = async (): Promise<void> => {
  try {
    // Set audio mode for better mobile compatibility
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // Load impact sound
    await soundManager.loadSound('impact', require('../../assets/impact.wav'));
    
    console.log('Sounds initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize sounds:', error);
  }
};

// Convenience function to play impact sound
export const playImpactSound = (): void => {
  soundManager.playSound('impact');
};