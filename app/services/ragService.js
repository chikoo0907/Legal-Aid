import { api } from "./api";

class RAGService {
  async query(query, language = "en", context = {}) {
    try {
      const res = await api.post(`/chat`, {
        prompt: query,
        language,
        context,
      });
      return {
        answer: res.data?.text,
        sources: res.data?.sources || [],
        confidence: res.data?.confidence || 1.0,
        metadata: res.data?.metadata || {},
      };
    } catch (error) {
      console.error("RAG Service Error:", error?.response?.data || error);
      throw error;
    }
  }

  async searchLegalContent(query, language = "en") {
    try {
      const res = await api.post(`/chat`, {
        prompt: query,
        language,
        searchOnly: true,
      });
      return res.data?.results || [];
    } catch (error) {
      console.error("Legal Content Search Error:", error?.response?.data || error);
      return [];
    }
  }
}

export default new RAGService();
