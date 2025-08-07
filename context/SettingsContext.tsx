import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CardSize = 'small' | 'normal';

interface SettingsContextType {
  cardSize: CardSize;
  setCardSize: (size: CardSize) => void;
  showBattleLog: boolean;
  setShowBattleLog: (show: boolean) => void;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = '@creature_nexus_settings';

interface Settings {
  cardSize: CardSize;
  showBattleLog: boolean;
}

const defaultSettings: Settings = {
  cardSize: 'small', // Default to small for better UX
  showBattleLog: false, // Disabled by default
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Load settings from storage on app start
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const setCardSize = (size: CardSize) => {
    const newSettings = { ...settings, cardSize: size };
    saveSettings(newSettings);
  };

  const setShowBattleLog = (show: boolean) => {
    const newSettings = { ...settings, showBattleLog: show };
    saveSettings(newSettings);
  };

  return (
    <SettingsContext.Provider value={{
      cardSize: settings.cardSize,
      setCardSize,
      showBattleLog: settings.showBattleLog,
      setShowBattleLog,
      loading,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};