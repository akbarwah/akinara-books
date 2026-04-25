'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from '@/supabaseClient';
import {
  ShoppingBag, Star, Truck, Clock, Bookmark,
  MessageCircle, Eye, User, Building2, Book as BookIcon, Globe,
  X, ArrowRight, Sparkles, Flame, Hourglass, Share2, Check,
  Youtube, Play, ExternalLink // <-- INI 3 ICON TAMBAHANNYA
} from 'lucide-react';
import { useCart } from '../context/CartContext';

// ============================================================
// TIPE DATA
// ============================================================
import type { Book } from '@/app/types/book';


// ============================================================
// KONSTANTA
// ============================================================

import {
  PLACEHOLDER_IMAGE,
  STATUS_PRIORITY,
  getSeriesPrefix,
  getWaLink,
  isInstagramPost,
  isInstagramReel,
  isEmbeddable,
  isGoogleBooksPreview,
  getEmbedUrl,
} from './helpers/bookHelpers';

// ============================================================
// STICKER BADGE COMPONENT
// ============================================================
const StickerBadge = ({ type }: { type: string }) => {
  if (!type) return null;

  switch (type) {
    case 'BEST SELLER':
      return (
        <div className="absolute -top-4 -right-4 z-30 flex flex-col items-center group-hover:scale-110 transition-transform duration-300 origin-top">
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
        <div className="absolute -top-3 -right-2 z-30 group-hover:rotate-6 transition-transform duration-300 origin-bottom-left">
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
        <div className="absolute -top-5 -right-5 z-30 group-hover:rotate-180 transition-transform duration-700">
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
        <div className="absolute -top-3 -right-3 z-30 group-hover:scale-110 transition-transform duration-300">
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

// ============================================================
// STATUS BADGE COMPONENT (✅ FIX: Extracted, tidak duplikasi)
// ============================================================
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
// BOOK CARD COMPONENT (✅ FIX: Extracted jadi komponen sendiri)
// ============================================================
const BookCard = ({
  book,
  onClick,
}: {
  book: Book;
  onClick: (book: Book) => void;
}) => {
  // ✅ FIX: State untuk handle image error
  const [imgSrc, setImgSrc] = useState(book.image || PLACEHOLDER_IMAGE);

  return (
    <div
      onClick={() => onClick(book)}
      className="group relative bg-white p-3 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer h-full flex flex-col border border-transparent hover:border-orange-100"
    >
      {book.sticker_text && <StickerBadge type={book.sticker_text} />}

      <div className="relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-4">
        {/* ✅ FIX: img dengan lazy loading + error handling */}
        <img
          src={imgSrc}
          alt={book.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
        />

        <div className="absolute top-2 right-2">
          <StatusBadge status={book.status} size="sm" />
        </div>
      </div>

      <h3 className="font-bold text-[#8B5E3C] line-clamp-1 group-hover:text-[#FF9E9E] transition-colors text-left">
        {book.title}
      </h3>
      {/* ✅ FIX: Null-safe price */}
      <p className="text-[#FF9E9E] font-bold text-lg text-left">
        Rp {(book.price ?? 0).toLocaleString('id-ID')}
      </p>
    </div>
  );
};

// ============================================================
// BOOK MODAL COMPONENT (✅ FIX: Extracted jadi komponen sendiri)
// ============================================================
const BookModal = ({
  book,
  relatedBooks,
  onClose,
  onRelatedClick,
}: {
  book: Book;
  relatedBooks: Book[];
  onClose: () => void;
  onRelatedClick: (book: Book) => void;
}) => {
  const { addToCart } = useCart();

  // ✅ FIX: Pakai useRef untuk scroll — tidak pakai querySelector
  const modalScrollRef = useRef<HTMLDivElement>(null);

  // ✅ FIX: Image error handling di modal
  const [imgSrc, setImgSrc] = useState(book.image || PLACEHOLDER_IMAGE);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      const url = book.slug
        ? `${window.location.origin}/katalog/${book.slug}`
        : `${window.location.origin}/katalog`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // ✅ FIX: Sync imgSrc kalau activeBook berubah (klik rekomendasi)
  useEffect(() => {
    setImgSrc(book.image || PLACEHOLDER_IMAGE);
  }, [book.image]);

  // ✅ FIX: Keyboard ESC untuk menutup modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // ✅ FIX: Kunci scroll body saat modal terbuka
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleRelatedClick = (relatedBook: Book) => {
    onRelatedClick(relatedBook);
    // ✅ FIX: Scroll ke atas via ref
    setTimeout(() => {
      if (modalScrollRef.current) {
        modalScrollRef.current.scrollTop = 0;
      }
    }, 50);
  };

  const isBacklisted =
    book.status === 'BACKLIST' ||
    book.status === 'REFERENSI' ||
    book.status === 'ARCHIVE';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm text-left">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detail buku ${book.title}`}
        className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Tombol Aksi Kanan Atas */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={handleShare}
            aria-label="Bagikan buku"
            className="flex items-center gap-1.5 px-3 py-2 bg-white/80 backdrop-blur rounded-full hover:bg-white text-gray-500 hover:text-[#8B5E3C] transition-colors shadow-sm text-xs font-bold"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
            {copied ? <span className="text-green-500">Tersalin!</span> : 'Salin Link'}
          </button>

          <button
            onClick={onClose}
            aria-label="Tutup modal"
            className="p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white text-gray-500 hover:text-red-500 transition-colors shadow-sm"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Kolom Kiri — Gambar */}
        <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-6 md:p-8">
          <img
            src={imgSrc}
            alt={book.title}
            className="max-w-full max-h-[300px] md:max-h-[500px] object-contain rounded-lg shadow-md"
            onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
          />
        </div>

        {/* Kolom Kanan — Detail */}
        <div
          ref={modalScrollRef}
          className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto"
        >
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <StatusBadge status={book.status} size="md" />
            <span className="inline-block px-3 py-1 bg-orange-100 text-[#8B5E3C] text-xs font-bold rounded-full">
              {book.type}
            </span>
            <span className="inline-block px-3 py-1 bg-[#FF9E9E] text-white text-xs font-bold rounded-full">
              {book.age}
            </span>
          </div>

          {/* Judul & Harga */}
          <h3 className="text-2xl md:text-4xl font-bold text-[#8B5E3C] mb-2 leading-tight">
            {book.title}
          </h3>
          {/* ✅ FIX: Null-safe price di modal */}
          <p className="text-3xl font-bold text-[#FF9E9E] mb-6">
            Rp {(book.price ?? 0).toLocaleString('id-ID')}
          </p>

          {/* Info Status & ETA */}
          <div className="bg-slate-50 p-4 rounded-xl mb-6 text-sm text-slate-700 border border-slate-100">
            <div className="flex justify-between mb-1">
              <span>Status:</span>
              <span className="font-bold">
                {book.status === 'READY'
                  ? 'Tersedia'
                  : book.status === 'PO'
                    ? 'Pre-Order'
                    : 'Belum Masuk Batch PO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimasi Tiba:</span>
              <span className="font-bold text-[#8B5E3C]">
                {book.eta || 'Hubungi Admin'}
              </span>
            </div>
          </div>

          {/* Detail Buku */}
          <div className="space-y-3 mb-6 text-sm text-slate-600 border-t border-dashed border-gray-200 pt-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-orange-300" />
              <span>Penulis: {book.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-300" />
              <span>Penerbit: {book.publisher}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookIcon className="w-4 h-4 text-orange-300" />
              <span>Spesifikasi: {book.pages}</span>
            </div>
            <div className="flex items-start gap-2 mt-2">
              <Globe className="w-4 h-4 text-orange-300 mt-1 flex-shrink-0" />
              <span className="leading-relaxed">
                {book.description || book.desc || 'Deskripsi belum tersedia.'}
              </span>
            </div>
          </div>

          {/* Preview Embed — YouTube, Instagram Carousel & Google Books */}
          {book.previewurl && isEmbeddable(book.previewurl) && (
            <div className="mb-6">
              <h4 className="font-bold text-[#8B5E3C] mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" /> Preview Buku
              </h4>
              <div className={`relative w-full rounded-xl overflow-hidden shadow-sm border border-orange-100 ${
                isGoogleBooksPreview(book.previewurl)
                  ? 'h-[400px]'
                  : isInstagramPost(book.previewurl)
                    ? 'h-[550px]'
                    : 'aspect-video'
              }`}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={getEmbedUrl(book.previewurl) as string}
                  title={`Preview buku ${book.title}`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                {isGoogleBooksPreview(book.previewurl) && (
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-[9px] font-bold text-gray-500 shadow-sm border border-gray-100 flex items-center gap-1">
                    <BookIcon className="w-2.5 h-2.5" /> Google Books
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tombol external link untuk semua sumber preview */}
          {book.previewurl && (
            <div className="mb-6">
              {!isEmbeddable(book.previewurl) && (
                <h4 className="font-bold text-[#8B5E3C] mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Preview Buku
                </h4>
              )}
              <a
                href={book.previewurl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 p-4 border rounded-2xl transition-all group w-full ${
                  isGoogleBooksPreview(book.previewurl)
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200'
                    : book.previewurl.includes('youtube.com') || book.previewurl.includes('youtu.be')
                      ? 'bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 border-red-200'
                      : 'bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${
                  isGoogleBooksPreview(book.previewurl)
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                    : book.previewurl.includes('youtube.com') || book.previewurl.includes('youtu.be')
                      ? 'bg-gradient-to-br from-red-500 to-red-600'
                      : 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400'
                }`}>
                  {isGoogleBooksPreview(book.previewurl) ? (
                    <BookIcon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                  ) : book.previewurl.includes('youtube.com') || book.previewurl.includes('youtu.be') ? (
                    <Youtube className="w-5 h-5 text-white fill-white group-hover:scale-110 transition-transform" />
                  ) : (
                    <Play className="w-5 h-5 text-white fill-white group-hover:scale-110 transition-transform" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-[#8B5E3C] text-sm line-clamp-1">
                    {isGoogleBooksPreview(book.previewurl) ? 'Baca Preview Buku' : 'Lihat Video Preview'}
                  </p>
                  <p className={`text-[10px] font-medium ${
                    isGoogleBooksPreview(book.previewurl)
                      ? 'text-blue-500'
                      : book.previewurl.includes('youtube.com') || book.previewurl.includes('youtu.be')
                        ? 'text-red-500'
                        : 'text-purple-500'
                  }`}>
                    {isGoogleBooksPreview(book.previewurl)
                      ? 'Buka di Google Books'
                      : book.previewurl.includes('youtube.com') || book.previewurl.includes('youtu.be')
                        ? 'Buka di YouTube'
                        : 'Buka di Instagram'}
                  </p>
                </div>
                <ExternalLink className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${
                  isGoogleBooksPreview(book.previewurl)
                    ? 'text-blue-400'
                    : book.previewurl.includes('youtube.com') || book.previewurl.includes('youtu.be')
                      ? 'text-red-400'
                      : 'text-purple-400'
                }`} />
              </a>
            </div>
          )}

          {/* CTA Button */}
          <div className="flex gap-3 mb-8 border-b border-gray-100 pb-8 mt-auto">
            {isBacklisted ? (
              <a
                href={getWaLink(book)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-white py-3 rounded-xl font-bold text-center bg-slate-500 hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <MessageCircle className="w-5 h-5" /> Tanya Stok
              </a>
            ) : (
              <button
                onClick={() => {
                  addToCart(book);
                  onClose();
                }}
                className="flex-1 text-white py-3 rounded-xl font-bold text-center bg-[#8B5E3C] hover:bg-[#6D4C41] transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <ShoppingBag className="w-5 h-5" /> Tambah ke Keranjang
              </button>
            )}
          </div>

          {/* Rekomendasi */}
          {relatedBooks.length > 0 && (
            <div>
              <h4 className="font-bold text-[#8B5E3C] mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" /> Mungkin Kamu Suka Juga...
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {relatedBooks.map((relBook) => {
                  const [relImgSrc, setRelImgSrc] = useState(
                    relBook.image || PLACEHOLDER_IMAGE
                  );
                  return (
                    <div
                      key={relBook.id}
                      onClick={() => handleRelatedClick(relBook)}
                      className="cursor-pointer group/card"
                    >
                      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-2 border border-transparent group-hover/card:border-orange-200 transition-all relative">
                        <img
                          src={relImgSrc}
                          alt={relBook.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                          onError={() => setRelImgSrc(PLACEHOLDER_IMAGE)}
                        />
                        {relBook.status === 'READY' && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full border border-white" />
                        )}
                      </div>
                      <h5 className="text-xs font-bold text-[#6D4C41] line-clamp-2 leading-tight group-hover/card:text-orange-500 transition-colors">
                        {relBook.title}
                      </h5>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Rp {(relBook.price ?? 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function MiniCatalog() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBook, setActiveBook] = useState<Book | null>(null);

  // ✅ FIX: useCallback agar fungsi stabil, tidak re-render terus
  const handleOpenModal = useCallback((book: Book) => {
    setActiveBook(book);
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveBook(null);
  }, []);

  // Fetch buku dari Supabase
  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('is_highlight', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching books:', error);
      } else if (data) {
        const typedData = data as unknown as Book[];

        const sortedData = typedData.sort((a, b) => {
          // Level 1: is_highlight
          const highlightA = a.is_highlight ? 1 : 0;
          const highlightB = b.is_highlight ? 1 : 0;
          if (highlightA !== highlightB) return highlightB - highlightA;

          // Level 2: Status
          const priorityA = STATUS_PRIORITY[a.status] ?? 99;
          const priorityB = STATUS_PRIORITY[b.status] ?? 99;
          if (priorityA !== priorityB) return priorityA - priorityB;

          // Level 3: ID
          return a.id - b.id;
        });

        setBooks(sortedData);
      }
      setLoading(false);
    }

    fetchBooks();
  }, []);

  // Logika rekomendasi buku terkait
  const relatedBooks = useMemo(() => {
    if (!activeBook || books.length === 0) return [];

    const currentSeries = getSeriesPrefix(activeBook.title);
    const activeTitleClean = activeBook.title.trim().toLowerCase();

    const scoredCandidates = books
      .filter((b) => b.title.trim().toLowerCase() !== activeTitleClean)
      .map((b) => {
        let score = 0;
        if (
          getSeriesPrefix(b.title) === currentSeries &&
          currentSeries.length > 3
        )
          score += 10;
        if (b.author && activeBook.author && b.author === activeBook.author)
          score += 5;
        if (b.category === activeBook.category) score += 1;
        return { ...b, score };
      })
      .filter((b) => b.score > 0)
      .sort((a, b) => b.score - a.score);

    const uniqueResults: Book[] = [];
    const seenTitles = new Set<string>();

    for (const book of scoredCandidates) {
      const cleanTitle = book.title.trim().toLowerCase();
      if (!seenTitles.has(cleanTitle)) {
        uniqueResults.push(book);
        seenTitles.add(cleanTitle);
      }
      if (uniqueResults.length >= 3) break;
    }

    return uniqueResults;
  }, [activeBook, books]);

  const displayedBooks = books.slice(0, 4);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#FFF9F0]" id="katalog">
      <div className="max-w-7xl mx-auto px-4 text-center">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-12">
          <span className="inline-block px-4 py-1.5 bg-[#FF9E9E] text-white rounded-full text-sm font-bold tracking-wide shadow-sm mb-2">
            KOLEKSI TERBAIK
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#8B5E3C] mb-2">
            Buku Pilihan Untuk Si Kecil
          </h2>
          <p className="text-[#6D4C41] text-sm md:text-base font-medium max-w-4xl mx-auto">
            Jelajahi koleksi buku anak terbaik kami yang penuh warna dan cerita menarik
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-[#8B5E3C] rounded-full animate-spin mb-2" />
            <p className="text-[#8B5E3C]">Memuat rekomendasi...</p>
          </div>
        ) : (
          <>
            {/* ✅ FIX: Empty state kalau tidak ada buku */}
            {displayedBooks.length === 0 ? (
              <div className="col-span-4 text-center py-12 text-[#8B5E3C] opacity-50">
                <BookIcon className="w-12 h-12 mx-auto mb-3" />
                <p>Koleksi sedang diperbarui...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {displayedBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onClick={handleOpenModal}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* CTA ke Katalog Lengkap */}
        <div className="mt-12">
          <a
            href="/katalog"
            className="inline-flex items-center gap-2 bg-[#8B5E3C] text-white px-8 py-3 rounded-full font-bold hover:bg-[#6D4C41] transition-all shadow-lg hover:shadow-orange-200 hover:scale-105"
          >
            Lihat Koleksi Lengkap <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Modal */}
      {activeBook && (
        <BookModal
          book={activeBook}
          relatedBooks={relatedBooks}
          onClose={handleCloseModal}
          onRelatedClick={setActiveBook}
        />
      )}
    </section>
  );
}