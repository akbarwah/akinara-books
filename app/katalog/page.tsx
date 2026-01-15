'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../../supabaseClient'; 
import { 
  X, Search, Filter, Truck, Clock, Bookmark, 
  MessageCircle, Eye, User, Building2, Book as BookIcon, Globe, 
  ChevronDown, ArrowLeft, ShoppingBag, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Layers // Import icon baru
} from 'lucide-react';
import Link from 'next/link';

// --- 1. UTILITY COMPONENT ---
const Reveal = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { 
      if (entry.isIntersecting) { setIsVisible(true); if (ref.current) observer.unobserve(ref.current); } 
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);
  return <div ref={ref} className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

// --- 2. HELPER FUNCTIONS ---
const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('youtu.be')) videoId = url.split('/').pop()?.split('?')[0] || '';
        else if (url.includes('watch?v=')) videoId = url.split('v=')[1]?.split('&')[0] || '';
        else if (url.includes('/embed/')) return url;
        return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('instagram.com')) {
        let cleanUrl = url.split('?')[0]; 
        if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
        cleanUrl = cleanUrl.replace('/reel/', '/p/');
        return `${cleanUrl}/embed`;
    }
    return url;
};

const getWaLink = (book: any) => {
    const phone = "6282314336969"; 
    let text = "";
    if (book.status === 'READY') {
        text = `Halo Admin Akinara, saya mau pesan buku *${book.title}* (${book.type}) yang Ready Stock.`;
    } else if (book.status === 'PO') {
        text = `Halo Admin Akinara, saya mau ikut PO Batch ini untuk buku *${book.title}* (${book.type}).`;
    } else {
        text = `Halo Admin Akinara, saya tertarik dengan buku *${book.title}* (${book.type}). Apakah varian ini akan ada di Batch PO berikutnya?`;
    }
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

// --- 3. DEFINISI TIPE DATA ---
type Book = {
  id: number;
  title: string;
  price: number;
  image: string;
  author: string;
  publisher: string;
  category: string; 
  type: string;     
  age: string;
  status: string;
  pages: string;
  description: string; 
  desc?: string;       
  previewurl: string;
  eta?: string;
};

type BookGroup = {
    title: string;
    books: Book[]; 
}

// --- 4. KOMPONEN UTAMA ---
export default function KatalogPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Modal Grouping
  const [selectedGroup, setSelectedGroup] = useState<BookGroup | null>(null);
  const [activeVariant, setActiveVariant] = useState<Book | null>(null);

  // State Filter
  const [filterSearch, setFilterSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua'); 
  const [filterCategory, setFilterCategory] = useState('Semua'); 
  const [filterAge, setFilterAge] = useState('Semua');       
  const [filterType, setFilterType] = useState('Semua');
  const [filterPublisher, setFilterPublisher] = useState('Semua');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; 

  // Ref untuk Auto Scroll
  const topRef = useRef<HTMLDivElement>(null);

  // Fetch Data
  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('id', { ascending: true });

      if (error) console.error('Error fetching:', error);
      else setBooks(data || []);
      setLoading(false);
    }
    fetchBooks();
  }, []);

  // Reset page saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filterSearch, filterStatus, filterCategory, filterAge, filterType, filterPublisher]);

  // Saat grup dipilih, otomatis pilih varian pertama (prioritas READY)
  useEffect(() => {
    if (selectedGroup && selectedGroup.books.length > 0) {
        const readyVariant = selectedGroup.books.find(b => b.status === 'READY');
        setActiveVariant(readyVariant || selectedGroup.books[0]);
    }
  }, [selectedGroup]);

  // --- LOGIC FILTER OTOMATIS ---
  const uniquePublishers = useMemo(() => ['Semua', ...Array.from(new Set(books.map(b => b.publisher).filter(Boolean))).sort()], [books]);
  const uniqueAges = useMemo(() => ['Semua', ...Array.from(new Set(books.map(b => b.age).filter(Boolean))).sort()], [books]);
  const uniqueTypes = useMemo(() => ['Semua', ...Array.from(new Set(books.map(b => b.type).filter(Boolean))).sort()], [books]);

  // --- LOGIC GROUPING & FILTER ---
  const processedBooks = useMemo(() => {
    const filtered = books.filter(book => {
        const matchSearch = book.title.toLowerCase().includes(filterSearch.toLowerCase()) || 
                            (book.author && book.author.toLowerCase().includes(filterSearch.toLowerCase()));
        
        const matchStatus = filterStatus === 'Semua' || book.status === filterStatus; 
        const matchCategory = filterCategory === 'Semua' || book.category === filterCategory; 
        const matchAge = filterAge === 'Semua' || book.age === filterAge;             
        const matchType = filterType === 'Semua' || book.type === filterType;
        const matchPublisher = filterPublisher === 'Semua' || book.publisher === filterPublisher;

        return matchSearch && matchStatus && matchCategory && matchAge && matchType && matchPublisher;
    });

    const groups: { [key: string]: Book[] } = {};
    filtered.forEach(book => {
        const cleanTitle = book.title.trim();
        if (!groups[cleanTitle]) {
            groups[cleanTitle] = [];
        }
        groups[cleanTitle].push(book);
    });

    return Object.keys(groups).map(title => ({
        title,
        books: groups[title]
    }));

  }, [books, filterSearch, filterStatus, filterCategory, filterAge, filterType, filterPublisher]);

  // --- PAGINATION LOGIC (LIMIT 10 PAGES BLOCK) ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGroups = processedBooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(processedBooks.length / itemsPerPage);

  // Logic untuk menampilkan nomor halaman (Block 10 halaman)
  // Jika page 1-10 -> tampil 1...10
  // Jika page 11 -> tampil 11...20
  const maxPageButtons = 10;
  const startPage = Math.floor((currentPage - 1) / maxPageButtons) * maxPageButtons + 1;
  const endPage = Math.min(startPage + maxPageButtons - 1, totalPages);
  
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // Fungsi Ganti Halaman + Auto Scroll
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll halus ke bagian atas grid buku
    if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] font-sans text-[#6D4C41]">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-[#FFF9F0]/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-[#8B5E3C] hover:text-[#FF9E9E] transition-colors font-bold">
            <ArrowLeft className="w-5 h-5" /> Kembali
          </Link>
          <div className="text-xl font-bold text-[#8B5E3C]">
            Akinara<span className="text-[#FF9E9E]">Catalog</span>
          </div>
          <a href="https://shopee.co.id/akinarabooks" target="_blank" className="bg-[#FF9E9E] text-white p-2 rounded-full hover:bg-[#ff8585] transition-colors">
            <ShoppingBag className="w-5 h-5" />
          </a>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <Reveal>
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#8B5E3C] mb-4">
              Koleksi Buku Pilihan
            </h1>
            <p className="text-[#6D4C41] text-base md:text-lg max-w-2xl mx-auto">
              Temukan buku yang tepat berdasarkan usia, status ketersediaan, atau kategori.
            </p>
          </div>
        </Reveal>

        {/* --- FILTER BAR --- */}
        {/* Tambahkan ref di sini agar scroll kembali ke filter/atas grid */}
        <div ref={topRef} className="scroll-mt-24"></div> 
        <Reveal delay={100}>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 mb-10">
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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Filter Loops */}
              {[
                  { label: "Status", val: filterStatus, set: setFilterStatus, opts: ["READY", "PO", "REFERENSI"], default: "Semua Status" },
                  { label: "Jenis Buku", val: filterCategory, set: setFilterCategory, opts: ["Impor", "Lokal"], default: "Semua Jenis" },
                  { label: "Umur", val: filterAge, set: setFilterAge, opts: uniqueAges.filter(x => x !== 'Semua'), default: "Semua Umur" },
                  { label: "Penerbit", val: filterPublisher, set: setFilterPublisher, opts: uniquePublishers.filter(x => x !== 'Semua'), default: "Semua Penerbit" },
                  { label: "Format", val: filterType, set: setFilterType, opts: uniqueTypes.filter(x => x !== 'Semua'), default: "Semua Format" }
              ].map((f, i) => (
                <div key={i} className="relative">
                    <label className="text-xs font-bold text-orange-400 ml-1 mb-1 block">{f.label}</label>
                    <div className="relative">
                    <select 
                        value={f.val}
                        onChange={(e) => f.set(e.target.value)}
                        className="w-full appearance-none px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[#8B5E3C] font-medium focus:outline-none focus:border-[#FF9E9E] truncate pr-8"
                    >
                        <option value="Semua">{f.default}</option>
                        {f.opts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-between items-center border-t border-gray-100 pt-3">
              <button 
                onClick={() => {
                  setFilterType('Semua'); setFilterStatus('Semua'); setFilterCategory('Semua');
                  setFilterAge('Semua'); setFilterPublisher('Semua'); setFilterSearch('');
                }}
                className="text-xs text-[#FF9E9E] font-bold hover:underline"
              >
                Reset Semua Filter
              </button>
              <span className="text-xs text-orange-400 font-medium">
                Total: <b>{processedBooks.length}</b> Judul
              </span>
            </div>
          </div>
        </Reveal>

        {/* --- GRID BUKU --- */}
        {loading ? (
          <div className="text-center py-20">
             <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-[#8B5E3C] rounded-full animate-spin mb-2"></div>
             <p className="text-[#8B5E3C]">Sedang mengambil buku...</p>
          </div>
        ) : processedBooks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-orange-200">
            <p className="text-lg text-gray-400">Tidak ada buku yang cocok dengan filter ini.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {currentGroups.map((group, idx) => {
                const displayBook = group.books[0];
                const prices = group.books.map(b => b.price);
                const minPrice = Math.min(...prices);
                const hasVariants = group.books.length > 1;

                return (
                    <Reveal key={idx} delay={idx * 50}>
                    <div 
                        onClick={() => setSelectedGroup(group)} 
                        className="group relative bg-white p-3 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border border-transparent hover:border-orange-100 h-full flex flex-col"
                    >
                        {/* Image Container */}
                        <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4 relative bg-gray-100">
                            <img 
                                src={displayBook.image} 
                                alt={displayBook.title} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                loading="lazy"
                            />
                            
                            {/* --- BADGES --- */}
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
                                        <Bookmark className="w-3 h-3" /> REFERENSI
                                    </span>
                                )}
                            </div>

                            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                                <span className="bg-white/90 text-[10px] px-2 py-0.5 rounded-full font-bold text-[#8B5E3C] shadow-sm">{displayBook.type}</span>
                                <span className="bg-[#FF9E9E]/90 text-[10px] px-2 py-0.5 rounded-full font-bold text-white shadow-sm">{displayBook.age}</span>
                            </div>

                            {/* INDICATOR VARIAN */}
                            {hasVariants && (
                                <div className="absolute bottom-2 right-2 z-10">
                                    <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md flex items-center gap-1">
                                        <Layers className="w-3 h-3" /> {group.books.length} Opsi
                                    </span>
                                </div>
                            )}

                            {/* HOVER OVERLAY */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="bg-white/90 text-[#8B5E3C] px-3 py-1 rounded-full text-xs font-bold transform scale-90 group-hover:scale-100 transition-transform">Lihat Detail</span>
                            </div>
                        </div>

                        <h3 className="font-bold text-[#8B5E3C] mb-1 line-clamp-2 leading-tight text-left flex-grow">
                        {displayBook.title}
                        </h3>
                        
                        <div className="mt-2">
                            <p className="text-[#FF9E9E] font-bold text-lg">
                                {hasVariants && <span className="text-sm text-gray-400 font-normal mr-1">Mulai</span>}
                                Rp {minPrice.toLocaleString('id-ID')}
                            </p>
                            <p className="text-xs text-gray-400 mb-1">{displayBook.category}</p>
                        </div>
                    </div>
                    </Reveal>
                );
              })}
            </div>

            {/* --- SMART PAGINATION (FIXED) --- */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
                
                {/* First Page */}
                <button 
                  onClick={() => paginate(1)} 
                  disabled={currentPage === 1}
                  className="p-2 rounded-full border border-orange-200 text-[#8B5E3C] hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="First Page"
                >
                  <ChevronsLeft className="w-5 h-5" />
                </button>

                {/* Prev Page */}
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="p-2 rounded-full border border-orange-200 text-[#8B5E3C] hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {/* Page Numbers (1-10, 11-20...) */}
                <div className="flex gap-2">
                  {pageNumbers.map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`w-10 h-10 rounded-full font-bold text-sm transition-all flex-shrink-0 ${
                        currentPage === number 
                          ? 'bg-[#8B5E3C] text-white shadow-lg scale-110' 
                          : 'bg-white text-[#8B5E3C] border border-orange-100 hover:bg-orange-50'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>

                {/* Next Page */}
                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full border border-orange-200 text-[#8B5E3C] hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Next Page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Last Page */}
                <button 
                  onClick={() => paginate(totalPages)} 
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full border border-orange-200 text-[#8B5E3C] hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Last Page"
                >
                  <ChevronsRight className="w-5 h-5" />
                </button>

              </div>
            )}
          </>
        )}
      </div>

      {/* --- MODAL POPUP --- */}
      {selectedGroup && activeVariant && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="absolute inset-0" onClick={() => setSelectedGroup(null)}></div>
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full overflow-hidden flex flex-col md:flex-row animate-scale-up max-h-[90vh]">
                <button onClick={() => setSelectedGroup(null)} className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white text-gray-500 hover:text-red-500 transition-colors shadow-sm"><X className="w-6 h-6" /></button>
                
                {/* Gambar Kiri */}
                <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-6 md:p-8">
                    <img src={activeVariant.image} alt={activeVariant.title} className="max-w-full max-h-[300px] md:max-h-[500px] object-contain rounded-lg shadow-md" />
                </div>
                
                {/* Info Kanan */}
                <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col text-left overflow-y-auto">
                    {/* VARIANT SELECTOR */}
                    {selectedGroup.books.length > 1 && (
                        <div className="mb-6">
                            <span className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Pilih Format Buku:</span>
                            <div className="flex flex-wrap gap-2">
                                {selectedGroup.books.map((bookVar) => (
                                    <button 
                                        key={bookVar.id}
                                        onClick={() => setActiveVariant(bookVar)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all flex flex-col items-start ${
                                            activeVariant.id === bookVar.id 
                                            ? 'bg-[#FFF9F0] border-[#8B5E3C] text-[#8B5E3C] ring-2 ring-orange-200' 
                                            : 'bg-white border-gray-200 text-gray-500 hover:border-orange-300'
                                        }`}
                                    >
                                        <span>{bookVar.type}</span>
                                        <span className="text-xs font-normal">Rp {bookVar.price.toLocaleString('id-ID')}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* DETAIL VARIAN */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {activeVariant.status === 'READY' ? (
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">READY STOCK</span>
                        ) : activeVariant.status === 'PO' ? (
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">PRE-ORDER</span>
                        ) : (
                            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">KATALOG REFERENSI</span>
                        )}
                        <span className="inline-block px-3 py-1 bg-[#FF9E9E] text-white text-xs font-bold rounded-full">{activeVariant.age}</span>
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">{activeVariant.category}</span>
                        {selectedGroup.books.length === 1 && (
                            <span className="inline-block px-3 py-1 bg-orange-100 text-[#8B5E3C] text-xs font-bold rounded-full">{activeVariant.type}</span>
                        )}
                    </div>
                    <h3 className="text-2xl md:text-4xl font-bold text-[#8B5E3C] mb-2 leading-tight">{activeVariant.title}</h3>
                    <p className="text-3xl font-bold text-[#FF9E9E] mb-6">Rp {activeVariant.price?.toLocaleString('id-ID')}</p>
                    <div className="bg-slate-50 p-4 rounded-xl mb-6 text-sm text-slate-700 border border-slate-100">
                        <div className="flex justify-between mb-1">
                            <span>Status:</span>
                            <span className="font-bold">
                                {activeVariant.status === 'READY' ? 'Tersedia' : 
                                 activeVariant.status === 'PO' ? 'Pre-Order' : 'Belum Masuk Batch PO'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Estimasi Tiba:</span>
                            <span className="font-bold text-[#8B5E3C]">{activeVariant.eta || 'Hubungi Admin'}</span>
                        </div>
                    </div>
                    <div className="space-y-3 mb-6 text-sm text-slate-600">
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-orange-300" /><span>Penulis: {activeVariant.author}</span></div>
                        <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-orange-300" /><span>Penerbit: {activeVariant.publisher}</span></div>
                        <div className="flex items-center gap-2"><BookIcon className="w-4 h-4 text-orange-300" /><span>Spesifikasi: {activeVariant.pages}</span></div>
                        <div className="flex items-start gap-2 mt-2 pt-2 border-t border-dashed border-orange-100">
                            <Globe className="w-4 h-4 text-orange-300 mt-1 flex-shrink-0" />
                            <span className="leading-relaxed">{activeVariant.description || activeVariant.desc || "Belum ada deskripsi."}</span>
                        </div>
                    </div>
                    {activeVariant.previewurl && (
                        <div className="mb-6">
                            <h4 className="font-bold text-[#8B5E3C] mb-2 flex items-center gap-2">
                                <Eye className="w-4 h-4" /> Preview Buku
                            </h4>
                            <div className={`relative w-full rounded-xl overflow-hidden shadow-sm border border-orange-100 ${activeVariant.previewurl.includes('instagram') ? 'h-[550px]' : 'aspect-video'}`}>
                                <iframe className="absolute inset-0 w-full h-full" src={getEmbedUrl(activeVariant.previewurl) as string} title="Review Preview" allowFullScreen></iframe>
                            </div>
                            <a href={activeVariant.previewurl} target="_blank" className="text-xs text-orange-400 hover:text-orange-600 mt-1 inline-block underline">Buka di aplikasi</a>
                        </div>
                    )}
                    <div className="flex gap-3 mt-auto pt-4">
                         <a href={getWaLink(activeVariant)} target="_blank" className={`flex-1 text-white py-3 rounded-xl font-bold text-center hover:bg-[#6D4C41] transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg ${activeVariant.status === 'REFERENSI' ? 'bg-slate-500 hover:bg-slate-600' : 'bg-[#8B5E3C] hover:bg-[#6D4C41]'}`}>
                            <MessageCircle className="w-5 h-5" /> 
                            {activeVariant.status === 'READY' ? 'Beli Sekarang' : 
                             activeVariant.status === 'PO' ? 'Ikut PO Sekarang' : 
                             'Tanya Jadwal PO'}
                        </a>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}