import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./resources";

// Initialization is safe to run once.
export function initI18n(initialLanguage = "en") {
  if (i18n.isInitialized) return i18n;

  i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: "en",
    supportedLngs: Object.keys(resources),
    interpolation: { escapeValue: false },
    returnNull: false,
    returnEmptyString: false,
  });

  return i18n;
}

export default i18n;

