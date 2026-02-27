import express from "express";
import { PrismaClient } from "@prisma/client";
import { queryRag } from "../rag.js";
import axios from "axios";

const prisma = new PrismaClient();
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

  // If the model already returned a structured legal answer with sections,
  // keep the structure as-is (no line slicing).
  const hasSections = lines.some((l) =>
    /^(Legal Information|Latest Updates|Simplified Explanation|Important Note|Disclaimer)\b/i.test(l)
  );
  if (hasSections) {
    return raw;
  }

  // If model returns a paragraph, split into sentence-ish lines
  if (lines.length < 7) {
    const para = lines.join(" ");
    lines = para
      .split(/(?<=[.?!।])\s+/)
      .map((l) => l.trim())
      .filter(Boolean);
  }

  // Hard enforce 7–10 for simple answers
  if (lines.length > 10) lines = lines.slice(0, 10);
  while (lines.length < 7 && lines.length > 0) {
    const longestIdx = lines.reduce(
      (best, _, i) => (lines[i].length > lines[best].length ? i : best),
      0
    );
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
  if (!clean) {
    return [
      "Legal Information:",
      "- Information not available in the Legal Aid database.",
      "",
      "Latest Updates (if available):",
      "- No specific recent updates were found in the available information.",
      "",
      "Simplified Explanation:",
      "- We could not find detailed information for this question in the current database.",
      "",
      "Important Note:",
      "- Please rephrase your question with more details, or consult a qualified lawyer for specific advice.",
      "",
      "Disclaimer:",
      "- This is general legal information, not a substitute for advice from a qualified lawyer.",
    ].join("\n");
  }

  // Turn the raw context into a few short sentences
  const sentences = clean
    .split(/(?<=[.?!।])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);

  const legalInfoBullets = sentences.slice(0, 3).map((s) => `- ${s}`);
  const simplifiedBullets = sentences.slice(0, 3).map(
    (s) => `- In simple terms: ${s}`
  );

  return [
    "Legal Information:",
    ...(legalInfoBullets.length ? legalInfoBullets : ["- Key legal details are described in the available text."]),
    "",
    "Latest Updates (if available):",
    "- No specific recent updates were found in the available information.",
    "",
    "Simplified Explanation:",
    ...(simplifiedBullets.length
      ? simplifiedBullets
      : ["- This describes how the law applies in situations similar to your question."]),
    "",
    "Important Note:",
    "- This summary is based only on the available database text and may not cover your full situation.",
    "- For complex or urgent matters, you should speak to a qualified lawyer.",
    "",
    "Disclaimer:",
    "- This is general legal information based on the available sources, not a substitute for advice from a qualified lawyer.",
  ].join("\n");
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
    const { prompt, language = "en", searchOnly, userId } = req.body;

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

    const rag = await queryRag(
      prompt,
      parseInt(process.env.RAG_TOP_K_RESULTS || "5", 10),
      {
        language,
      }
    );

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
    const finalContext = `You are a Legal Aid Assistant.

You must follow ALL of these rules:
1. Use ONLY the information provided in the CONTEXT (Chroma database + any web search results the model retrieves).
2. Do NOT invent or guess new legal facts, sections, or case outcomes.
3. If required information is not present in the CONTEXT, clearly say: "Information not available in the Legal Aid database."
4. Keep the tone professional but simple and easy for a common person to understand.
5. Always include a clear legal disclaimer at the end.

STRUCTURE THE ANSWER EXACTLY LIKE THIS, USING POINTS:

Legal Information:
- Bullet points summarising the key legal rules, sections, or principles that are directly supported by the CONTEXT.

Latest Updates (if available):
- If the CONTEXT or web results mention recent changes, amendments, or new judgments, summarise them in 1–3 bullet points.
- If nothing is found, write: "No specific recent updates were found in the available information."

Simplified Explanation:
- 2–5 short bullet points explaining the situation in very simple language for a normal user.

Important Note:
- 1–3 bullet points with cautions, conditions, or things the user should be careful about, based ONLY on the CONTEXT.

Disclaimer:
- A short sentence like: "This is general legal information based on the available sources, not a substitute for advice from a qualified lawyer."

Write the full answer in ${languageName}.

CONTEXT (from Legal Aid database and any web search grounding):
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
            {
              contents: [{ parts: [{ text: finalContext }] }],
            },
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

    const finalText = enforce7to10Lines(text);

    // Persist chat if a valid userId is provided
    if (userId) {
      try {
        await prisma.chat.create({
          data: {
            userId,
            message: prompt,
            response: finalText,
          },
        });
      } catch (e) {
        console.error("[Chat] Failed to save chat record", e?.message || e);
      }
    }

    res.json({
      text: finalText,
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