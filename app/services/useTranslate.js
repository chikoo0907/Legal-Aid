/**
 * useTranslate Hook
 * React hook for translating dynamic content using Gemini API middleware
 * Integrates with LanguageContext for automatic language detection
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { translatePayload, translateBatch } from "./translationApi";

// Local cache for translations during session
const sessionCache = new Map();

/**
 * Hook for translating dynamic content
 * @returns {object} Translation utilities
 */
export function useTranslate() {
  const { language } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);
  const abortControllerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Translate a single item (string or object)
   * @param {string|object} content - Content to translate
   * @param {string} targetLang - Override language (optional)
   * @returns {Promise<any>} Translated content
   */
  const translate = useCallback(
    async (content, targetLang) => {
      const lang = targetLang || language;
      
      // Skip if English or no content
      if (lang === "en" || !content) {
        return content;
      }

      // Check session cache
      const cacheKey = `${lang}:${JSON.stringify(content).slice(0, 50)}`;
      if (sessionCache.has(cacheKey)) {
        return sessionCache.get(cacheKey);
      }

      setIsTranslating(true);
      try {
        const result = await translatePayload(content, lang);
        const translated = result.translated || content;
        
        // Cache the result
        sessionCache.set(cacheKey, translated);
        
        return translated;
      } catch (error) {
        console.error("[useTranslate] Error:", error);
        return content; // Fallback to original
      } finally {
        setIsTranslating(false);
      }
    },
    [language]
  );

  /**
   * Translate multiple items efficiently
   * @param {Array} items - Items to translate
   * @param {string} targetLang - Override language (optional)
   * @returns {Promise<Array>} Translated items
   */
  const translateMany = useCallback(
    async (items, targetLang) => {
      const lang = targetLang || language;
      
      if (lang === "en" || !items?.length) {
        return items;
      }

      setIsTranslating(true);
      try {
        const translated = await translateBatch(items, lang);
        return translated;
      } catch (error) {
        console.error("[useTranslate] Batch error:", error);
        return items;
      } finally {
        setIsTranslating(false);
      }
    },
    [language]
  );

  /**
   * Get translated version of static data based on current language
   * @param {object} translatedData - Object with language keys { en: {...}, hi: {...} }
   * @returns {any} Content for current language
   */
  const getTranslated = useCallback(
    (translatedData) => {
      if (!translatedData) return null;
      return translatedData[language] || translatedData.en || translatedData;
    },
    [language]
  );

  /**
   * Clear session cache
   */
  const clearSessionCache = useCallback(() => {
    sessionCache.clear();
  }, []);

  return {
    translate,
    translateMany,
    getTranslated,
    clearSessionCache,
    isTranslating,
    currentLanguage: language,
  };
}

/**
 * Hook for translating a single value with automatic re-translation on language change
 * @param {string|object} content - Content to translate
 * @returns {[any, boolean]} [translated content, is loading]
 */
export function useTranslatedValue(content) {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState(content);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!content || language === "en") {
      setTranslated(content);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    translatePayload(content, language)
      .then((result) => {
        if (!cancelled) {
          setTranslated(result.translated || content);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTranslated(content);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [content, language]);

  return [translated, isLoading];
}

/**
 * Hook for translating an array with automatic re-translation on language change
 * @param {Array} items - Items to translate
 * @returns {[Array, boolean]} [translated items, is loading]
 */
export function useTranslatedArray(items) {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState(items || []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!items?.length || language === "en") {
      setTranslated(items || []);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    translateBatch(items, language)
      .then((result) => {
        if (!cancelled) {
          setTranslated(result || items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTranslated(items);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [items, language]);

  return [translated, isLoading];
}

export default useTranslate;
