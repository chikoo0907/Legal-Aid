import { queryRag } from "./rag.js";

// Returns only Chroma-derived legal context; no external knowledge.
export async function getContext(prompt) {
  const { context } = await queryRag(prompt, 5);
  return context ? `Use this legal context:\n${context}` : "";
}