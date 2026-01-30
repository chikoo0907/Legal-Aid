import { CloudClient, ChromaClient } from "chromadb";

let chroma;
let initPromise;

async function initChroma() {
  // Cloud first (like Nyaysahayak), then fallback to local
  try {
    if (process.env.CHROMADB_API_KEY && process.env.CHROMADB_TENANT) {
      const cloud = new CloudClient({
        apiKey: process.env.CHROMADB_API_KEY,
        tenant: process.env.CHROMADB_TENANT,
        database: process.env.CHROMADB_DATABASE || "Nyayasahayak",
      });
      chroma = cloud;
      return chroma;
    }
  } catch (e) {
    console.error("Chroma cloud init failed, falling back to local:", e);
  }

  const local = new ChromaClient({
    path: process.env.CHROMADB_PATH || "http://localhost:8000",
  });
  chroma = local;
  return chroma;
}

export async function getChroma() {
  if (chroma) return chroma;
  if (!initPromise) initPromise = initChroma();
  return await initPromise;
}