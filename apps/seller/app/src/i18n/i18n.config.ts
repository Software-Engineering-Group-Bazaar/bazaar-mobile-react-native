import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import {en} from "../../../../seller/app/src/i18n/translations";
import {bs} from "../../../../seller/app/src/i18n/translations";
import {de} from "../../../../seller/app/src/i18n/translations";
import {es} from "../../../../seller/app/src/i18n/translations";

const resources = {
  en: {
    translation: en,
  },
  bs: {
    translation: bs,
  },
  de: {
    translation: de,
  },
  es: {
    translation: es
  }
};

i18next.use(initReactI18next).init({
  debug: true,
  lng: "bs",
  compatibilityJSON: "v4",
  //language to use if translation in user language is not available
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
  resources: resources,
});

export default i18next;
