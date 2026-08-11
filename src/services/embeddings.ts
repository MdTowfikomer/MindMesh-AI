/**
 * On-Device 384-Dimensional Local Vector Embedding & Cosine Similarity Engine
 * Executes feature-hashing tokenization and L2-normalized vector generation natively in React Native.
 */
export class EmbeddingsService {
  private static VECTOR_DIMENSIONS = 384;

  /**
   * Generates an on-device 384-dimensional L2-normalized dense vector from text input
   */
  public static generateEmbedding(text: string): number[] {
    if (!text || text.trim().length === 0) {
      return new Array(this.VECTOR_DIMENSIONS).fill(0);
    }

    const vector = new Array(this.VECTOR_DIMENSIONS).fill(0);
    const cleanText = text.toLowerCase().trim();

    // 1. Word token frequency hashing
    const words = cleanText.split(/\s+/);
    for (const word of words) {
      const hash = this.hashString(word);
      const index = Math.abs(hash) % this.VECTOR_DIMENSIONS;
      vector[index] += 1.0;
    }

    // 2. Character 3-gram feature hashing for sub-word semantics
    for (let i = 0; i < cleanText.length - 2; i++) {
      const triGram = cleanText.substring(i, i + 3);
      const hash = this.hashString(triGram);
      const index = Math.abs(hash) % this.VECTOR_DIMENSIONS;
      vector[index] += 0.5;
    }

    // 3. L2 Normalization (Unit Length Vector)
    let magnitudeSq = 0;
    for (let i = 0; i < this.VECTOR_DIMENSIONS; i++) {
      magnitudeSq += vector[i] * vector[i];
    }

    const magnitude = Math.sqrt(magnitudeSq) || 1;
    for (let i = 0; i < this.VECTOR_DIMENSIONS; i++) {
      vector[i] = vector[i] / magnitude;
    }

    return vector;
  }

  /**
   * Computes exact cosine similarity distance between two 384-dimensional vectors
   */
  public static calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : Math.min(1.0, Math.max(0.0, dotProduct / denom));
  }

  /**
   * String hashing algorithm (FNV-1a 32-bit variant)
   */
  private static hashString(str: string): number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return hash >>> 0;
  }
}
