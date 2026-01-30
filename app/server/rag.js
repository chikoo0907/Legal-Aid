import { getChroma } from "./chroma.js";

const collectionCache = new Map(); // name -> collection
const collectionInitCache = new Map(); // name -> Promise<collection>

function getCollectionNames() {
  const raw =
    (process.env.CHROMADB_COLLECTIONS || "").trim() ||
    (process.env.CHROMADB_COLLECTION || "").trim() ||
    "legal,legal-knowledge-base";

  const names = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Deduplicate while preserving order
  return [...new Set(names)];
}

function getTopK(fallback = 5) {
  const n = Number.parseInt(process.env.RAG_TOP_K_RESULTS || "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function languageLabel(languageCode) {
  const map = {
    en: "English",
    hi: "Hindi",
    mr: "Marathi",
    gu: "Gujarati",
    pa: "Punjabi",
    ta: "Tamil",
    te: "Telugu",
  };
  return map[languageCode] || "English";
}

async function initCollection(name) {
  const chroma = await getChroma();

  // We intentionally avoid pulling in local embedding dependencies here.
  // If your collection was created with an embedding function (common in Chroma Cloud),
  // `queryTexts` will still work. If not, you can switch to `queryEmbeddings` later.
  const col = await chroma.getOrCreateCollection({ name });
  collectionCache.set(name, col);
  return col;
}

async function getCollection(name) {
  if (collectionCache.has(name)) return collectionCache.get(name);
  if (!collectionInitCache.has(name)) {
    collectionInitCache.set(name, initCollection(name));
  }
  return await collectionInitCache.get(name);
}

function normalizeSources(results, collectionName) {
  const docs = results?.documents?.[0] || [];
  const metadatas = results?.metadatas?.[0] || [];
  const distances = results?.distances?.[0] || [];
  const ids = results?.ids?.[0] || [];

  return docs.map((text, i) => ({
    id: ids[i] ?? String(i),
    text,
    metadata: metadatas[i] ?? null,
    distance: typeof distances[i] === "number" ? distances[i] : null,
    collection: collectionName,
  }));
}

export async function queryRag(userQuery, topK = getTopK(), opts = {}) {
  const q = typeof userQuery === "string" ? userQuery.trim() : "";
  if (!q) {
    return { context: "", sources: [], confidence: 0.5, metadata: { ...opts } };
  }

  try {
    const names = Array.isArray(opts.collections) && opts.collections.length > 0
      ? opts.collections
      : getCollectionNames();

    const perCollectionK = Math.max(
      1,
      Math.ceil((Number.isFinite(topK) && topK > 0 ? topK : getTopK()) / Math.max(1, names.length))
    );

    const all = [];
    for (const name of names) {
      try {
        const col = await getCollection(name);
        const results = await col.query({
          queryTexts: [q],
          nResults: perCollectionK,
          include: ["documents", "metadatas", "distances"],
        });
        all.push(...normalizeSources(results, name));
      } catch (e) {
        console.error(`[RAG] query failed for collection "${name}":`, e?.message || e);
      }
    }

    const sources = all
      .filter((s) => s?.text)
      .sort((a, b) => {
        const da = typeof a.distance === "number" ? a.distance : Number.POSITIVE_INFINITY;
        const db = typeof b.distance === "number" ? b.distance : Number.POSITIVE_INFINITY;
        return da - db;
      })
      .slice(0, Number.isFinite(topK) && topK > 0 ? topK : getTopK());

    const context = sources.map((s) => s.text).join("\n\n");

    // If distances exist, smaller is better. Use a simple heuristic.
    const bestDistance =
      sources.find((s) => typeof s.distance === "number")?.distance ?? null;
    const confidence =
      typeof bestDistance === "number"
        ? Math.max(0.3, Math.min(0.95, 1 / (1 + bestDistance)))
        : sources.length > 0
          ? 0.75
          : 0.5;

    return {
      context,
      sources,
      confidence,
      metadata: {
        collections: names,
        language: opts.language || "en",
        languageLabel: languageLabel(opts.language || "en"),
        ...opts,
      },
    };
  } catch (error) {
    console.error("[RAG] query failed:", error?.message || error);
    return { context: "", sources: [], confidence: 0.5, metadata: { ...opts } };
  }
}

