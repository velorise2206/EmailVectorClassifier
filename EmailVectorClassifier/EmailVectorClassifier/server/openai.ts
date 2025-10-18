// Blueprint reference: javascript_openai
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY must be set");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate embedding vector for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  } catch (error: any) {
    console.error("Error generating embedding:", error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Find most similar category for an email based on embeddings
 */
export function findBestCategory(
  emailEmbedding: number[],
  categorizedEmails: Array<{ embedding: number[]; categoryId: string }>
): { categoryId: string; confidence: number } | null {
  if (categorizedEmails.length === 0) {
    return null;
  }

  const similarities = categorizedEmails.map((email) => ({
    categoryId: email.categoryId,
    similarity: cosineSimilarity(emailEmbedding, email.embedding),
  }));

  // Group by category and average similarities
  const categoryScores = similarities.reduce((acc, { categoryId, similarity }) => {
    if (!acc[categoryId]) {
      acc[categoryId] = { total: 0, count: 0 };
    }
    acc[categoryId].total += similarity;
    acc[categoryId].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  // Find best category
  let bestCategory: { categoryId: string; confidence: number } | null = null;

  for (const [categoryId, { total, count }] of Object.entries(categoryScores)) {
    const avgSimilarity = total / count;
    if (!bestCategory || avgSimilarity > bestCategory.confidence) {
      bestCategory = { categoryId, confidence: avgSimilarity };
    }
  }

  return bestCategory;
}
