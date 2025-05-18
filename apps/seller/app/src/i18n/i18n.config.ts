import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { en, bs } from "./translations";

const resources = {
  en: {
    translation: bs,
  },
  bs: {
    translation: en,
  },
};

i18next.use(initReactI18next).init({
  debug: true,
  lng: "en",
  compatibilityJSON: "v4",
  //language to use if translation in user language is not available
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
  resources: resources,
});

export default i18next;
