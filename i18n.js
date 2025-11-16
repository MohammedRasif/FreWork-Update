import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./src/translation/en/translation.json";
import ita from "./src/translation/ita/translation.json";

const resources = {
  en: { translation: en },
  ita: { translation: ita },
};

const savedLanguage = localStorage.getItem("i18nextLng") || "en";

i18n
  .use(LanguageDetector) 
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage, 
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["local strickenStorage", "navigator"], 
      caches: ["localStorage"],
    },
  });

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("i18nextLng", lng);
});

export default i18n;