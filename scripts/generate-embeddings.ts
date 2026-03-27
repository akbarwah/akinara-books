// ✅ TAMBAHKAN INI DI PALING ATAS (sebelum semua import lain)
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// ============================================
// KONFIGURASI - Sekarang baca dari .env.local
// ============================================
const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 🔍 DEBUG: Cek apakah env terbaca
console.log('🔍 Checking environment variables...');
console.log('   SUPABASE_URL:', SUPABASE_URL ? '✅ Loaded' : '❌ MISSING');
console.log('   SUPABASE_KEY:', SUPABASE_KEY ? '✅ Loaded' : '❌ MISSING');
console.log('   GOOGLE_KEY:  ', GOOGLE_API_KEY ? '✅ Loaded' : '❌ MISSING');
console.log('');

if (!SUPABASE_URL || !SUPABASE_KEY || !GOOGLE_API_KEY) {
  console.error('🔴 Ada environment variable yang belum di-set!');
  console.error('   Pastikan file .env.local berisi:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...');
  console.error('   - GOOGLE_GENERATIVE_AI_API_KEY=AIzaxxxx...');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// ... sisa kode sama seperti sebelumnya (dari function bookToText dst.)

// ============================================
// FUNGSI: Ubah data buku jadi teks untuk di-embed
// ============================================
function bookToText(book: any): string {
  return [
    book.title,
    book.category,
    `untuk usia ${book.age}`,
    book.desc || '',
  ].filter(Boolean).join('. ');
}

// ============================================
// FUNGSI: Generate embedding dari teks
// ============================================
async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

// ============================================
// FUNGSI UTAMA
// ============================================
async function main() {
  console.log('📚 Memulai generate embeddings...\n');

  // 1. Ambil semua buku yang BELUM punya embedding
  const { data: books, error } = await supabase
    .from('books')
    .select('id, title, category, age, desc')
    .is('embedding', null); // Hanya yang belum punya embedding

  if (error) {
    console.error('🔴 Gagal ambil data buku:', error.message);
    return;
  }

  if (!books || books.length === 0) {
    console.log('✅ Semua buku sudah punya embedding! Tidak ada yang perlu diproses.');
    return;
  }

  console.log(`📖 Ditemukan ${books.length} buku yang belum punya embedding.\n`);

  let success = 0;
  let failed = 0;

  // 2. Loop setiap buku dan generate embedding
  for (let i = 0; i < books.length; i++) {
    const book = books[i];

    try {
      // Konversi buku ke teks
      const text = bookToText(book);
      
      // Generate embedding
      const embedding = await generateEmbedding(text);

      // Simpan ke Supabase
      const { error: updateError } = await supabase
        .from('books')
        .update({ embedding })
        .eq('id', book.id);

      if (updateError) {
        console.error(`  ❌ [${i + 1}/${books.length}] ${book.title} - DB Error: ${updateError.message}`);
        failed++;
      } else {
        console.log(`  ✅ [${i + 1}/${books.length}] ${book.title}`);
        success++;
      }

      // Rate limiting: tunggu 100ms antar request agar tidak kena limit
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (err: any) {
      console.error(`  ❌ [${i + 1}/${books.length}] ${book.title} - Error: ${err.message}`);
      failed++;

      // Jika kena rate limit, tunggu lebih lama
      if (err.message?.includes('429') || err.message?.includes('quota')) {
        console.log('  ⏳ Rate limited! Menunggu 10 detik...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }

  console.log(`
  ================================
  📊 SELESAI!
  ✅ Berhasil: ${success} buku
  ❌ Gagal:    ${failed} buku
  ================================
  `);
}

main();