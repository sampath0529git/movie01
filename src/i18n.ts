import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import si from './locales/si.json';
import es from './locales/es.json';
import de from './locales/de.json';

const resources = {
  US: { translation: en },
  GB: { translation: en }, // UK English uses the same base translation
  LK: { translation: si },
  ES: { translation: es },
  DE: { translation: de }
  // We can add FR, IT, PT, NL, SE json files later, 
  // for now they will fallback to US English.
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'US', // default language
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
