import axios from "axios";


export async function geminiAsk(prompt, language) {
const fullPrompt = `Answer in simple ${language} language:
${prompt}`;
const res = await axios.post(
"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent",
{ contents: [{ parts: [{ text: fullPrompt }] }] },
{ params: { key: process.env.GEMINI_API_KEY } }
);
return res.data.candidates[0].content.parts[0].text;
}