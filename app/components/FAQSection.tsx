'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import Reveal from './Reveal';

// ✅ Data FAQ tetap di sini karena memang milik komponen ini
const FAQ_DATA = [
  {
    question: 'Apa bedanya status Ready Stock, Pre-Order, dan Backlist?',
    answer: (
      <>
        <strong>Ready Stock</strong> artinya buku tersedia di gudang kami dan
        supplier (Yogyakarta/Surabaya), siap kirim.{' '}
        <strong>Pre-Order (PO)</strong> adalah buku yang sedang dalam masa
        pemesanan baik impor/lokal, estimasi waktu tunggu sekitar 8-12 minggu.{' '}
        <strong>Backlist</strong> merupakan list buku yang pernah kami jual di
        masa Pre-Order, namun saat ini belum dibuka kembali batch PO-nya.
      </>
    ),
  },
  {
    question: 'Bagaimana alur pemesanan dan pembayarannya?',
    answer: (
      <>
        Silakan klik tombol pemesanan di katalog untuk terhubung ke WhatsApp
        Admin. Untuk <strong>Ready Stock</strong>, pembayaran dilakukan secara
        penuh. Untuk <strong>Pre-Order (PO)</strong>, cukup DP 25% saat masa PO
        ditutup. Pelunasan dilakukan saat buku tiba di Indonesia. Setelah lunas,
        buku disortir dan dikirim ke gudang kami sebelum dikirim ke alamat Anda.
      </>
    ),
  },
  {
    question: 'Kenapa buku impor (PO) membutuhkan waktu yang lama sekali?',
    answer:
      'Karena sebagian besar buku diimpor dari penerbit Inggris, US, dan Australia menggunakan kargo laut (sea freight). Faktor eksternal seperti red line bea cukai, cuaca, atau konsolidasi warehouse juga memengaruhi kecepatan waktu tempuh.',
  },
  {
    question: 'Apakah buku Ready Stock bisa digabung ongkir dengan buku PO?',
    answer: (
      <>
        <strong>Bisa</strong>, jika estimasi kedatangan buku PO sudah dekat
        (1–2 minggu). Waktu keep maksimal 1 bulan (Sumatra, Jawa, Bali) dan 2
        bulan (Kalimantan, Sulawesi, dll). Buku yang di-keep{' '}
        <strong>wajib lunas</strong> untuk menghindari risiko kerusakan atau hal
        di luar kendali.
      </>
    ),
  },
  {
    question: 'Bagaimana cara agar tidak ketinggalan informasi PO buku?',
    answer: (
      <>
        Kami menyarankan Anda untuk bergabung ke{' '}
        <a
          href="https://chat.whatsapp.com/FhPdtrbBbYY6R6J9afilfC"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#FF9E9E] font-bold hover:underline"
        >
          WhatsApp Group Akinarabook
        </a>
        . Informasi pembukaan dan penutupan PO, promo, flash sale, serta koleksi
        buku terbaru biasanya dibagikan lebih awal melalui grup tersebut.
      </>
    ),
  },
  {
    question: 'Apakah ada garansi jika buku datang rusak?',
    answer:
      'Ya, tentu. Semua buku yang kami jual dijamin Original Publisher. Jika terdapat cacat produksi atau kerusakan akibat pengiriman, silakan kirimkan video unboxing kepada Admin kami. Kami akan membantu proses retur atau pengembalian dana sesuai ketentuan.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-white" id="faq">
      <div className="max-w-3xl mx-auto px-4">
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#8B5E3C] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-[#6D4C41]">
              Informasi lengkap seputar pemesanan dan pengiriman buku
            </p>
          </div>
        </Reveal>

        <div className="space-y-4">
          {FAQ_DATA.map((item, idx) => (
            <Reveal key={idx} delay={idx * 100}>
              <div
                className={`border rounded-2xl transition-all duration-300 ${
                  openIndex === idx
                    ? 'border-[#FF9E9E] bg-orange-50/30'
                    : 'border-orange-100 bg-white'
                }`}
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  aria-expanded={openIndex === idx}
                  className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9E9E] rounded-2xl"
                >
                  <span
                    className={`font-bold text-lg ${
                      openIndex === idx ? 'text-[#FF9E9E]' : 'text-[#8B5E3C]'
                    }`}
                  >
                    {item.question}
                  </span>
                  {openIndex === idx ? (
                    <ChevronUp className="w-5 h-5 text-[#FF9E9E] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {/* ✅ FIX: max-h-96 agar jawaban panjang tidak terpotong */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-5 pt-0 text-[#6D4C41] leading-relaxed text-sm md:text-base border-t border-dashed border-orange-100 mt-2">
                    {item.answer}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={600}>
          <div className="mt-12 text-center bg-[#FFF9F0] p-8 rounded-3xl border border-dashed border-orange-200">
            <p className="text-[#8B5E3C] font-bold mb-3 text-lg">
              Masih ada pertanyaan yang belum terjawab?
            </p>
            <a
              href="https://wa.me/6282314336969"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold hover:bg-[#128C7E] transition-all shadow-md hover:shadow-lg hover:-translate-y-1"
            >
              <MessageCircle className="w-5 h-5" /> Hubungi Admin via WhatsApp
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}