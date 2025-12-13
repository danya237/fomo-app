import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en';
import uk from './uk';
import no from './no';
import de from './de';
import es from './es';
import it from './it';

const LANGUAGE_KEY = 'app_language';

const resources = {
  en: { translation: en },
  uk: { translation: uk },
  no: { translation: no },
  de: { translation: de },
  es: { translation: es },
  it: { translation: it },
};

const initI18n = async () => {
  let savedLanguage = 'en';
  
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (storedLanguage) {
      savedLanguage = storedLanguage;
    }
  } catch (error) {
    console.error('Error loading language:', error);
  }

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: savedLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
};

export const changeLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

initI18n();

export default i18n;
