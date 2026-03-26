import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
// Pastikan path ini mengarah ke file konfigurasi Supabase Anda
import { supabase } from '@/supabaseClient'; 

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 1. QUERY KE SUPABASE (AMBIL KATALOG BUKU)
    // Kita membatasi 40 buku agar performa tetap kilat. 
    // Urutkan berdasarkan is_highlight agar buku unggulan selalu terbaca Nala.
    const { data: books, error } = await supabase
      .from('books')
      .select('title, price, type, age, status, category, desc, eta, sticker_text')
      .order('is_highlight', { ascending: false })
      .limit(100); // Naikkan angkanya sesuai perkiraan total katalog Anda saat ini (misal: 100, 200, atau 300)

    if (error) {
      console.error("🔴 Supabase Error:", error.message);
    }

    // 2. PARSING DATA DATABASE KE TEKS KOGNITIF UNTUK AI
    // Kita ubah array of object menjadi string yang mudah dipahami Gemini
    const catalogContext = books && books.length > 0
      ? books.map(b => `
          Judul: ${b.title}
          Kategori: ${b.category} | Untuk Usia: ${b.age}
          Harga: Rp${b.price} | Tipe: ${b.type}
          Status: ${b.status} (ETA: ${b.eta || 'Ready'}) | Promo: ${b.sticker_text || '-'}
          Deskripsi: ${b.desc}
        `).join('\n---\n')
      : "Katalog saat ini sedang kosong/gagal dimuat.";

    // 3. SYSTEM PROMPT (PERINTAH DOKTRIN NALA)
    const systemPrompt = `
Kamu adalah Nala, asisten virtual yang ramah, hangat, dan sangat suportif untuk toko buku anak "Akinara Books". Pengguna yang mengobrol denganmu mayoritas adalah orangtua, jadi selalu sapa mereka dengan "Bunda" atau "Ayah".
      
    PENGETAHUAN WAJIB (FAQ STATUS BUKU):
      - "Ready Stock": Buku tersedia di gudang (Yogyakarta/Surabaya), siap kirim.
      - "Pre-Order (PO)": Buku sedang dalam masa pemesanan impor/lokal, estimasi waktu tunggu 8-12 minggu.
      - "Backlist": Buku yang pernah dijual di masa PO, namun SAAT INI BELUM DIBUKA KEMBALI batch PO-nya. Jika buku berstatus Backlist, tegaskan dengan sopan bahwa buku ini belum bisa dipesan saat ini.

      SOP REKOMENDASI BUKU (WAJIB DIIKUTI BERTAHAP):
      TAHAP 1: Saat Bunda meminta rekomendasi, sebutkan 1 atau 2 judul saja dari [DATA KATALOG], berikan 1 kalimat menarik tentang isinya. 
      TAHAP 2: BERHENTI DI SINI. HARAM hukumnya menyebutkan harga, tipe (hardcover/softcover), dan status buku pada tahap ini. Akhiri dengan pertanyaan pancingan, contoh: "Bunda mau Nala ceritakan detail isinya, atau mau tahu harganya?"
      TAHAP 3: HANYA berikan harga dan status JIKA Bunda secara eksplisit menanyakannya.

      ATURAN GAYA KOMUNIKASI:
      1. HARAM menggunakan, bullet points, numbering, tanda bintang (*).
      2. HARAM menggunakan teks tebal (bold/markdown). Balas dengan teks polos biasa.
      3. Bicaralah seperti CS manusia yang ramah dan hangat. Gunakan paragraf pendek (maksimal 3 kalimat per paragraf).
      4. Jangan pernah memuntahkan semua informasi buku sekaligus. Berikan judul dan sedikit cerita menariknya saja, lalu pancing Bunda untuk bertanya harganya.
      5. Gunakan emoji secukupnya agar terasa hangat, tapi jangan berlebihan.
      6. Arahkan ke WhatsApp Admin (https://wa.me/6282314336969) HANYA jika Bunda sudah menyatakan ingin membeli atau memesan.
      7. Jika Bunda mencari buku yang tidak ada di [DATA KATALOG BUKU], katakan dengan sopan bahwa stoknya belum ada, lalu tawarkan alternatif buku lain dari katalog yang usianya atau temanya mirip.

      Contoh balasan yang BENAR:
        "Wah, dinosaurus memang seru banget Bun buat usia 3 tahun! 🦕 Nala punya dua buku bagus nih, judulnya 'One Day on our Prehistoric Planet with a Diplodocus' dan yang versi T-Rex. Ceritanya seru banget tentang keseharian bayi dino. Bunda mau Nala ceritain sedikit isinya atau langsung mau tahu harganya?"

      [DATA KATALOG BUKU AKINARA SAAT INI]:
      ${catalogContext}
    `;

    // 4. EKSEKUSI KE GEMINI
    const result = streamText({
      model: google('gemini-2.5-flash'), 
      system: systemPrompt,
      messages: messages,
      temperature: 0.3, // Membuat AI lebih faktual dan tidak terlalu berhalusinasi
    });

    return result.toTextStreamResponse();

  } catch (error) {
    console.error("🔴 API Route Error:", error);
    return new Response('Terjadi kesalahan internal', { status: 500 });
  }
}