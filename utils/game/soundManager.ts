import { createAudioPlayer } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';

class SoundManager {
  private sounds: Map<string, AudioPlayer> = new Map();
  private isEnabled: boolean = true;

  loadSound(name: string, source: any): void {
    try {
      const player = createAudioPlayer(source);
      this.sounds.set(name, player);
    } catch (error) {
      if (__DEV__) {
        console.warn(`Failed to load sound ${name}:`, error);
      }
    }
  }

  playSound(name: string): void {
    if (!this.isEnabled) return;

    try {
      const player = this.sounds.get(name);
      if (player) {
        // Reset to beginning and play
        player.seekTo(0);
        player.play();
      } else {
        if (__DEV__) {
          console.warn(`Sound ${name} not found`);
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.warn(`Failed to play sound ${name}:`, error);
      }
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  isAudioEnabled(): boolean {
    return this.isEnabled;
  }

  unloadAllSounds(): void {
    for (const [name, player] of this.sounds) {
      try {
        player.release();
      } catch (error) {
        if (__DEV__) {
          console.warn(`Failed to unload sound ${name}:`, error);
        }
      }
    }
    this.sounds.clear();
  }
}

// Create singleton instance
export const soundManager = new SoundManager();

// Initialize sounds
export const initializeSounds = (): void => {
  try {
    // Load impact sound
    soundManager.loadSound('impact', require('../../assets/impact.wav'));
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to initialize sounds:', error);
    }
  }
};

// Convenience function to play impact sound
export const playImpactSound = (): void => {
  soundManager.playSound('impact');
};