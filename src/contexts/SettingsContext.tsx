import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsContextType {
  hapticsEnabled: boolean;
  toggleHaptics: () => void;
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const HAPTICS_KEY = 'haptics_enabled';
const NOTIFICATIONS_KEY = 'notifications_enabled';

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const hapticsValue = await AsyncStorage.getItem(HAPTICS_KEY);
      if (hapticsValue !== null) {
        setHapticsEnabled(hapticsValue === 'true');
      }
      
      const notificationsValue = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (notificationsValue !== null) {
        setNotificationsEnabled(notificationsValue === 'true');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const toggleHaptics = async () => {
    const newValue = !hapticsEnabled;
    setHapticsEnabled(newValue);
    try {
      await AsyncStorage.setItem(HAPTICS_KEY, newValue.toString());
    } catch (error) {
      console.error('Error saving haptics setting:', error);
    }
  };

  const toggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, newValue.toString());
    } catch (error) {
      console.error('Error saving notifications setting:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ hapticsEnabled, toggleHaptics, notificationsEnabled, toggleNotifications }}>
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
