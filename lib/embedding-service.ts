import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { embed } from 'ai';

// Initialize the Google Provider for AI SDK
// Uses the primary key, falls back to the secondary key if not available
const googleProvider = createGoogleGenerativeAI({ 
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY_2 
});

/**
 * Format book data into a single string for embedding.
 * Keeps the structure consistent with how we generate embeddings in scripts/generate-embeddings.ts.
 */
export function bookToText(book: { title: string; category?: string; age?: string; desc?: string }): string {
  return [
    book.title,
    book.category,
    book.age ? `untuk usia ${book.age}` : '',
    book.desc || '',
  ].filter(Boolean).join('. ');
}

/**
 * Generate a vector embedding from a given text string.
 * Uses gemini-embedding-001 to ensure consistency with existing embeddings.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const { embedding } = await embed({
      model: googleProvider.textEmbeddingModel('gemini-embedding-001'),
      value: text,
      maxRetries: 2,
    });
    
    return embedding;
  } catch (error) {
    console.error('🔴 Failed to generate embedding:', error);
    throw error;
  }
}

/**
 * Utility function to directly generate an embedding from a book object.
 */
export async function generateBookEmbedding(book: { title: string; category?: string; age?: string; desc?: string }): Promise<number[]> {
  const text = bookToText(book);
  return generateEmbedding(text);
}
