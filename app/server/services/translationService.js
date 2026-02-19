/**
 * Translation Service
 * Uses Gemini API (free tier) as middleware to translate:
 * - Static JSON files (every text field)
 * - Dynamic database/API data
 * Into 7 supported Indian languages with caching & rate limiting
 * 
 * EVERY line of text is made multilingual
 */

import axios from "axios";
import crypto from "crypto";

// Supported languages
export const SUPPORTED_LANGUAGES = ["en", "hi", "mr", "gu", "pa", "ta", "te"];

const LANGUAGE_NAMES = {
  en: "English",
  hi: "Hindi (हिन्दी)",
  mr: "Marathi (मराठी)",
  gu: "Gujarati (ગુજરાતી)",
  pa: "Punjabi (ਪੰਜਾਬੀ)",
  ta: "Tamil (தமிழ்)",
  te: "Telugu (తెలుగు)",
};

// Persistent cache (in-memory, use Redis/DB in production)
const translationCache = new Map();

// Fields that should NOT be translated (IDs, URLs, technical values)
const SKIP_FIELDS = new Set([
  "id", "_id", "userId", "documentId", "situation_id", "category",
  "url", "href", "src", "path", "email", "phone", "createdAt", "updatedAt",
  "official_references", "step", "mandatory", "can_be_done_without_lawyer"
]);

// Rate limiting for free tier (15 req/min)
const rateLimiter = {
  requests: [],
  maxRequests: 12, // Keep buffer for safety
  windowMs: 60000,
  
  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.windowMs);
    return this.requests.length < this.maxRequests;
  },
  
  recordRequest() {
    this.requests.push(Date.now());
  },
  
  async waitForSlot() {
    while (!this.canMakeRequest()) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

/**
 * Generate cache key for translation (using hash for large content)
 */
function getCacheKey(content, targetLang) {
  const str = typeof content === "string" ? content : JSON.stringify(content);
  const hash = crypto.createHash("md5").update(str).digest("hex").slice(0, 16);
  return `${targetLang}:${hash}`;
}

/**
 * Check if a field should be skipped from translation
 */
function shouldSkipField(key) {
  return SKIP_FIELDS.has(key) || 
         key.endsWith("Id") || 
         key.endsWith("_id") ||
         key.startsWith("http") ||
         key.endsWith("Url") ||
         key.endsWith("_url");
}

/**
 * Check if value looks like it should not be translated
 */
function shouldSkipValue(value) {
  if (typeof value !== "string") return true;
  if (!value.trim()) return true;
  // Skip URLs, emails, file paths
  if (/^https?:\/\//.test(value)) return true;
  if (/^[\w.-]+@[\w.-]+\.[a-z]{2,}$/i.test(value)) return true;
  if (/^[\w\/\\]+\.[a-z]{2,4}$/i.test(value)) return true;
  // Skip pure numbers or IDs
  if (/^[\d_-]+$/.test(value)) return true;
  return false;
}

/**
 * Extract all translatable strings from an object
 */
function extractStrings(obj, parentKey = "") {
  const strings = [];
  const paths = [];
  
  function traverse(current, path) {
    if (Array.isArray(current)) {
      current.forEach((item, index) => {
        traverse(item, `${path}[${index}]`);
      });
    } else if (current && typeof current === "object") {
      Object.entries(current).forEach(([key, value]) => {
        if (!shouldSkipField(key)) {
          traverse(value, path ? `${path}.${key}` : key);
        }
      });
    } else if (typeof current === "string" && !shouldSkipValue(current)) {
      strings.push(current);
      paths.push(path);
    }
  }
  
  traverse(obj, parentKey);
  return { strings, paths };
}

/**
 * Rebuild object with translated strings
 */
function rebuildWithTranslations(original, paths, translations) {
  // Deep clone
  const result = JSON.parse(JSON.stringify(original));
  
  paths.forEach((path, index) => {
    setValueAtPath(result, path, translations[index]);
  });
  
  return result;
}

/**
 * Set value at a path like "a.b[0].c"
 */
function setValueAtPath(obj, path, value) {
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const key = /^\d+$/.test(part) ? parseInt(part) : part;
    current = current[key];
  }
  
  const lastPart = parts[parts.length - 1];
  const lastKey = /^\d+$/.test(lastPart) ? parseInt(lastPart) : lastPart;
  current[lastKey] = value;
}

/**
 * Call Gemini API for translation
 */
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  await rateLimiter.waitForSlot();
  rateLimiter.recordRequest();

  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash"];
  const apiVersion = process.env.GEMINI_API_VERSION || "v1beta";
  
  let lastErr;
  for (const model of models) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { params: { key: apiKey }, timeout: 30000 }
      );
      return response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    } catch (e) {
      lastErr = e;
      if (e.response?.status !== 404) break; // Only retry on model not found
    }
  }
  throw lastErr || new Error("Gemini API call failed");
}

/**
 * Translate a simple string
 */
export async function translateString(text, targetLang) {
  if (!text || targetLang === "en") return text;
  
  const cacheKey = getCacheKey(text, targetLang);
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  const langName = LANGUAGE_NAMES[targetLang] || targetLang;
  const prompt = `Translate this text to ${langName}. 
Rules:
- Use simple, clear language for Indian users
- Preserve legal/technical terms accurately
- Return ONLY the translated text, nothing else

Text: ${text}`;

  try {
    const translated = await callGemini(prompt);
    translationCache.set(cacheKey, translated);
    return translated;
  } catch (err) {
    console.error("[Translation] String translation failed:", err.message);
    return text; // Fallback to original
  }
}

/**
 * Translate a JSON object - EVERY text field becomes multilingual
 * Uses string extraction for better accuracy and efficiency
 */
export async function translateJSON(obj, targetLang) {
  if (!obj || targetLang === "en") return obj;
  
  const cacheKey = getCacheKey(obj, targetLang);
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  // Extract all translatable strings
  const { strings, paths } = extractStrings(obj);
  
  if (strings.length === 0) {
    return obj;
  }

  // Translate all strings in batches
  const translatedStrings = await translateStringArray(strings, targetLang);
  
  // Rebuild object with translations
  const translated = rebuildWithTranslations(obj, paths, translatedStrings);
  
  translationCache.set(cacheKey, translated);
  return translated;
}

/**
 * Translate an array of strings efficiently
 */
async function translateStringArray(strings, targetLang) {
  if (!strings.length) return [];
  
  const langName = LANGUAGE_NAMES[targetLang] || targetLang;
  
  // For small arrays, translate directly
  if (strings.length <= 20) {
    return await translateStringsInOneCall(strings, langName);
  }
  
  // For larger arrays, batch them
  const results = [];
  const batchSize = 15;
  
  for (let i = 0; i < strings.length; i += batchSize) {
    const batch = strings.slice(i, i + batchSize);
    const translated = await translateStringsInOneCall(batch, langName);
    results.push(...translated);
  }
  
  return results;
}

/**
 * Translate strings array in a single API call
 */
async function translateStringsInOneCall(strings, langName) {
  // Check cache for each string first
  const toTranslate = [];
  const results = new Array(strings.length);
  const indexMap = [];
  
  for (let i = 0; i < strings.length; i++) {
    const cacheKey = getCacheKey(strings[i], langName);
    if (translationCache.has(cacheKey)) {
      results[i] = translationCache.get(cacheKey);
    } else {
      toTranslate.push(strings[i]);
      indexMap.push(i);
    }
  }
  
  if (toTranslate.length === 0) {
    return results;
  }
  
  const prompt = `Translate each line to ${langName}. Return ONLY the translations, one per line, in the same order.

Rules:
- Simple, clear language for Indian citizens
- Preserve legal/technical terms
- One translation per line
- No numbering, no extra text

Texts to translate:
${toTranslate.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;

  try {
    const raw = await callGemini(prompt);
    const lines = raw.split("\n")
      .map(l => l.replace(/^\d+\.\s*/, "").trim())
      .filter(l => l.length > 0);
    
    // Map translations back
    for (let i = 0; i < indexMap.length; i++) {
      const translated = lines[i] || toTranslate[i];
      results[indexMap[i]] = translated;
      
      // Cache individual strings
      const cacheKey = getCacheKey(toTranslate[i], langName);
      translationCache.set(cacheKey, translated);
    }
    
    return results;
  } catch (err) {
    console.error("[Translation] String array failed:", err.message);
    // Return original strings on failure
    for (let i = 0; i < indexMap.length; i++) {
      results[indexMap[i]] = toTranslate[i];
    }
    return results;
  }
}

/**
 * Batch translate multiple items efficiently
 * Groups items to minimize API calls
 */
export async function translateBatch(items, targetLang, options = {}) {
  if (!items?.length || targetLang === "en") return items;
  
  const { batchSize = 5 } = options;
  const results = [];
  
  // Process in batches to optimize API calls
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    // Check cache for each item first
    const toTranslate = [];
    const cachedResults = [];
    
    for (const item of batch) {
      const cacheKey = getCacheKey(item, targetLang);
      if (translationCache.has(cacheKey)) {
        cachedResults.push({ item, translated: translationCache.get(cacheKey), cached: true });
      } else {
        toTranslate.push(item);
      }
    }
    
    // Translate uncached items as one batch
    if (toTranslate.length > 0) {
      const langName = LANGUAGE_NAMES[targetLang] || targetLang;
      const batchJson = JSON.stringify(toTranslate, null, 2);
      
      const prompt = `Translate ALL human-readable strings in this JSON array to ${langName}.

RULES:
1. Return a JSON array with the SAME structure
2. Translate string values only (not keys, numbers, URLs)
3. Use simple language for Indian users
4. Return ONLY valid JSON array

JSON:
${batchJson}`;

      try {
        const raw = await callGemini(prompt);
        let cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const translatedBatch = JSON.parse(cleaned);
        
        // Cache each translated item
        for (let j = 0; j < toTranslate.length; j++) {
          const cacheKey = getCacheKey(toTranslate[j], targetLang);
          translationCache.set(cacheKey, translatedBatch[j]);
          cachedResults.push({ item: toTranslate[j], translated: translatedBatch[j], cached: false });
        }
      } catch (err) {
        console.error("[Translation] Batch translation failed:", err.message);
        // Fallback to original items
        for (const item of toTranslate) {
          cachedResults.push({ item, translated: item, cached: false, fallback: true });
        }
      }
    }
    
    // Maintain original order
    for (const item of batch) {
      const result = cachedResults.find(r => r.item === item);
      results.push(result?.translated || item);
    }
  }
  
  return results;
}

/**
 * Pre-translate static content for ALL 7 languages
 * Every single text field is translated
 * Run this during build/deploy to cache translations
 */
export async function preTranslateStatic(content, options = {}) {
  const { excludeLangs = ["en"] } = options;
  const targetLangs = SUPPORTED_LANGUAGES.filter(l => !excludeLangs.includes(l));
  
  const translations = { en: content };
  
  console.log(`[Translation] Starting pre-translation for ${targetLangs.length} languages...`);
  
  for (const lang of targetLangs) {
    console.log(`[Translation] Translating to ${LANGUAGE_NAMES[lang]}...`);
    try {
      translations[lang] = await translateJSON(content, lang);
      console.log(`[Translation] ✓ ${lang} completed`);
    } catch (err) {
      console.error(`[Translation] ✗ ${lang} failed:`, err.message);
      translations[lang] = content; // Fallback to English
    }
    // Delay between languages to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log(`[Translation] All languages completed!`);
  return translations;
}

/**
 * Translate ALL static JSON files and save multilingual versions
 * @param {object} jsonData - Original JSON data
 * @returns {object} Object with all 7 language versions
 */
export async function makeMultilingual(jsonData) {
  return await preTranslateStatic(jsonData);
}

/**
 * Deep translate: Ensures EVERY text field is translated
 * More thorough than translateJSON for complex nested structures
 */
export async function deepTranslate(obj, targetLang) {
  if (!obj || targetLang === "en") return obj;
  
  const cacheKey = `deep:${getCacheKey(obj, targetLang)}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }
  
  const result = await translateJSON(obj, targetLang);
  translationCache.set(cacheKey, result);
  return result;
}

/**
 * Get translation stats (for monitoring)
 */
export function getTranslationStats() {
  return {
    cacheSize: translationCache.size,
    rateLimitStatus: {
      requestsInWindow: rateLimiter.requests.length,
      maxRequests: rateLimiter.maxRequests,
      available: rateLimiter.maxRequests - rateLimiter.requests.length,
    },
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}

/**
 * Clear translation cache (useful for updates)
 */
export function clearCache() {
  translationCache.clear();
  return { cleared: true, timestamp: new Date().toISOString() };
}

export default {
  translateString,
  translateJSON,
  translateBatch,
  preTranslateStatic,
  getTranslationStats,
  clearCache,
  SUPPORTED_LANGUAGES,
};
