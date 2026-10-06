import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ru from "./src/translation/ru/translation.json";
import ro from "./src/translation/ro/translation.json";

const resources = {
  ru: { translation: ru },
  ro: { translation: ro },
};

const storedLanguage = localStorage.getItem("i18nextLng")?.split("-")[0];
const savedLanguage =
  { ita: "ro", it: "ro", en: "ru", ro: "ro", ru: "ru" }[storedLanguage] || "ro";

i18n
  .use(LanguageDetector) 
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage, 
    fallbackLng: "ru",
    supportedLngs: ["ro", "ru"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("i18nextLng", lng);
  document.documentElement.lang = lng;
});

document.documentElement.lang = savedLanguage;

export default i18n;
