import { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n, { initI18n } from "../i18n/i18n";
import { SUPPORTED_LANGUAGES } from "../i18n/resources";
import { getUser, updateUserLanguage } from "../services/api";
import { useAuth } from "./AuthContext";

const LanguageContext = createContext();

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

function normalizeLanguage(lng) {
  const supported = new Set(SUPPORTED_LANGUAGES.map((l) => l.id));
  if (supported.has(lng)) return lng;
  return "en";
}

export function LanguageProvider({ children }) {
  const { user, setUser } = useAuth();
  const [language, setLanguageState] = useState("en");
  const [ready, setReady] = useState(false);

  // Ensure i18n is initialized even before async bootstrap finishes.
  initI18n("en");

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function bootstrap() {
    try {
      let initial = user?.language || null;

      if (!initial) {
        const stored = await AsyncStorage.getItem("selectedLanguage");
        initial = stored || null;
      }

      initial = normalizeLanguage(initial || "en");

      setLanguageState(initial);
      await i18n.changeLanguage(initial);

      // If logged in, sync from DB (source of truth).
      if (user?.id) {
        try {
          const dbUser = await getUser(user.id);
          const dbLang = normalizeLanguage(dbUser?.language || "en");
          if (dbLang !== initial) {
            setLanguageState(dbLang);
            await i18n.changeLanguage(dbLang);
            await AsyncStorage.setItem("selectedLanguage", dbLang);
          }
          if (dbUser && (dbUser.language !== user.language || dbUser.name !== user.name || dbUser.phone !== user.phone)) {
            setUser((prev) => ({ ...(prev || {}), ...dbUser }));
          }
        } catch {
          // Ignore network errors during bootstrap; app still works with cached selection.
        }
      }
    } finally {
      setReady(true);
    }
  }

  async function setLanguage(next) {
    const lng = normalizeLanguage(next);
    setLanguageState(lng);
    await i18n.changeLanguage(lng);
    await AsyncStorage.setItem("selectedLanguage", lng);
    await AsyncStorage.setItem("hasSelectedLanguage", "true");

    if (user?.id) {
      const updated = await updateUserLanguage(user.id, lng);
      if (updated?.language) {
        setUser((prev) => ({ ...(prev || {}), language: updated.language }));
      }
    }
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      ready,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [language, ready]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

