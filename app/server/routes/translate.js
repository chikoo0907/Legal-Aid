import express from "express";
import translationService from "../services/translationService.js";

const router = express.Router();

const SUPPORTED_LANGS = new Set(["en", "hi", "mr", "gu", "pa", "ta", "te"]);

function normalizeLanguage(lang) {
  const code = String(lang || "en").toLowerCase();
  return SUPPORTED_LANGS.has(code) ? code : "en";
}

/**
 * POST /translate
 * Basic translation endpoint
 * Body: { payload: string | object | array, language: string }
 */
router.post("/", async (req, res) => {
  try {
    const { payload, language } = req.body || {};
    if (payload === undefined || payload === null) {
      return res.status(400).json({ error: "Missing payload" });
    }

    const target = normalizeLanguage(language);

    // String payload
    if (typeof payload === "string") {
      const translated = await translationService.translateString(payload, target);
      return res.json({ translated, language: target });
    }

    // JSON payload (object/array)
    const translated = await translationService.translateJSON(payload, target);
    return res.json({ translated, language: target });
  } catch (err) {
    console.error("[Translate] route error", err?.message || err);
    return res.status(500).json({ error: "Translation failed", detail: err?.message });
  }
});

/**
 * POST /translate/batch
 * Efficiently translate multiple items in one request
 * Body: { items: array, language: string, batchSize?: number }
 */
router.post("/batch", async (req, res) => {
  try {
    const { items, language, batchSize = 5 } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Missing or empty items array" });
    }

    const target = normalizeLanguage(language);
    const translated = await translationService.translateBatch(items, target, { batchSize });
    
    return res.json({
      success: true,
      translated,
      language: target,
      count: translated.length,
    });
  } catch (err) {
    console.error("[Translate/batch] error", err?.message || err);
    return res.status(500).json({ error: "Batch translation failed", detail: err?.message });
  }
});

/**
 * POST /translate/static
 * Pre-translate static content for ALL 7 languages
 * Body: { content: object }
 * Returns: { en: {...}, hi: {...}, mr: {...}, ... }
 */
router.post("/static", async (req, res) => {
  try {
    const { content } = req.body || {};
    if (!content) {
      return res.status(400).json({ error: "Missing content" });
    }

    const translations = await translationService.preTranslateStatic(content);
    
    return res.json({
      success: true,
      translations,
      languages: Object.keys(translations),
    });
  } catch (err) {
    console.error("[Translate/static] error", err?.message || err);
    return res.status(500).json({ error: "Static translation failed", detail: err?.message });
  }
});

/**
 * GET /translate/stats
 * Get translation service statistics (cache size, rate limit status)
 */
router.get("/stats", (req, res) => {
  const stats = translationService.getTranslationStats();
  return res.json({ success: true, ...stats });
});

/**
 * POST /translate/clear-cache
 * Clear the translation cache
 */
router.post("/clear-cache", (req, res) => {
  const result = translationService.clearCache();
  return res.json({ success: true, ...result });
});

/**
 * GET /translate/languages
 * Get list of supported languages
 */
router.get("/languages", (req, res) => {
  return res.json({
    success: true,
    languages: [
      { id: "en", name: "English", nativeName: "English" },
      { id: "hi", name: "Hindi", nativeName: "हिन्दी" },
      { id: "mr", name: "Marathi", nativeName: "मराठी" },
      { id: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
      { id: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
      { id: "ta", name: "Tamil", nativeName: "தமிழ்" },
      { id: "te", name: "Telugu", nativeName: "తెలుగు" },
    ],
  });
});

export default router;

