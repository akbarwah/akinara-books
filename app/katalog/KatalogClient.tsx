// app/katalog/KatalogClient.tsx
'use client';

import React, {
  useState, useRef,
  useMemo, Suspense, useCallback
} from 'react';
import {
  Search, Filter, Truck, Clock, Bookmark,
  ChevronDown, ArrowLeft, ShoppingBag,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Layers, ShoppingCart
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '../context/CartContext';
import type { Book } from '@/app/types/book';
import Reveal from '../components/Reveal';
import CartDrawer from '../components/CartDrawer';
import StickerBadge from '../components/StickerBadge';
import BookDetailModal from '../components/BookDetailModal';
import {
  PLACEHOLDER_IMAGE,
  getSeriesPrefix,
} from '../components/helpers/bookHelpers';

// ============================================================
// TIPE
// ============================================================
type BookGroup = {
  title: string;
  books: Book[];
};

// ============================================================
// KONSTANTA
// ============================================================
const ITEMS_PER_PAGE = 12;
const MAX_PAGE_BUTTONS = 10;

// ============================================================
// KOMPONEN: FILTER BAR
// ============================================================
interface FilterBarProps {
  filterSearch: string;
  setFilterSearch: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  filterCategory: string;
  setFilterCategory: (v: string) => void;
  filterAge: string;
  setFilterAge: (v: string) => void;
  filterType: string;
  setFilterType: (v: string) => void;
  filterPublisher: string;
  setFilterPublisher: (v: string) => void;
  uniqueAges: string[];
  uniqueTypes: string[];
  uniquePublishers: string[];
  totalResults: number;
  onReset: () => void;
}

const FilterBar = ({
  filterSearch, setFilterSearch,
  filterStatus, setFilterStatus,
  filterCategory, setFilterCategory,
  filterAge, setFilterAge,
  filterType, setFilterType,
  filterPublisher, setFilterPublisher,
  uniqueAges, uniqueTypes, uniquePublishers,
  totalResults, onReset,
}: FilterBarProps) => {
  const dynamicFilters = [
    {
      label: 'Status',
      val: filterStatus,
      set: setFilterStatus,
      opts: ['READY', 'PO', 'BACKLIST'],
      default: 'Semua Status',
    },
    {
      label: 'Jenis Buku',
      val: filterCategory,
      set: setFilterCategory,
      opts: ['Impor', 'Lokal'],
      default: 'Semua Jenis',
    },
    {
      label: 'Umur',
      val: filterAge,
      set: setFilterAge,
      opts: uniqueAges.filter((x) => x !== 'Semua'),
      default: 'Semua Umur',
    },
    {
      label: 'Penerbit',
      val: filterPublisher,
      set: setFilterPublisher,
      opts: uniquePublishers.filter((x) => x !== 'Semua'),
      default: 'Semua Penerbit',
    },
    {
      label: 'Format',
      val: filterType,
      set: setFilterType,
      opts: uniqueTypes.filter((x) => x !== 'Semua'),
      default: 'Semua Format',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 mb-10">
      {/* Search row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-[#8B5E3C] font-bold text-lg w-full md:w-auto">
          <Filter className="w-5 h-5" /> Filter Pencarian
        </div>
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari judul atau penulis..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-[#FF9E9E]/50 bg-[#FFF9F0]"
          />
        </div>
      </div>

      {/* Filter dropdowns */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {dynamicFilters.map((f) => (
          <div key={f.label} className="relative">
            <label className="text-xs font-bold text-orange-400 ml-1 mb-1 block">
              {f.label}
            </label>
            <div className="relative">
              <select
                value={f.val}
                onChange={(e) => f.set(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[#8B5E3C] font-medium focus:outline-none focus:border-[#FF9E9E] truncate pr-8"
              >
                <option value="Semua">{f.default}</option>
                {f.opts.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer row */}
      <div className="mt-4 flex justify-between items-center border-t border-gray-100 pt-3">
        <button
          onClick={onReset}
          className="text-xs text-[#FF9E9E] font-bold hover:underline"
        >
          Reset Semua Filter
        </button>
        <span className="text-xs text-orange-400 font-medium">
          Total: <b>{totalResults}</b> Judul
        </span>
      </div>
    </div>
  );
};

// ============================================================
// KOMPONEN: PAGINATION
// ============================================================
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  const startPage =
    Math.floor((currentPage - 1) / MAX_PAGE_BUTTONS) * MAX_PAGE_BUTTONS + 1;
  const endPage = Math.min(startPage + MAX_PAGE_BUTTONS - 1, totalPages);
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        aria-label="Halaman pertama"
        className="p-2 rounded-full border border-orange-200 text-[#8B5E3C] hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronsLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Halaman sebelumnya"
        className="p-2 rounded-full border border-orange-200 text-[#8B5E3C] hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex gap-2">
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            aria-label={`Halaman ${number}`}
            aria-current={currentPage === number ? 'page' : undefined}
            className={`w-10 h-10 rounded-full font-bold text-sm transition-all shrink-0 ${currentPage === number
              ? 'bg-[#8B5E3C] text-white shadow-lg scale-110'
              : 'bg-white text-[#8B5E3C] border border-orange-100 hover:bg-orange-50'
              }`}
          >
            {number}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Halaman berikutnya"
        className="p-2 rounded-full border border-orange-200 text-[#8B5E3C] hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Halaman terakhir"
        className="p-2 rounded-full border border-orange-200 text-[#8B5E3C] hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronsRight className="w-5 h-5" />
      </button>
    </div>
  );
};

// ============================================================
// KOMPONEN: BOOK GRID CARD
// ============================================================
// ============================================================
// KOMPONEN: BOOK GRID CARD (UPDATED — Link instead of onClick)
// ============================================================
const BookGridCard = ({
  group,
  onClick,
}: {
  group: BookGroup;
  onClick: (group: BookGroup) => void;
}) => {
  const displayBook = group.books[0];
  const prices = group.books.map((b) => b.price ?? 0);
  const minPrice = Math.min(...prices);
  const hasVariants = group.books.length > 1;

  const [imgSrc, setImgSrc] = useState(
    displayBook.image || PLACEHOLDER_IMAGE
  );

  // Jika buku punya slug, gunakan <Link> ke halaman detail
  // Jika tidak (fallback), gunakan onClick untuk modal
  const slug = displayBook.slug;

  const cardContent = (
    <>
      {displayBook.sticker_text && (
        <StickerBadge type={displayBook.sticker_text} />
      )}

      <div className="aspect-3/4 rounded-xl overflow-hidden mb-4 relative bg-gray-100">
        <img
          src={imgSrc}
          alt={`Cover buku ${displayBook.title}${displayBook.author ? ` karya ${displayBook.author}` : ''}${displayBook.category ? ` - ${displayBook.category}` : ''}`}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
        />

        {/* Status badge */}
        <div className="absolute top-2 right-2 z-10">
          {displayBook.status === 'READY' ? (
            <span className="bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md flex items-center gap-1">
              <Truck className="w-3 h-3" /> READY
            </span>
          ) : displayBook.status === 'PO' ? (
            <span className="bg-blue-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md flex items-center gap-1">
              <Clock className="w-3 h-3" /> PO
            </span>
          ) : (
            <span className="bg-slate-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md flex items-center gap-1">
              <Bookmark className="w-3 h-3" /> BACKLIST
            </span>
          )}
        </div>

        {/* Type & Age badge */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {displayBook.type && (
            <span className="bg-white/90 text-[10px] px-2 py-0.5 rounded-full font-bold text-[#8B5E3C] shadow-sm">
              {displayBook.type}
            </span>
          )}
          {displayBook.age && (
            <span className="bg-[#FF9E9E]/90 text-[10px] px-2 py-0.5 rounded-full font-bold text-white shadow-sm">
              {displayBook.age}
            </span>
          )}
        </div>

        {/* Variant count */}
        {hasVariants && (
          <div className="absolute bottom-2 right-2 z-10">
            <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md flex items-center gap-1">
              <Layers className="w-3 h-3" /> {group.books.length} Opsi
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/90 text-[#8B5E3C] px-3 py-1 rounded-full text-xs font-bold transform scale-90 group-hover:scale-100 transition-transform">
            Lihat Detail
          </span>
        </div>
      </div>

      <h2 className="font-bold text-[#8B5E3C] mb-1 line-clamp-2 leading-tight text-left grow text-sm">
        {displayBook.title}
      </h2>
      <div className="mt-2">
        <p className="text-[#FF9E9E] font-bold text-lg">
          {hasVariants && (
            <span className="text-sm text-gray-400 font-normal mr-1">Mulai</span>
          )}
          Rp {minPrice.toLocaleString('id-ID')}
        </p>
        <p className="text-xs text-gray-400 mb-1">{displayBook.category}</p>
      </div>
    </>
  );

  // Jika ada slug → Link ke halaman detail (SEO friendly)
  if (slug) {
    return (
      <Link
        href={`/katalog/${slug}`}
        className="group relative bg-white p-3 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-transparent hover:border-orange-100 h-full flex flex-col"
      >
        {cardContent}
      </Link>
    );
  }

  // Fallback: onClick untuk modal (jika slug belum ada)
  return (
    <div
      onClick={() => onClick(group)}
      className="group relative bg-white p-3 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border border-transparent hover:border-orange-100 h-full flex flex-col"
    >
      {cardContent}
    </div>
  );
};

// ============================================================
// KOMPONEN: KATALOG CONTENT
// ============================================================
function KatalogContent({ initialBooks }: { initialBooks: Book[] }) {
  const [books] = useState<Book[]>(initialBooks); // ✅ Tidak perlu fetch lagi
  const [selectedGroup, setSelectedGroup] = useState<BookGroup | null>(null);

  // ✅ Restore filter terakhir dari sessionStorage
  const savedFilters = typeof window !== 'undefined'
    ? JSON.parse(sessionStorage.getItem('katalog_filters') || 'null')
    : null;

  const [filterSearch, setFilterSearch] = useState(savedFilters?.search || '');
  const [filterStatus, setFilterStatus] = useState(savedFilters?.status || 'Semua');
  const [filterCategory, setFilterCategory] = useState(savedFilters?.category || 'Semua');
  const [filterAge, setFilterAge] = useState(savedFilters?.age || 'Semua');
  const [filterType, setFilterType] = useState(savedFilters?.type || 'Semua');
  const [filterPublisher, setFilterPublisher] = useState(savedFilters?.publisher || 'Semua');

  const router = useRouter();
  const searchParams = useSearchParams();
  const topRef = useRef<HTMLDivElement>(null);
  const currentPage = Number(searchParams.get('page')) || 1;
  const { getCartCount, setIsCartOpen } = useCart();

  // ✅ Publisher param dari banner PO (override sessionStorage)
  const publisherParam = searchParams.get('publisher');
  React.useEffect(() => {
    if (publisherParam) {
      setFilterPublisher(publisherParam);
    }
  }, [publisherParam]);

  // ✅ Simpan filter ke sessionStorage setiap kali berubah
  React.useEffect(() => {
    sessionStorage.setItem('katalog_filters', JSON.stringify({
      search: filterSearch,
      status: filterStatus,
      category: filterCategory,
      age: filterAge,
      type: filterType,
      publisher: filterPublisher,
    }));
  }, [filterSearch, filterStatus, filterCategory, filterAge, filterType, filterPublisher]);

  // Reset ke page 1 saat filter berubah
  const handleResetFilters = useCallback(() => {
    setFilterSearch('');
    setFilterStatus('Semua');
    setFilterCategory('Semua');
    setFilterAge('Semua');
    setFilterType('Semua');
    setFilterPublisher('Semua');
    sessionStorage.removeItem('katalog_filters');
    router.push('?page=1', { scroll: false });
  }, [router]);

  // Paginate
  const paginate = useCallback(
    (pageNumber: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', pageNumber.toString());
      router.push(`?${params.toString()}`);
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [router, searchParams]
  );

  const uniquePublishers = useMemo(
    () => [
      'Semua',
      ...Array.from(
        new Set(
          books
            .map((b) => b.publisher)
            .filter((x): x is string => typeof x === 'string' && x.length > 0)
        )
      ).sort(),
    ],
    [books]
  );

  const uniqueAges = useMemo(
    () => [
      'Semua',
      ...Array.from(
        new Set(
          books
            .map((b) => b.age)
            .filter((x): x is string => typeof x === 'string' && x.length > 0)
        )
      ).sort(),
    ],
    [books]
  );

  const uniqueTypes = useMemo(
    () => [
      'Semua',
      ...Array.from(
        new Set(
          books
            .map((b) => b.type)
            .filter((x): x is string => typeof x === 'string' && x.length > 0)
        )
      ).sort(),
    ],
    [books]
  );

  // Filtered & grouped books
  const processedGroups = useMemo(() => {
    const filtered = books.filter((book) => {
      const q = filterSearch.toLowerCase();
      const matchSearch =
        book.title.toLowerCase().includes(q) ||
        (book.author?.toLowerCase().includes(q) ?? false);
      const matchStatus =
        filterStatus === 'Semua' || book.status === filterStatus;
      const matchCategory =
        filterCategory === 'Semua' || book.category === filterCategory;
      const matchAge =
        filterAge === 'Semua' || book.age === filterAge;
      const matchType =
        filterType === 'Semua' || book.type === filterType;
      const matchPublisher =
        filterPublisher === 'Semua' || book.publisher === filterPublisher;

      return (
        matchSearch &&
        matchStatus &&
        matchCategory &&
        matchAge &&
        matchType &&
        matchPublisher
      );
    });

    const groups: { [key: string]: Book[] } = {};
    filtered.forEach((book) => {
      const key = book.title.trim();
      if (!groups[key]) groups[key] = [];
      groups[key].push(book);
    });

    return Object.keys(groups).map((title) => ({
      title,
      books: groups[title],
    }));
  }, [
    books,
    filterSearch,
    filterStatus,
    filterCategory,
    filterAge,
    filterType,
    filterPublisher,
  ]);

  const totalPages = Math.ceil(processedGroups.length / ITEMS_PER_PAGE);
  const currentGroups = processedGroups.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const activeBookForRelated = selectedGroup?.books[0] ?? null;

  const relatedBooks = useMemo(() => {
    if (!activeBookForRelated || books.length === 0) return [];

    const currentSeries = getSeriesPrefix(activeBookForRelated.title);
    const activeTitleClean = activeBookForRelated.title.trim().toLowerCase();

    const scored = books
      .filter((b) => b.title.trim().toLowerCase() !== activeTitleClean)
      .map((b) => {
        let score = 0;
        if (
          getSeriesPrefix(b.title) === currentSeries &&
          currentSeries.length > 3
        )
          score += 10;
        if (
          b.author &&
          activeBookForRelated.author &&
          b.author === activeBookForRelated.author
        )
          score += 5;
        if (b.category === activeBookForRelated.category) score += 1;
        return { ...b, score };
      })
      .filter((b) => b.score > 0)
      .sort((a, b) => b.score - a.score);

    const unique: Book[] = [];
    const seen = new Set<string>();
    for (const b of scored) {
      const key = b.title.trim().toLowerCase();
      if (!seen.has(key)) {
        unique.push(b);
        seen.add(key);
      }
      if (unique.length >= 3) break;
    }
    return unique;
  }, [activeBookForRelated, books]);

  const handleRelatedClick = useCallback(
    (relBook: Book) => {
      const cleanTitle = relBook.title.trim();
      const groupBooks = books.filter((b) => b.title.trim() === cleanTitle);
      if (groupBooks.length > 0) {
        setSelectedGroup({ title: cleanTitle, books: groupBooks });
      }
    },
    [books]
  );

  const cartCount = getCartCount();

  return (
    <div className="min-h-screen bg-[#FFF9F0] font-sans text-[#6D4C41]">
      {/* Navbar katalog */}
      <nav
        className="sticky top-0 z-40 bg-[#FFF9F0]/90 backdrop-blur-md border-b border-orange-100 shadow-sm"
        aria-label="Navigasi katalog"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#8B5E3C] hover:text-[#FF9E9E] transition-colors font-bold"
          >
            <ArrowLeft className="w-5 h-5" /> Kembali
          </Link>

          <div className="text-xl font-bold text-[#8B5E3C]">
            Akinara<span className="text-[#FF9E9E]">Catalog</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label={`Keranjang belanja, ${cartCount} item`}
              className="relative p-2 text-[#8B5E3C] hover:text-[#FF9E9E] transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <a
              href="https://shopee.co.id/akinarabooks"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kunjungi Shopee Akinara Books"
              className="bg-[#FF9E9E] text-white p-2 rounded-full hover:bg-[#ff8585] transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-10">
            {/* ✅ H1 lebih keyword-rich */}
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#8B5E3C] mb-4">
              Koleksi Buku Anak Import & Lokal Pilihan
            </h1>
            {/* ✅ Deskripsi SEO lebih informatif */}
            <p className="text-[#6D4C41] text-base md:text-lg max-w-2xl mx-auto">
              Dikurasi khusus untuk si kecil.
              Filter by usia, format, atau status untuk menemukan buku yang tepat!
            </p>
          </div>
        </Reveal>

        <div ref={topRef} className="scroll-mt-24" />

        {/* Filter Bar */}
        <Reveal delay={100}>
          <FilterBar
            filterSearch={filterSearch}
            setFilterSearch={setFilterSearch}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterAge={filterAge}
            setFilterAge={setFilterAge}
            filterType={filterType}
            setFilterType={setFilterType}
            filterPublisher={filterPublisher}
            setFilterPublisher={setFilterPublisher}
            uniqueAges={uniqueAges}
            uniqueTypes={uniqueTypes}
            uniquePublishers={uniquePublishers}
            totalResults={processedGroups.length}
            onReset={handleResetFilters}
          />
        </Reveal>

        {/* Empty state */}
        {processedGroups.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-orange-200">
            <p className="text-lg text-gray-400">
              Tidak ada buku yang cocok dengan filter ini.
            </p>
          </div>
        ) : (
          <>
            {/* ✅ Grid buku — konten sudah di-render server-side */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {currentGroups.map((group, idx) => (
                <Reveal key={group.title} delay={idx * 50}>
                  <BookGridCard group={group} onClick={setSelectedGroup} />
                </Reveal>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={paginate}
            />
          </>
        )}
      </div>

      {selectedGroup && (
        <BookDetailModal
          book={selectedGroup.books[0]}
          variants={selectedGroup.books}
          relatedBooks={relatedBooks}
          onClose={() => setSelectedGroup(null)}
          onRelatedClick={handleRelatedClick}
        />
      )}

      <CartDrawer />
    </div>
  );
}

// ============================================================
// MAIN EXPORT
// ============================================================
export default function KatalogClient({ initialBooks }: { initialBooks: Book[] }) {
  return (
    // ✅ Suspense wajib karena KatalogContent pakai useSearchParams
    <Suspense
      fallback={
        <div className="text-center py-20 text-[#8B5E3C]">
          <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-[#8B5E3C] rounded-full animate-spin mb-2" />
          <p>Memuat Katalog...</p>
        </div>
      }
    >
      <KatalogContent initialBooks={initialBooks} />
    </Suspense>
  );
}