// app/api/chat/route.ts
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createCerebras } from '@ai-sdk/cerebras';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, embed, generateText } from 'ai'; // ✅ Kembalikan generateText
import { supabase } from '@/supabaseClient';

// ============================================
// SETUP PROVIDERS
// ============================================
const google1 = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
const google2 = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY_2 });
const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const cerebras = createCerebras({ apiKey: process.env.CEREBRAS_API_KEY });
const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

// ✅ FIX: Gunakan 1.5-flash karena 2.0-flash-lite ditolak (Limit: 0) oleh Google Free Tier
const fallbackModels = [
  { name: 'Google #1', model: google1('gemini-2.5-flash-lite') },
  { name: 'Google #2', model: google2('gemini-2.5-flash-lite') },
  { name: 'Groq', model: groq('llama-3.3-70b-versatile') },
  { name: 'Cerebras', model: cerebras('llama-3.3-70b') },
  { name: 'OpenRouter', model: openrouter('google/gemini-2.5-flash-lite') }
];

// ============================================
// SEMANTIC SEARCH
// ============================================
async function searchRelevantBooks(searchQuery: string) {
  try {
    const { embedding } = await embed({
      // ✅ FIX: Kembalikan ke embedding-001 yang stabil di API Key Anda
      model: google1.textEmbeddingModel('gemini-embedding-001'),
      value: searchQuery,
      maxRetries: 0, // Jangan buang waktu retry jika google mati
    });

    const { data: books, error } = await supabase
      .rpc('match_books', {
        query_embedding: embedding,
        match_count: 12,
        match_threshold: 0.3,
      });

    if (error) {
      console.error('🔴 Search Error:', error.message);
      return null;
    }
    return books;
  } catch (err) {
    console.error('🔴 Embedding Error:', err);
    return null;
  }
}

function formatBooks(books: any[]): string {
  return books
    .map(b =>
      `${b.title} | ${b.category} | Usia:${b.age} | Rp${b.price} | ${b.type} | Status:${b.status}${b.eta ? ' (ETA:' + b.eta + ')' : ''} | Promo:${b.sticker_text || '-'} | Deskripsi:${b.desc}`
    )
    .join('\n');
}

async function getFallbackBooks() {
  const { data: books } = await supabase
    .from('books')
    .select('title, price, type, age, status, category, desc, eta, sticker_text')
    .eq('is_highlight', true)
    .limit(15);
  return books;
}

// ============================================
// API ROUTE UTAMA
// ============================================
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const userMessages = messages
      .filter((m: any) => m.role === 'user')
      .slice(-3)
      .map((m: any) => m.content);

    const searchQuery = userMessages.join('. ');
    console.log(`\n🔍 Semantic Search: "${searchQuery}"`);

    let relevantBooks = await searchRelevantBooks(searchQuery);

    if (!relevantBooks || relevantBooks.length === 0) {
      console.log('⚠️ Semantic search gagal, menggunakan fallback books...');
      relevantBooks = await getFallbackBooks();
    }

    const catalogContext = relevantBooks && relevantBooks.length > 0
      ? formatBooks(relevantBooks)
      : 'Katalog sedang tidak tersedia.';

    // 4. SYSTEM PROMPT
    const systemPrompt = `
Kamu adalah Nala, asisten virtual ramah dan hangat untuk toko buku anak "Akinara Books". Sapa pengguna dengan "Bunda" atau "Ayah".

ATURAN PALING PENTING:
- Kamu HANYA BOLEH merekomendasikan buku yang ada di KATALOG di bawah.
- JANGAN PERNAH bilang buku tidak ada jika buku tersebut TERCANTUM di katalog.
- Jika Bunda bertanya detail tentang buku yang sudah kamu rekomendasikan, cari di katalog dan jelaskan.
- JANGAN PERNAH mengarang judul buku yang tidak ada di katalog.
- Baca kolom "Status" di katalog dengan TELITI. Jika tertulis "Status:Ready Stock" berarti buku itu TERSEDIA. Jangan bilang semua buku backlist jika ada yang Ready Stock.

FAQ STATUS BUKU:
- "Ready Stock": Tersedia di gudang (Yogyakarta/Surabaya), siap kirim.
- "Pre-Order (PO)": Masa pemesanan, estimasi 8-12 minggu.
- "Backlist": Pernah dijual saat PO, tapi BELUM DIBUKA KEMBALI. Tegaskan sopan bahwa belum bisa dipesan.

SOP REKOMENDASI (WAJIB BERTAHAP):
TAHAP 1: Sebutkan 1-2 judul dari KATALOG, beri 1 kalimat menarik tentang isinya. UTAMAKAN buku berstatus "Ready Stock" saat merekomendasikan.
TAHAP 2: BERHENTI. JANGAN sebutkan harga/tipe/status. Akhiri dengan pertanyaan pancingan seperti "Bunda mau tahu harganya?"
TAHAP 3: Beri harga dan status HANYA jika Bunda menanyakan.

GAYA KOMUNIKASI & KEPRIBADIAN (SANGAT PENTING):
- Kamu BUKAN robot AI. Kamu adalah Nala, manusia sungguhan, seorang ibu muda yang bekerja sebagai Customer Service.
- Gunakan bahasa Indonesia sehari-hari yang santai, hangat, dan berempati (contoh: pakai kata "nih", "lho", "ya Bun").
- DILARANG keras berbicara kaku seperti ensiklopedia atau Wikipedia.
- DILARANG pakai bullet points, numbering, tanda bintang, bold/markdown. JIKA INGIN MENULIS JUDUL BUKU, GUNAKAN TANDA KUTIP TUNGGAL.
WAJIB sisipkan persis 1 atau 2 emoji yang relevan di dalam setiap balasanmu agar terasa hangat (misalnya: 😊, ✨, atau 🦕). JANGAN LEBIH DARI 2 emoji.
- Arahkan ke WA Admin (wa.me/6282314336969) HANYA jika Bunda ingin membeli.
- Jika buku tidak ada di katalog di bawah, katakan sopan bahwa stoknya belum ada dan tawarkan alternatif.

FORMAT PARAGRAF (WAJIB DIPATUHI):
- Setiap paragraf MAKSIMAL 2-3 kalimat saja.
- Antar paragraf WAJIB ada baris kosong (enter 2x) sebagai pemisah.
- JANGAN PERNAH menulis semua informasi dalam satu paragraf panjang.
- Pisahkan menjadi beberapa paragraf pendek agar mudah dibaca.
- Pola yang BENAR: sapaan/reaksi → info buku → ajakan/pertanyaan. Masing-masing paragraf terpisah.

Contoh format yang SALAH (jangan ditiru):
"Bunda, buku X tersedia dalam hardcover dan paperback. Harganya Rp215000 untuk hardcover dan Rp150000 untuk paperback. Sayangnya buku ini masih dalam status backlist dan belum bisa dipesan saat ini. Bunda bisa menunggu sampai buku ini tersedia kembali. 🚗📚"

Contoh format yang BENAR (tirulah pola ini):
"Wah, buku yang bagus banget pilihannya Bun! 🚗

Buku X tersedia dalam dua versi, yaitu hardcover Rp215.000 dan paperback Rp150.000.

Tapi sayangnya buku ini masih berstatus backlist ya Bun, jadi belum bisa dipesan untuk saat ini. Nala kabari lagi kalau sudah dibuka ya! 😊"

KATALOG BUKU YANG RELEVAN:
${catalogContext}
    `;

    const recentMessages = messages.slice(-15);

    // ============================================
    // MESIN FALLBACK DENGAN "QUICK TEST" GATEKEEPER
    // ============================================
    let lastError: any;

    for (const provider of fallbackModels) {
      try {
        console.log(`⚡ Mencoba menghubungkan ke: ${provider.name}...`);

        // 🛡️ JURUS SAKTI ANDA: Paksa Vercel melakukan tes sinkron agar tidak ada delay
        await generateText({
          model: provider.model,
          prompt: "hi",
          maxOutputTokens: 1, // Hemat token
          maxRetries: 0, // ✅ KUNCI UTAMA: Jika limit, langsung error detik itu juga (tidak ditahan 30 detik)
        });

        console.log(`✅ ${provider.name} Online! Memulai stream...`);

        const result = streamText({
          model: provider.model,
          system: systemPrompt,
          messages: recentMessages,
          temperature: 0.3,
          maxOutputTokens: 400,
          maxRetries: 0, // ✅ Cegah Vercel melakukan retry diam-diam
        });

        return result.toTextStreamResponse();

      } catch (err: any) {
        const statusCode = err?.statusCode || err?.status || 'Unknown';
        console.warn(`⚠️ Gagal pakai ${provider.name} (Error: ${statusCode}). Loncat ke model berikutnya!`);
        lastError = err;
        continue;
      }
    }

    throw lastError;

  } catch (error) {
    console.error('🔴 KIAMAT PROVIDER (Semua AI Mati):', error);
    return new Response('Nala sedang istirahat sebentar ya Bunda 😴. Boleh dicoba lagi beberapa menit ke depan?', { status: 503 });
  }
}