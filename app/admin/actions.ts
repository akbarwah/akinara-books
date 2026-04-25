'use server';

import { generateBookEmbedding } from '@/lib/embedding-service';

export async function getEmbeddingAction(bookData: {
  title: string;
  category?: string;
  age?: string;
  desc?: string;
}) {
  try {
    const embedding = await generateBookEmbedding(bookData);
    return embedding;
  } catch (error) {
    console.error('🔴 Gagal generate embedding di Server Action:', error);
    // Mengembalikan null agar proses save tidak sepenuhnya gagal.
    // Nanti jika null, kolom embedding di DB tidak diupdate.
    return null;
  }
}
