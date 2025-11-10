import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import es from './locales/es.json';
import th from './locales/th.json';
import lt from './locales/lt.json';
import pl from './locales/pl.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  th: { translation: th },
  lt: { translation: lt },
  pl: { translation: pl },
};

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Default language
    supportedLngs: ['en', 'es', 'th', 'lt', 'pl'],
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
