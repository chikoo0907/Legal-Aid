require('dotenv').config();
const { CloudClient, ChromaClient } = require('chromadb');

class RAGService {
  constructor() {
    // Use ChromaDB Cloud client (equivalent to Python CloudClient)
    this.chromaClient = new CloudClient({
      apiKey: process.env.CHROMADB_API_KEY,
      tenant: process.env.CHROMADB_TENANT,
      database: process.env.CHROMADB_DATABASE || 'Nyayasahayak',
    });
    this.collection = null;
    this.initializeCollection();
  }

  async initializeCollection() {
    try {
      this.collection = await this.chromaClient.getOrCreateCollection({ name: 'legal' });
      console.log('ChromaDB collection initialized successfully');
    } catch (error) {
      console.error('Error initializing ChromaDB collection:', error);
      // Fallback to local client if cloud fails
      try {
        this.chromaClient = new ChromaClient({
          path: process.env.CHROMADB_PATH || 'http://localhost:8000',
        });
        this.collection = await this.chromaClient.getOrCreateCollection({ name: 'legal' });
        console.log('Fell back to local ChromaDB');
      } catch (fallbackError) {
        console.error('Error initializing local ChromaDB:', fallbackError);
      }
    }
  }

  async query(userQuery, language = 'en', context = {}) {
    try {
      // Check if collection is initialized
      if (!this.collection) {
        console.warn('ChromaDB collection not initialized, retrying...');
        await this.initializeCollection();
        if (!this.collection) {
          console.warn('ChromaDB collection still not available, continuing without RAG context');
          return {
            context: '',
            sources: [],
            confidence: 0.5,
            metadata: { language, ...context },
          };
        }
      }

      // Generate embeddings and search
      // Note: chromadb-default-embed is now installed
      const results = await this.collection.query({
        queryTexts: [userQuery],
        nResults: parseInt(process.env.RAG_TOP_K_RESULTS) || 5,
      });

      const sources = results.documents && results.documents[0] ? results.documents[0] : [];
      const contextText = sources.length > 0 ? sources.join('\n\n') : '';

      return {
        context: contextText,
        sources: sources.map((doc, index) => ({
          id: index,
          text: doc,
        })),
        confidence: 0.8,
        metadata: {
          language,
          ...context,
        },
      };
    } catch (error) {
      console.error('RAG Query Error:', error);
      // Return empty context on error
      return {
        context: '',
        sources: [],
        confidence: 0.5,
        metadata: { language, ...context },
      };
    }
  }
}

module.exports = new RAGService();

