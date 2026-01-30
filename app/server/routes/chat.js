import express from "express";
import { queryRag } from "../rag.js";
import axios from "axios";
const router = express.Router();


const shortMsg = (language, type) => {
  const map = {
    greeting: {
      en: "Ask your legal question.",
      hi: "अपना कानूनी प्रश्न पूछें।",
      mr: "तुमचा कायदेशीर प्रश्न विचारा.",
      gu: "તમારો કાનૂની પ્રશ્ન પૂછો.",
      pa: "ਆਪਣਾ ਕਾਨੂੰਨੀ ਸਵਾਲ ਪੁੱਛੋ।",
      ta: "உங்கள் சட்டக் கேள்வியை கேளுங்கள்.",
      te: "మీ చట్టపరమైన ప్రశ్న అడగండి.",
    },
    noContext: {
      en: "No relevant information found. Please rephrase with key details (place, time, section/act if known).",
      hi: "संबंधित जानकारी नहीं मिली। कृपया मुख्य विवरण (स्थान, समय, धारा/कानून) के साथ सवाल दोबारा लिखें।",
      mr: "संबंधित माहिती सापडली नाही. कृपया मुख्य तपशील (ठिकाण, वेळ, कलम/कायदा) देऊन प्रश्न पुन्हा विचारा.",
      gu: "સંબંધિત માહિતી મળી નથી. કૃપા કરીને મુખ્ય વિગતો (સ્થળ, સમય, કલમ/કાયદો) સાથે પ્રશ્ન ફરીથી લખો.",
      pa: "ਸੰਬੰਧਿਤ ਜਾਣਕਾਰੀ ਨਹੀਂ ਮਿਲੀ। ਕਿਰਪਾ ਕਰਕੇ ਮੁੱਖ ਵੇਰਵਿਆਂ (ਥਾਂ, ਸਮਾਂ, ਧਾਰਾ/ਕਾਨੂੰਨ) ਨਾਲ ਸਵਾਲ ਦੁਬਾਰਾ ਲਿਖੋ।",
      ta: "தொடர்புடைய தகவல் கிடைக்கவில்லை. இடம்/நேரம்/சட்ட பிரிவு போன்ற விவரங்களுடன் மீண்டும் கேளுங்கள்.",
      te: "సంబంధిత సమాచారం దొరకలేదు. స్థలం/సమయం/చట్ట విభాగం వంటి వివరాలతో మళ్లీ అడగండి.",
    },
  };
  return map[type]?.[language] || map[type]?.en || "";
};

function cleanToAnswerOnly(text) {
  const s = String(text || "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\r/g, "")
    .trim();

  // Drop common preambles/greetings if the model adds them anyway
  const lines = s.split("\n").map((l) => l.trim()).filter(Boolean);
  const badStarts = [
    /^hello\b/i,
    /^hi\b/i,
    /^namaste\b/i,
    /^नमस्ते\b/i,
    /^नमस्कार\b/i,
    /^sure\b/i,
    /^of course\b/i,
    /^here(?:'|’)s\b/i,
  ];
  const filtered = lines.filter((ln, idx) => !(idx === 0 && badStarts.some((re) => re.test(ln))));
  return filtered.join("\n");
}

function enforce7to10Lines(text) {
  const raw = cleanToAnswerOnly(text);
  let lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);

  // If model returns a paragraph, split into sentence-ish lines
  if (lines.length < 7) {
    const para = lines.join(" ");
    lines = para
      .split(/(?<=[.?!।])\s+/)
      .map((l) => l.trim())
      .filter(Boolean);
  }

  // Hard enforce 7–10
  if (lines.length > 10) lines = lines.slice(0, 10);
  while (lines.length < 7 && lines.length > 0) {
    // pad by splitting longer lines
    const longestIdx = lines.reduce((best, _, i) => (lines[i].length > lines[best].length ? i : best), 0);
    const l = lines[longestIdx];
    if (l.length < 80) break;
    const mid = Math.floor(l.length / 2);
    const cut = l.lastIndexOf(" ", mid);
    if (cut <= 0) break;
    lines.splice(longestIdx, 1, l.slice(0, cut).trim(), l.slice(cut + 1).trim());
    if (lines.length > 10) lines = lines.slice(0, 10);
  }
  return lines.slice(0, 10).join("\n");
}

function fallbackFromContext(context) {
  const clean = String(context || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  // Create 8 short lines from raw context (best-effort).
  const words = clean.split(" ");
  const lines = [];
  let buf = "";
  for (const w of words) {
    if ((buf + " " + w).trim().length > 110) {
      lines.push(buf.trim());
      buf = w;
      if (lines.length >= 10) break;
    } else {
      buf = (buf + " " + w).trim();
    }
  }
  if (buf && lines.length < 10) lines.push(buf.trim());
  return lines.slice(0, 10).join("\n");
}

// Check if prompt is a basic greeting or non-legal question
const isBasicGreeting = (prompt) => {
  const lower = String(prompt || "").toLowerCase().trim();
  // Remove punctuation so "hi!" still matches.
  const normalized = lower.replace(/[^\p{L}\p{N}\s]/gu, "").trim();

  const greetings = ["hi", "hello", "hey", "namaste", "namaskar", "hii", "hiii"];
  const basicQuestions = ["what is this", "who are you", "what can you do", "what do you do"];

  // Greetings should be short; avoid misclassifying real questions.
  const isShort = normalized.length <= 20;
  const isGreetingWord =
    greetings.some((g) => normalized === g || normalized.startsWith(g + " "));

  if (isShort && isGreetingWord) return true;
  if (basicQuestions.includes(normalized)) return true;
  return false;
};

const isNonLegalQuestion = (prompt, ragContext) => {
  if (ragContext && ragContext.trim().length > 0) return false;
  const lower = prompt.toLowerCase();
  const nonLegalKeywords = ["weather", "recipe", "joke", "story", "movie", "music", "sport", "game"];
  return nonLegalKeywords.some((keyword) => lower.includes(keyword));
};

router.post("/", async (req, res) => {
  try {
    const { prompt, language = "en", searchOnly } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing prompt" });
    }

    // Support "search only" calls for RAG clients
    if (searchOnly) {
      const rag = await queryRag(
        prompt,
        parseInt(process.env.RAG_TOP_K_RESULTS || "5", 10),
        { language }
      );
      return res.json({ results: rag.sources, confidence: rag.confidence });
    }

    // Handle basic greetings
    if (isBasicGreeting(prompt)) {
      return res.json({
        text: shortMsg(language, "greeting"),
        sources: [],
        confidence: 1.0,
        metadata: { language, type: "greeting" },
      });
    }

    const rag = await queryRag(prompt, parseInt(process.env.RAG_TOP_K_RESULTS || "5", 10), {
      language,
    });

    console.log(`[Chat] RAG result - context length: ${rag.context?.length || 0}, sources: ${rag.sources?.length || 0}`);

    // Check if non-legal question
    if (isNonLegalQuestion(prompt, rag.context)) {
      return res.json({
        text: getMultilingualResponse(language, "nonLegal"),
        sources: [],
        confidence: 0.5,
        metadata: { language, type: "nonLegal" },
      });
    }

    if (!rag.context || rag.context.trim().length === 0) {
      console.warn(`[Chat] No context found for query: "${prompt.substring(0, 50)}..."`);
      return res.json({
        text: shortMsg(language, "noContext"),
        sources: [],
        confidence: rag.confidence,
        metadata: { language, type: "noContext" },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        text: enforce7to10Lines(fallbackFromContext(rag.context)),
        sources: rag.sources,
        confidence: rag.confidence,
        metadata: { language, type: "fallback" },
      });
    }

    const languageName = rag?.metadata?.languageLabel || language;
    const finalContext = `Use ONLY the LEGAL CONTEXT below to answer the USER QUESTION.

Output rules (must follow):
- Write ONLY the answer (no greeting, no intro, no headings, no disclaimers)
- Exactly 7 to 10 lines total (use line breaks)
- Simple, easy language
- Write in ${languageName}

LEGAL CONTEXT:
${rag.context}

USER QUESTION:
${prompt}`;
    let text;
    try {
      const modelCandidates = (process.env.GEMINI_MODEL || "").trim()
        ? [process.env.GEMINI_MODEL.trim()]
        : ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];

      const apiVersion = (process.env.GEMINI_API_VERSION || "v1beta").trim() || "v1beta";

      let response;
      let lastErr;
      for (const m of modelCandidates) {
        try {
          response = await axios.post(
            `https://generativelanguage.googleapis.com/${apiVersion}/models/${m}:generateContent`,
            { contents: [{ parts: [{ text: finalContext }] }] },
            { params: { key: apiKey } }
          );
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
          const detail = e?.response?.data || e?.message || e;
          console.error(`[Chat] Gemini model failed (${m})`, detail);
        }
      }
      if (!response) throw lastErr;

      text =
        response?.data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        "I couldn't produce a reply.";
    } catch (modelErr) {
      const detail = modelErr?.response?.data || modelErr?.message || modelErr;
      console.error("[Chat] Gemini call failed; returning fallback", detail);
      text = fallbackFromContext(rag.context);
    }

    res.json({
      text: enforce7to10Lines(text),
      sources: rag.sources,
      confidence: rag.confidence,
      metadata: { language: language || "en" },
    });
  } catch (err) {
    const detail =
      err?.response?.data || err?.message || "Unknown error contacting model API";
    console.error("Chat route error", detail);
    res.status(500).json({
      error: "Chat service unavailable. Check server logs and API key.",
      detail,
    });
  }
});


export default router;