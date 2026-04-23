'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/supabaseClient';
import {
  ShoppingBag, Star, Truck, Clock, Bookmark,
  MessageCircle, Eye, User, Building2, Book as BookIcon, Globe,
  ArrowLeft, Share2, Sparkles, Flame, Hourglass, ArrowRight
} from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import Link from 'next/link';

// Komponen
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import CartDrawer from '@/app/components/CartDrawer';
import type { Book } from '@/app/types/book';
import { generateBookSlug } from '@/app/components/helpers/bookHelpers';

// ============================================================
// KONSTANTA & HELPER
// ============================================================

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%23f3e8d0'/%3E%3Crect x='100' y='140' width='100' height='120' rx='8' fill='%23d4a574' opacity='0.5'/%3E%3Ctext x='150' y='300' text-anchor='middle' font-family='Arial' font-size='14' fill='%238B5E3C' opacity='0.7'%3EGambar tidak tersedia%3C/text%3E%3C/svg%3E";

const getSeriesPrefix = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .split(' ')
    .slice(0, 2)
    .join(' ');
};

const getWaLink = (book: Book): string => {
  const phone = '6282314336969';
  const text = `Halo Admin Akinara, saya tertarik dengan buku *${book.title}* (${book.type}). Apakah varian ini akan ada di Batch PO berikutnya?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

const isEmbeddable = (url: string): boolean => {
  if (!url) return false;
  return (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('instagram.com')
  );
};

const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    if (url.includes('youtu.be')) {
      videoId = url.split('/').pop()?.split('?')[0] || '';
    } else if (url.includes('watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('/embed/')) {
      return url;
    }
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('instagram.com')) {
    // PERBAIKAN INSTAGRAM: Cukup buang parameter ?utm_source dll, lalu tambah /embed/
    let cleanUrl = url.split('?')[0];
    if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
    return `${cleanUrl}/embed/`;
  }
  return url;
};

// ============================================================
// COMPONENT STICKER & STATUS
// ============================================================
const StickerBadge = ({ type }: { type: string }) => {
  if (!type) return null;
  switch (type) {
    case 'BEST SELLER':
      return (
        <div className="absolute -top-4 -right-4 z-30 flex flex-col items-center">
          <div className="relative flex flex-col items-center animate-bounce">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 shadow-xl border-2 border-white flex flex-col items-center justify-center text-center z-10">
              <span className="text-[8px] font-black text-yellow-900 leading-none">BEST</span>
              <span className="text-[8px] font-black text-white leading-none mt-0.5 drop-shadow-md">SELLER</span>
              <Star className="w-3 h-3 text-white fill-white mt-0.5 absolute -top-1 right-0 animate-pulse" />
            </div>
            <div className="absolute -bottom-3 z-0 flex gap-1">
              <div className="w-3 h-5 bg-yellow-600 transform skew-y-[20deg] rounded-b-sm"></div>
              <div className="w-3 h-5 bg-yellow-600 transform -skew-y-[20deg] rounded-b-sm"></div>
            </div>
          </div>
        </div>
      );
    case 'SALE':
      return (
        <div className="absolute -top-3 -right-2 z-30">
          <div className="relative shadow-lg">
            <div className="bg-red-600 text-white pl-5 pr-3 py-1 rounded-md flex items-center justify-center border-2 border-white/50 relative">
              <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-sm"></div>
              <span className="font-black text-[10px] tracking-widest">SALE</span>
            </div>
          </div>
        </div>
      );
    case 'NEW':
      return (
        <div className="absolute -top-5 -right-5 z-30">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full text-green-400 drop-shadow-lg animate-pulse">
              <path fill="currentColor" d="M50 0L61 35L98 35L68 57L79 91L50 70L21 91L32 57L2 35L39 35Z" />
            </svg>
            <span className="absolute text-green-900 font-black text-[10px] transform -rotate-12">NEW!</span>
          </div>
        </div>
      );
    case 'HOT':
      return (
        <div className="absolute -top-3 -right-3 z-30">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 border-2 border-white shadow-lg flex flex-col items-center justify-center">
            <Flame className="w-4 h-4 text-yellow-200 fill-yellow-200" />
            <span className="text-white font-black text-[9px] italic pr-1">HOT</span>
          </div>
        </div>
      );
    case 'COMING SOON':
      return (
        <div className="absolute -top-3 -right-3 z-30 group-hover:-translate-y-1 transition-transform duration-300">
          <div className="bg-blue-600 text-white px-3 py-1.5 rounded-full border-2 border-white shadow-lg flex items-center gap-1.5">
            <Hourglass className="w-3 h-3 text-blue-200" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-[7px] font-bold text-blue-200 uppercase">Coming</span>
              <span className="text-[8px] font-black uppercase">Soon</span>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

const StatusBadge = ({ status, size = 'sm' }: { status: string; size?: 'sm' | 'md' }) => {
  const baseClass = size === 'sm'
    ? 'text-[10px] px-2 py-1 rounded-full font-bold shadow-md flex items-center gap-1'
    : 'px-3 py-1 text-xs font-bold rounded-full';

  if (status === 'READY') {
    return (
      <span className={`${baseClass} bg-green-${size === 'sm' ? '500 text-white' : '100 text-green-700'}`}>
        {size === 'sm' && <Truck className="w-3 h-3" />} READY {size === 'md' && 'STOCK'}
      </span>
    );
  }
  if (status === 'PO') {
    return (
      <span className={`${baseClass} bg-blue-${size === 'sm' ? '500 text-white' : '100 text-blue-700'}`}>
        {size === 'sm' && <Clock className="w-3 h-3" />} PRE-ORDER
      </span>
    );
  }
  return (
    <span className={`${baseClass} bg-slate-${size === 'sm' ? '500 text-white' : '100 text-slate-700'}`}>
      {size === 'sm' && <Bookmark className="w-3 h-3" />} BACKLIST
    </span>
  );
};

// ============================================================
// MAIN PAGE
// ============================================================

export default function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { addToCart } = useCart();
  const [bookId, setBookId] = useState<string | null>(null);

  const [book, setBook] = useState<Book | null>(null);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState(PLACEHOLDER_IMAGE);
  const [copied, setCopied] = useState(false);

  // Parse ID (Ekstrak ID dari Slug "176-buku-cerita")
  useEffect(() => {
    params.then((p) => {
      const decodedParam = decodeURIComponent(p.id);
      const extractedId = decodedParam.split('-')[0];
      setBookId(extractedId);
    });
  }, [params]);

  // Fetch Data
  useEffect(() => {
    if (!bookId) return;

    async function fetchBookData() {
      setLoading(true);

      // Ambil buku spesifik
      const { data: specificBookData, error: specificError } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single();

      if (specificBookData) {
        setBook(specificBookData as unknown as Book);
        setImgSrc((specificBookData.image as string) || PLACEHOLDER_IMAGE);
      }

      // Ambil seluruh buku lain untuk related links
      const { data: allBooksData } = await supabase
        .from('books')
        .select('*')
        .limit(50);

      if (allBooksData) {
        setAllBooks(allBooksData as unknown as Book[]);
      }

      setLoading(false);
    }

    fetchBookData();
  }, [bookId]);

  // Logika Rekomendasi 
  const relatedBooks = useMemo(() => {
    if (!book || allBooks.length === 0) return [];
    const currentSeries = getSeriesPrefix(book.title);
    const activeTitleClean = book.title.trim().toLowerCase();

    const scoredCandidates = allBooks
      .filter((b) => b.title.trim().toLowerCase() !== activeTitleClean)
      .map((b) => {
        let score = 0;
        if (getSeriesPrefix(b.title) === currentSeries && currentSeries.length > 3) score += 10;
        if (b.author && book.author && b.author === book.author) score += 5;
        if (b.category === book.category) score += 1;
        return { ...b, score };
      })
      .filter((b) => b.score > 0)
      .sort((a, b) => b.score - a.score);

    const uniqueResults: Book[] = [];
    const seenTitles = new Set<string>();

    for (const b of scoredCandidates) {
      const cleanTitle = b.title.trim().toLowerCase();
      if (!seenTitles.has(cleanTitle)) {
        uniqueResults.push(b);
        seenTitles.add(cleanTitle);
      }
      if (uniqueResults.length >= 3) break;
    }
    return uniqueResults;
  }, [book, allBooks]);

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-[#8B5E3C] rounded-full animate-spin mb-4" />
          <p className="text-[#8B5E3C] font-bold">Memuat rincian buku...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <BookIcon className="w-20 h-20 text-gray-300 mb-6" />
          <h1 className="text-3xl font-black text-[#8B5E3C] mb-2">Buku Tidak Ditemukan</h1>
          <p className="text-[#6D4C41] mb-8">Maaf, buku yang Anda cari mungkin sudah dihapus atau tidak tersedia.</p>
          <Link href="/" className="px-6 py-3 bg-[#FF9E9E] text-white font-bold rounded-full hover:bg-[#ff8585] transition-all">
            Kembali ke Katalog
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isBacklisted =
    book.status === 'BACKLIST' ||
    book.status === 'REFERENSI' ||
    book.status === 'ARCHIVE';

  return (
    <div className="min-h-screen bg-[#FFF9F0] flex flex-col font-sans overflow-x-hidden">
      <Navbar />

      <main className="flex-1 pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-4">

          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between xl:justify-start gap-4 mb-6 text-sm">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors font-bold">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Link>

            <div className="hidden xl:flex items-center gap-2 text-gray-400">
              <span>/</span>
              <Link href="/" className="hover:text-orange-500 transition-colors">Katalog</Link>
              <span>/</span>
              <span className="text-[#8B5E3C] font-bold truncate max-w-md">{book.title}</span>
            </div>

            <button
              onClick={handleShare}
              className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-white border border-orange-100 rounded-full font-bold text-[#8B5E3C] hover:bg-orange-50 transition-colors shadow-sm relative"
            >
              <Share2 className="w-4 h-4" />
              {copied ? 'Tersalin!' : 'Bagikan'}
            </button>
          </div>

          <div className="bg-white rounded-[2rem] shadow-xl shadow-orange-100/50 p-6 md:p-10 flex flex-col md:flex-row gap-8 md:gap-12 relative overflow-hidden">
            {/* Dekorasi Latar */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF9E9E]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-200/10 rounded-full blur-3xl" />

            {/* Kolom Kiri — Gambar */}
            <div className="w-full md:w-5/12 lg:w-1/2 flex flex-col relative z-10">
              <div className="bg-gray-50 rounded-[2rem] p-8 flex items-center justify-center border border-gray-100 relative">
                {book.sticker_text && <StickerBadge type={book.sticker_text} />}
                <img
                  src={imgSrc}
                  alt={book.title}
                  className="w-full max-w-[400px] object-contain rounded-lg shadow-lg hover:scale-105 transition-transform duration-500"
                  onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
                />
              </div>
            </div>

            {/* Kolom Kanan — Detail */}
            <div className="w-full md:w-7/12 lg:w-1/2 flex flex-col relative z-10">

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <StatusBadge status={book.status} size="md" />
                <span className="inline-block px-3 py-1 bg-orange-100 text-[#8B5E3C] text-xs font-bold rounded-full">
                  {book.type}
                </span>
                <span className="inline-block px-3 py-1 bg-[#FF9E9E] text-white text-xs font-bold rounded-full">
                  {book.age}
                </span>
              </div>

              {/* Judul & Harga */}
              <h1 className="text-3xl md:text-5xl font-black text-[#8B5E3C] mb-3 leading-tight">
                {book.title}
              </h1>

              <div className="mb-8">
                <p className="text-3xl md:text-4xl font-black text-[#FF9E9E]">
                  Rp {(book.price ?? 0).toLocaleString('id-ID')}
                </p>
              </div>

              {/* Info Status & ETA */}
              <div className="bg-orange-50/50 p-5 rounded-2xl mb-8 border border-orange-100/50 text-sm">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-orange-100/50">
                  <span className="text-gray-500 font-medium">Status Ketersediaan:</span>
                  <span className="font-bold text-[#8B5E3C]">
                    {book.status === 'READY'
                      ? '✓ Tersedia (Ready Stock)'
                      : book.status === 'PO'
                        ? '⏳ Pre-Order'
                        : '🚫 Belum Masuk Batch PO'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Estimasi Kedatangan (ETA):</span>
                  <span className="font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md">
                    {book.eta || 'Harap Hubungi Admin'}
                  </span>
                </div>
              </div>

              {/* Spesifikasi Buku */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm text-slate-600 mb-8 p-5 bg-gray-50 rounded-2xl">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><User className="w-3 h-3" /> Penulis</span>
                  <span className="font-medium text-[#6D4C41]">{book.author || '-'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Building2 className="w-3 h-3" /> Penerbit</span>
                  <span className="font-medium text-[#6D4C41]">{book.publisher || '-'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><BookIcon className="w-3 h-3" /> Spesifikasi</span>
                  <span className="font-medium text-[#6D4C41]">{book.pages || '-'}</span>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="mb-8">
                <h3 className="font-bold text-[#8B5E3C] mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#FF9E9E]" /> Sinopsis / Deskripsi
                </h3>
                <div className="text-gray-600 leading-relaxed text-sm md:text-base border-l-4 border-orange-100 pl-4 py-1">
                  {book.description || book.desc || 'Belum ada deskripsi untuk buku ini.'}
                </div>
              </div>

              <div className="mt-auto">
                {/* CTA Button */}
                <div className="flex gap-4">
                  {isBacklisted ? (
                    <a
                      href={getWaLink(book)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-white py-4 rounded-2xl font-bold text-center bg-slate-500 hover:bg-slate-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 hover:-translate-y-1"
                    >
                      <MessageCircle className="w-5 h-5" /> Tanya Stok via WA
                    </a>
                  ) : (
                    <button
                      onClick={() => addToCart(book)}
                      className="flex-1 text-white py-4 rounded-2xl font-bold text-center bg-gradient-to-r from-[#8B5E3C] to-[#a0724f] hover:from-[#6D4C41] hover:to-[#8B5E3C] transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-900/20 hover:-translate-y-1 text-lg"
                    >
                      <ShoppingBag className="w-6 h-6" /> Tambahkan ke Keranjang
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Section Bawah: Preview & Rekomendasi */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Kiri: Video Preview */}
            <div>
              <h4 className="text-xl font-black text-[#8B5E3C] mb-6 flex items-center gap-2 border-b border-orange-100 pb-4">
                <Eye className="w-6 h-6 text-[#FF9E9E]" /> Preview Buku
              </h4>

              {book.previewurl && isEmbeddable(book.previewurl) ? (
                <div
                  className={`relative w-full rounded-3xl overflow-hidden shadow-lg border border-orange-100 bg-white ${book.previewurl.includes('instagram') ? 'h-[600px]' : 'aspect-video'
                    }`}
                >
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={getEmbedUrl(book.previewurl) as string}
                    title={`Preview buku ${book.title}`}
                    loading="lazy"
                    /* HAPUS ATRIBUT SANDBOX DI SINI, BIARKAN INSTAGRAM BERNAPAS */
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="bg-orange-50/50 rounded-3xl border border-orange-100/50 p-12 text-center flex flex-col items-center justify-center text-gray-400 h-[300px]">
                  <Eye className="w-12 h-12 mb-4 text-orange-200" />
                  <p className="font-medium">Video preview belum tersedia untuk buku ini</p>
                </div>
              )}
            </div>

            {/* Kanan: Rekomendasi Terkait */}
            <div>
              <h4 className="text-xl font-black text-[#8B5E3C] mb-6 flex items-center gap-2 border-b border-orange-100 pb-4">
                <Sparkles className="w-6 h-6 text-yellow-500" /> Rekomendasi Serupa
              </h4>

              {relatedBooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {relatedBooks.map((relBook) => {
                    const slug = generateBookSlug(relBook.id, relBook.title);
                    return (
                      <Link
                        key={relBook.id}
                        href={`/buku/${slug}`}
                        className="group bg-white p-3 rounded-2xl shadow-sm hover:shadow-md transition-all border border-transparent hover:border-orange-100 flex flex-col h-full"
                      >
                        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 mb-3 relative flex-shrink-0">
                          <img
                            src={relBook.image || PLACEHOLDER_IMAGE}
                            alt={relBook.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {relBook.status === 'READY' && (
                            <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-green-500 rounded-full border border-white shadow-sm" />
                          )}
                        </div>
                        <h5 className="text-xs font-bold text-[#6D4C41] line-clamp-2 leading-tight group-hover:text-orange-500 transition-colors mb-1">
                          {relBook.title}
                        </h5>
                        <p className="text-[#FF9E9E] font-black text-sm mt-auto">
                          Rp {(relBook.price ?? 0).toLocaleString('id-ID')}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400">Belum ada rekomendasi yang mirip dengan buku ini.</p>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
