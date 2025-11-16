// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./src/translation/en/translation.json";
import ita from "./src/translation/ita/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ita: { translation: ita },
    },
    lng: "en",
    fallbackLng: "en",
    supportedLngs: ["en", "ita"], 
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng", 
    },
  });

export default i18n;