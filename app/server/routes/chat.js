import express from "express";
import { getContext } from "../mcp.js";
import { queryRag } from "../rag.js";
import axios from "axios";
const router = express.Router();


// Multilingual responses
const getMultilingualResponse = (language, type) => {
  const responses = {
    greeting: {
      en: "Hello! I'm Nyayasahayak, your legal assistant. Ask me about your legal issues.",
      hi: "नमस्ते! मैं न्यायसहायक हूं, आपका कानूनी सहायक। अपने कानूनी मुद्दों के बारे में पूछें।",
      mr: "नमस्कार! मी न्यायसहायक आहे, तुमचा कायदेशीर सहाय्यक। तुमच्या कायदेशीर समस्यांबद्दल विचारा।",
      gu: "નમસ્તે! હું ન્યાયસહાયક છું, તમારો કાનૂની સહાયક. તમારા કાનૂની મુદ્દાઓ વિશે પૂછો.",
      pa: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਨਿਆਇਸਹਾਇਕ ਹਾਂ, ਤੁਹਾਡਾ ਕਾਨੂੰਨੀ ਸਹਾਇਕ। ਆਪਣੇ ਕਾਨੂੰਨੀ ਮੁੱਦਿਆਂ ਬਾਰੇ ਪੁੱਛੋ।",
      ta: "வணக்கம்! நான் நியாயஸஹாயக், உங்கள் சட்ட உதவியாளர். உங்கள் சட்ட பிரச்சினைகள் பற்றி கேளுங்கள்.",
      te: "నమస్కారం! నేను న్యాయసహాయక్, మీ చట్టపరమైన సహాయకుడు. మీ చట్టపరమైన సమస్యల గురించి అడగండి.",
    },
    nonLegal: {
      en: "I'm Nyayasahayak, your legal assistant. Please ask me only about legal issues and your rights.",
      hi: "मैं न्यायसहायक हूं, आपका कानूनी सहायक। कृपया मुझसे केवल कानूनी मुद्दों और आपके अधिकारों के बारे में पूछें।",
      mr: "मी न्यायसहायक आहे, तुमचा कायदेशीर सहाय्यक। कृपया मला फक्त कायदेशीर समस्यां आणि तुमच्या हक्कांबद्दल विचारा।",
      gu: "હું ન્યાયસહાયક છું, તમારો કાનૂની સહાયક. કૃપા કરીને મને ફક્ત કાનૂની મુદ્દાઓ અને તમારા અધિકારો વિશે પૂછો.",
      pa: "ਮੈਂ ਨਿਆਇਸਹਾਇਕ ਹਾਂ, ਤੁਹਾਡਾ ਕਾਨੂੰਨੀ ਸਹਾਇਕ। ਕਿਰਪਾ ਕਰਕੇ ਮੈਨੂੰ ਸਿਰਫ ਕਾਨੂੰਨੀ ਮੁੱਦਿਆਂ ਅਤੇ ਤੁਹਾਡੇ ਅਧਿਕਾਰਾਂ ਬਾਰੇ ਪੁੱਛੋ।",
      ta: "நான் நியாயஸஹாயக், உங்கள் சட்ட உதவியாளர். தயவுசெய்து சட்ட பிரச்சினைகள் மற்றும் உங்கள் உரிமைகள் பற்றி மட்டும் கேளுங்கள்.",
      te: "నేను న్యాయసహాయక్, మీ చట్టపరమైన సహాయకుడు. దయచేసి నన్ను చట్టపరమైన సమస్యలు మరియు మీ హక్కుల గురించి మాత్రమే అడగండి.",
    },
    noContext: {
      en: "I could not find relevant legal information in the knowledge base for your query. Please try rephrasing your question or check if the knowledge base has been updated.",
      hi: "मुझे आपके प्रश्न के लिए ज्ञान आधार में प्रासंगिक कानूनी जानकारी नहीं मिली। कृपया अपना प्रश्न फिर से लिखने का प्रयास करें।",
      mr: "तुमच्या प्रश्नासाठी ज्ञान आधारामध्ये प्रासंगिक कायदेशीर माहिती सापडली नाही. कृपया तुमचा प्रश्न पुन्हा लिहा.",
      gu: "તમારા પ્રશ્ન માટે જ્ઞાન આધારમાં સંબંધિત કાનૂની માહિતી મળી નથી. કૃપા કરીને તમારો પ્રશ્ન ફરીથી લખો.",
      pa: "ਤੁਹਾਡੇ ਸਵਾਲ ਲਈ ਗਿਆਨ ਅਧਾਰ ਵਿੱਚ ਸੰਬੰਧਿਤ ਕਾਨੂੰਨੀ ਜਾਣਕਾਰੀ ਨਹੀਂ ਮਿਲੀ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਸਵਾਲ ਦੁਬਾਰਾ ਲਿਖੋ।",
      ta: "உங்கள் கேள்விக்கு அறிவு தளத்தில் தொடர்புடைய சட்ட தகவல் கிடைக்கவில்லை. தயவுசெய்து உங்கள் கேள்வியை மீண்டும் எழுதவும்.",
      te: "మీ ప్రశ్నకు జ్ఞాన ఆధారంలో సంబంధిత చట్టపరమైన సమాచారం దొరకలేదు. దయచేసి మీ ప్రశ్నను మళ్లీ వ్రాయండి.",
    },
  };
  return responses[type]?.[language] || responses[type]?.en || "";
};

// Check if prompt is a basic greeting or non-legal question
const isBasicGreeting = (prompt) => {
  const lower = prompt.toLowerCase().trim();
  const greetings = ["hi", "hello", "hey", "namaste", "namaskar", "hii", "hiii"];
  const basicQuestions = ["what is this", "what is", "who are you", "what can you do"];
  return greetings.some((g) => lower === g || lower.startsWith(g + " ")) ||
    basicQuestions.some((q) => lower.includes(q));
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
        parseInt(process.env.RAG_TOP_K_RESULTS || "5", 10)
      );
      return res.json({ results: rag.sources, confidence: rag.confidence });
    }

    // Handle basic greetings
    if (isBasicGreeting(prompt)) {
      return res.json({
        text: getMultilingualResponse(language, "greeting"),
        sources: [],
        confidence: 1.0,
        metadata: { language, type: "greeting" },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        text: getMultilingualResponse(language, "nonLegal"),
        sources: [],
        confidence: 0.5,
      });
    }

    const rag = await queryRag(
      prompt,
      parseInt(process.env.RAG_TOP_K_RESULTS || "5", 10)
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
        text: getMultilingualResponse(language, "noContext"),
        sources: [],
        confidence: rag.confidence,
        metadata: { language, type: "noContext" },
      });
    }

    const langInstruction = language !== "en" ? ` Answer in ${language} language.` : "";
    const finalContext = `Use ONLY this legal context:\n${rag.context}\n\nQuestion:\n${prompt}\n\nAnswer in simple language within 10-12 lines. Keep it concise and user-friendly.${langInstruction}`;
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent",
      { contents: [{ parts: [{ text: finalContext }] }] },
      { params: { key: apiKey } }
    );

    const text =
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "I couldn't produce a reply.";

    res.json({
      text,
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