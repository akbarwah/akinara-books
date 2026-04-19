'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X, Eye, User, Building2, Book as BookIcon,
  Globe, MessageCircle, ShoppingBag, ArrowRight, Sparkles, Share2, Check
} from 'lucide-react';
import type { Book } from '@/app/types/book';
import { useCart } from '../context/CartContext';
import {
  PLACEHOLDER_IMAGE,
  getWaLink,
  isEmbeddable,
  getEmbedUrl,
  getSeriesPrefix,
  generateBookSlug,
} from './helpers/bookHelpers';

// ============================================================
// STATUS BADGE — Shared
// ============================================================
export const StatusBadge = ({
  status,
  size = 'sm',
}: {
  status: string;
  size?: 'sm' | 'md';
}) => {
  if (status === 'READY') {
    return size === 'sm' ? (
      <span className="bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md flex items-center gap-1">
        ✓ READY
      </span>
    ) : (
      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
        READY STOCK
      </span>
    );
  }
  if (status === 'PO') {
    return size === 'sm' ? (
      <span className="bg-blue-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md flex items-center gap-1">
        ⏳ PO
      </span>
    ) : (
      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
        PRE-ORDER
      </span>
    );
  }
  return size === 'sm' ? (
    <span className="bg-slate-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md flex items-center gap-1">
      📚 BACKLIST
    </span>
  ) : (
    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
      BACKLIST
    </span>
  );
};

// ============================================================
// PROPS
// ============================================================
interface BookDetailModalProps {
  // Untuk katalog: bisa punya banyak varian (hardcover, paperback, dll)
  // Untuk MiniCatalog: cukup 1 buku
  book: Book;
  variants?: Book[]; // opsional, untuk katalog
  relatedBooks: Book[];
  onClose: () => void;
  onRelatedClick: (book: Book) => void;
}

// ============================================================
// KOMPONEN
// ============================================================
export default function BookDetailModal({
  book,
  variants,
  relatedBooks,
  onClose,
  onRelatedClick,
}: BookDetailModalProps) {
  const { addToCart } = useCart();
  const modalScrollRef = useRef<HTMLDivElement>(null);

  // Active variant — default ke book yang dikirim
  const [activeVariant, setActiveVariant] = useState<Book>(book);

  // Sync kalau book prop berubah (klik rekomendasi)
  useEffect(() => {
    setActiveVariant(book);
  }, [book]);

  // Image error handling
  const [imgSrc, setImgSrc] = useState(book.image || PLACEHOLDER_IMAGE);
  useEffect(() => {
    setImgSrc(activeVariant.image || PLACEHOLDER_IMAGE);
  }, [activeVariant.image]);

  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      const slug = generateBookSlug(activeVariant.id, activeVariant.title);
      const url = `${window.location.origin}/buku/${slug}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // ✅ Keyboard ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // ✅ Kunci body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleRelatedClick = (relBook: Book) => {
    onRelatedClick(relBook);
    setTimeout(() => {
      if (modalScrollRef.current) modalScrollRef.current.scrollTop = 0;
    }, 50);
  };

  const isBacklisted =
    activeVariant.status === 'BACKLIST' ||
    activeVariant.status === 'REFERENSI' ||
    activeVariant.status === 'ARCHIVE';

  const hasVariants = variants && variants.length > 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm text-left">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detail buku ${activeVariant.title}`}
        className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Tombol Aksi Kanan Atas */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {/* Share Button */}
          <button
            onClick={handleShare}
            aria-label="Bagikan buku"
            className="flex items-center gap-1.5 px-3 py-2 bg-white/80 backdrop-blur rounded-full hover:bg-white text-gray-500 hover:text-[#8B5E3C] transition-colors shadow-sm text-xs font-bold"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
            {copied ? <span className="text-green-500">Tersalin!</span> : 'Salin Link'}
          </button>

          {/* Tombol Close */}
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
            alt={activeVariant.title}
            className="max-w-full max-h-[300px] md:max-h-[500px] object-contain rounded-lg shadow-md"
            onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
          />
        </div>

        {/* Kolom Kanan — Detail */}
        <div
          ref={modalScrollRef}
          className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto"
        >
          {/* Variant Selector — hanya tampil di katalog */}
          {hasVariants && (
            <div className="mb-6">
              <span className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                Pilih Format Buku:
              </span>
              <div className="flex flex-wrap gap-2">
                {variants!.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setActiveVariant(v)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all flex flex-col items-start ${
                      activeVariant.id === v.id
                        ? 'bg-[#FFF9F0] border-[#8B5E3C] text-[#8B5E3C] ring-2 ring-orange-200'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-orange-300'
                    }`}
                  >
                    <span>{v.type}</span>
                    <span className="text-xs font-normal">
                      Rp {(v.price ?? 0).toLocaleString('id-ID')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <StatusBadge status={activeVariant.status} size="md" />
            {activeVariant.type && (
              <span className="inline-block px-3 py-1 bg-orange-100 text-[#8B5E3C] text-xs font-bold rounded-full">
                {activeVariant.type}
              </span>
            )}
            {activeVariant.age && (
              <span className="inline-block px-3 py-1 bg-[#FF9E9E] text-white text-xs font-bold rounded-full">
                {activeVariant.age}
              </span>
            )}
            {activeVariant.category && (
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                {activeVariant.category}
              </span>
            )}
          </div>

          {/* Judul & Harga */}
          <h3 className="text-2xl md:text-4xl font-bold text-[#8B5E3C] mb-2 leading-tight">
            {activeVariant.title}
          </h3>
          <p className="text-3xl font-bold text-[#FF9E9E] mb-6">
            Rp {(activeVariant.price ?? 0).toLocaleString('id-ID')}
          </p>

          {/* Info Status & ETA */}
          <div className="bg-slate-50 p-4 rounded-xl mb-6 text-sm text-slate-700 border border-slate-100">
            <div className="flex justify-between mb-1">
              <span>Status:</span>
              <span className="font-bold">
                {activeVariant.status === 'READY'
                  ? 'Tersedia'
                  : activeVariant.status === 'PO'
                  ? 'Pre-Order'
                  : 'Belum Masuk Batch PO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimasi Tiba:</span>
              <span className="font-bold text-[#8B5E3C]">
                {activeVariant.eta || 'Hubungi Admin'}
              </span>
            </div>
          </div>

          {/* Detail */}
          <div className="space-y-3 mb-6 text-sm text-slate-600 border-t border-dashed border-gray-200 pt-4">
            {activeVariant.author && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-orange-300" />
                <span>Penulis: {activeVariant.author}</span>
              </div>
            )}
            {activeVariant.publisher && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-300" />
                <span>Penerbit: {activeVariant.publisher}</span>
              </div>
            )}
            {activeVariant.pages && (
              <div className="flex items-center gap-2">
                <BookIcon className="w-4 h-4 text-orange-300" />
                <span>Spesifikasi: {activeVariant.pages}</span>
              </div>
            )}
            {(activeVariant.description || activeVariant.desc) && (
              <div className="flex items-start gap-2 mt-2">
                <Globe className="w-4 h-4 text-orange-300 mt-1 flex-shrink-0" />
                <span className="leading-relaxed">
                  {activeVariant.description || activeVariant.desc}
                </span>
              </div>
            )}
          </div>

          {/* Preview Embed */}
          {activeVariant.previewurl && (
            <div className="mb-6">
              <h4 className="font-bold text-[#8B5E3C] mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" /> Preview Buku
              </h4>
              {isEmbeddable(activeVariant.previewurl) ? (
                <>
                  <div
                    className={`relative w-full rounded-xl overflow-hidden shadow-sm border border-orange-100 ${
                      activeVariant.previewurl.includes('instagram')
                        ? 'h-[550px]'
                        : 'aspect-video'
                    }`}
                  >
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={getEmbedUrl(activeVariant.previewurl) as string}
                      title={`Preview buku ${activeVariant.title}`}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                      sandbox="allow-scripts allow-same-origin allow-presentation"
                      allowFullScreen
                    />
                  </div>
                  <a
                    href={activeVariant.previewurl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-orange-400 hover:text-orange-600 mt-1 inline-block underline"
                  >
                    Buka di aplikasi
                  </a>
                </>
              ) : (
                <a
                  href={activeVariant.previewurl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <BookIcon className="w-6 h-6 text-[#8B5E3C]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#8B5E3C] text-sm">
                        Lihat Isi Buku (Look Inside)
                      </p>
                      <p className="text-xs text-orange-400">
                        Preview tersedia di website eksternal
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#8B5E3C] group-hover:translate-x-1 transition-transform" />
                </a>
              )}
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-3 mb-8 border-b border-gray-100 pb-8 mt-auto">
            {isBacklisted ? (
              <a
                href={getWaLink(activeVariant)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-white py-3 rounded-xl font-bold text-center bg-slate-500 hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <MessageCircle className="w-5 h-5" /> Tanya Jadwal PO
              </a>
            ) : (
              <button
                onClick={() => {
                  addToCart(activeVariant);
                  onClose();
                }}
                className="flex-1 text-white py-3 rounded-xl font-bold text-center bg-[#8B5E3C] hover:bg-[#6D4C41] transition-colors flex items-center justify-center gap-2 shadow-md"
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
}