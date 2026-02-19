/**
 * Translation API Client
 * Frontend service to translate static JSON & dynamic data via Gemini middleware
 */

import { API_URL } from "../config/api";

const BASE_URL = `${API_URL}/translate`;

/**
 * Translate a single payload (string or object)
 * @param {string|object} payload - Content to translate
 * @param {string} language - Target language code (hi, mr, gu, pa, ta, te)
 * @returns {Promise<{translated: any, language: string}>}
 */
export async function translatePayload(payload, language) {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload, language }),
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[TranslationAPI] translatePayload error:", error);
    // Return original payload on error
    return { translated: payload, language, fallback: true };
  }
}

/**
 * Batch translate multiple items efficiently
 * @param {Array} items - Array of items to translate
 * @param {string} language - Target language code
 * @param {number} batchSize - Items per API call (default: 5)
 * @returns {Promise<Array>} Translated items array
 */
export async function translateBatch(items, language, batchSize = 5) {
  try {
    const response = await fetch(`${BASE_URL}/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, language, batchSize }),
    });

    if (!response.ok) {
      throw new Error(`Batch translation failed: ${response.status}`);
    }

    const data = await response.json();
    return data.translated || items;
  } catch (error) {
    console.error("[TranslationAPI] translateBatch error:", error);
    return items; // Fallback to original
  }
}

/**
 * Pre-translate content for ALL 7 languages
 * Useful for static content that needs all language versions
 * @param {object} content - JSON content to translate
 * @returns {Promise<{en: object, hi: object, mr: object, ...}>}
 */
export async function translateToAllLanguages(content) {
  try {
    const response = await fetch(`${BASE_URL}/static`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`Static translation failed: ${response.status}`);
    }

    const data = await response.json();
    return data.translations;
  } catch (error) {
    console.error("[TranslationAPI] translateToAllLanguages error:", error);
    // Return content for all languages as fallback
    return {
      en: content,
      hi: content,
      mr: content,
      gu: content,
      pa: content,
      ta: content,
      te: content,
    };
  }
}

/**
 * Get translation service statistics
 * @returns {Promise<{cacheSize: number, rateLimitStatus: object}>}
 */
export async function getTranslationStats() {
  try {
    const response = await fetch(`${BASE_URL}/stats`);
    return await response.json();
  } catch (error) {
    console.error("[TranslationAPI] getStats error:", error);
    return null;
  }
}

/**
 * Get list of supported languages
 * @returns {Promise<Array<{id: string, name: string, nativeName: string}>>}
 */
export async function getSupportedLanguages() {
  try {
    const response = await fetch(`${BASE_URL}/languages`);
    const data = await response.json();
    return data.languages || [];
  } catch (error) {
    console.error("[TranslationAPI] getLanguages error:", error);
    return [];
  }
}

/**
 * Clear translation cache on server
 * @returns {Promise<{cleared: boolean}>}
 */
export async function clearTranslationCache() {
  try {
    const response = await fetch(`${BASE_URL}/clear-cache`, { method: "POST" });
    return await response.json();
  } catch (error) {
    console.error("[TranslationAPI] clearCache error:", error);
    return { cleared: false };
  }
}

export default {
  translatePayload,
  translateBatch,
  translateToAllLanguages,
  getTranslationStats,
  getSupportedLanguages,
  clearTranslationCache,
};
