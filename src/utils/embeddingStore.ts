import OpenAI from 'openai';
import { getOpenAIClient } from './openai';

interface DocumentChunk {
  content: string;
  metadata: {
    repoUrl: string;
    type: 'readme' | 'fileExplanation' | 'criticalAnalysis' | 'chatMessage';
    path?: string;
  };
  embedding?: number[];
}

interface SearchResult {
  content: string;
  metadata: DocumentChunk['metadata'];
  score: number;
}

// In-memory store for embeddings
let documents: DocumentChunk[] = [];

// Cosine similarity between two vectors
const cosineSimilarity = (a: number[], b: number[]): number => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Split text into chunks
const chunkText = (text: string, maxChunkSize: number = 500): string[] => {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/);
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    currentChunk += sentence + '. ';
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

// Get embedding for a text
const getEmbedding = async (text: string): Promise<number[]> => {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });
  return response.data[0].embedding;
};

// Add a document to the store
export const addDocument = async (doc: Omit<DocumentChunk, 'embedding'>) => {
  const chunks = chunkText(doc.content);
  
  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk);
    documents.push({
      content: chunk,
      metadata: doc.metadata,
      embedding,
    });
  }
};

// Search for similar documents
export const searchSimilar = async (query: string, limit: number = 5): Promise<SearchResult[]> => {
  const queryEmbedding = await getEmbedding(query);
  
  const results = documents
    .map(doc => ({
      content: doc.content,
      metadata: doc.metadata,
      score: cosineSimilarity(queryEmbedding, doc.embedding!)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return results;
};

// Remove documents by repository URL
export const removeDocuments = (repoUrl: string) => {
  documents = documents.filter(doc => doc.metadata.repoUrl !== repoUrl);
};

// Clear all documents
export const clearDocuments = () => {
  documents = [];
};

// Get the number of documents
export const getDocumentCount = () => documents.length;

// Save documents to localStorage
export const persistDocuments = () => {
  localStorage.setItem('github-analyzer-embeddings', JSON.stringify(documents));
};

// Load documents from localStorage
export const loadDocuments = () => {
  const stored = localStorage.getItem('github-analyzer-embeddings');
  if (stored) {
    documents = JSON.parse(stored);
  }
};
