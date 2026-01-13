'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../../supabaseClient'; 
import { 
  X, Search, Filter, Truck, Clock, Bookmark, 
  MessageCircle, Eye, User, Building2, Book, Globe, 
  ChevronDown, ArrowLeft, ShoppingBag, ChevronLeft, ChevronRight
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
        text = `Halo Admin Akinara, saya mau pesan buku *${book.title}* yang Ready Stock.`;
    } else if (book.status === 'PO') {
        text = `Halo Admin Akinara, saya mau ikut PO Batch ini untuk buku *${book.title}*.`;
    } else {
        text = `Halo Admin Akinara, saya tertarik dengan buku *${book.title}*. Apakah buku ini akan ada di Batch PO berikutnya?`;
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

// --- 4. KOMPONEN UTAMA ---
export default function KatalogPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // State untuk Filter
  const [filterSearch, setFilterSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua'); 
  const [filterCategory, setFilterCategory] = useState('Semua'); // NEW: Filter Lokal/Impor
  const [filterAge, setFilterAge] = useState('Semua');       
  const [filterType, setFilterType] = useState('Semua');
  const [filterPublisher, setFilterPublisher] = useState('Semua');

  // State untuk Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; 

  // Fetch Data dari Supabase
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

  // Reset page ke 1 setiap kali filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filterSearch, filterStatus, filterCategory, filterAge, filterType, filterPublisher]);

  // --- LOGIC FILTER OTOMATIS ---
  const uniquePublishers = useMemo(() => {
    const pubs = books.map(b => b.publisher).filter(Boolean);
    return ['Semua', ...Array.from(new Set(pubs)).sort()];
  }, [books]);

  const uniqueAges = useMemo(() => {
    const ages = books.map(b => b.age).filter(Boolean);
    return ['Semua', ...Array.from(new Set(ages)).sort()];
  }, [books]);

  const uniqueTypes = useMemo(() => {
    const types = books.map(b => b.type).filter(Boolean);
    return ['Semua', ...Array.from(new Set(types)).sort()];
  }, [books]);

  // --- LOGIC PENYARINGAN DATA ---
  const filteredBooks = books.filter(book => {
    const matchSearch = book.title.toLowerCase().includes(filterSearch.toLowerCase()) || 
                        (book.author && book.author.toLowerCase().includes(filterSearch.toLowerCase()));
    
    const matchStatus = filterStatus === 'Semua' || book.status === filterStatus; 
    const matchCategory = filterCategory === 'Semua' || book.category === filterCategory; // NEW Logic
    const matchAge = filterAge === 'Semua' || book.age === filterAge;             
    const matchType = filterType === 'Semua' || book.type === filterType;
    const matchPublisher = filterPublisher === 'Semua' || book.publisher === filterPublisher;

    return matchSearch && matchStatus && matchCategory && matchAge && matchType && matchPublisher;
  });

  // --- LOGIC PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
        
        {/* HEADER */}
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

        {/* --- FILTER BAR (LENGKAP 5 KOLOM) --- */}
        <Reveal delay={100}>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 mb-10">
            {/* Baris 1: Search */}
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

            {/* Baris 2: Dropdown Filters (5 Kolom di Desktop) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              
              {/* 1. Filter STATUS */}
              <div className="relative">
                <label className="text-xs font-bold text-orange-400 ml-1 mb-1 block">Status Stok</label>
                <div className="relative">
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[#8B5E3C] font-medium focus:outline-none focus:border-[#FF9E9E] truncate"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="READY">Ready Stock</option>
                    <option value="PO">Pre-Order</option>
                    <option value="REFERENSI">Referensi</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* 2. Filter KATEGORI (LOKAL/IMPOR) - NEW */}
              <div className="relative">
                <label className="text-xs font-bold text-orange-400 ml-1 mb-1 block">Jenis Buku</label>
                <div className="relative">
                  <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[#8B5E3C] font-medium focus:outline-none focus:border-[#FF9E9E] truncate"
                  >
                    <option value="Semua">Semua Jenis</option>
                    <option value="Impor">Buku Impor</option>
                    <option value="Lokal">Buku Lokal</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* 3. Filter UMUR */}
              <div className="relative">
                <label className="text-xs font-bold text-orange-400 ml-1 mb-1 block">Umur</label>
                <div className="relative">
                  <select 
                    value={filterAge}
                    onChange={(e) => setFilterAge(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[#8B5E3C] font-medium focus:outline-none focus:border-[#FF9E9E] truncate"
                  >
                    {uniqueAges.map(age => (
                      <option key={age} value={age}>{age === 'Semua' ? 'Semua Umur' : age}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* 4. Filter PUBLISHER */}
              <div className="relative">
                <label className="text-xs font-bold text-orange-400 ml-1 mb-1 block">Penerbit</label>
                <div className="relative">
                  <select 
                    value={filterPublisher}
                    onChange={(e) => setFilterPublisher(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[#8B5E3C] font-medium focus:outline-none focus:border-[#FF9E9E] truncate"
                  >
                     {uniquePublishers.map(pub => (
                      <option key={pub} value={pub}>{pub === 'Semua' ? 'Semua Penerbit' : pub}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* 5. Filter Format Buku */}
              <div className="relative">
                <label className="text-xs font-bold text-orange-400 ml-1 mb-1 block">Format</label>
                <div className="relative">
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[#8B5E3C] font-medium focus:outline-none focus:border-[#FF9E9E] truncate"
                  >
                    {uniqueTypes.map(type => (
                      <option key={type} value={type}>{type === 'Semua' ? 'Semua Format' : type}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

            </div>
            
            {/* Info Hasil Filter */}
            <div className="mt-4 flex justify-between items-center border-t border-gray-100 pt-3">
              <button 
                onClick={() => {
                  setFilterType('Semua'); 
                  setFilterStatus('Semua'); 
                  setFilterCategory('Semua');
                  setFilterAge('Semua'); 
                  setFilterPublisher('Semua');
                  setFilterSearch('');
                }}
                className="text-xs text-[#FF9E9E] font-bold hover:underline"
              >
                Reset Semua Filter
              </button>
              <span className="text-xs text-orange-400 font-medium">
                Total: <b>{filteredBooks.length}</b> buku
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
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-orange-200">
            <p className="text-lg text-gray-400">Tidak ada buku yang cocok dengan filter ini.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {currentBooks.map((book, idx) => (
                <Reveal key={book.id} delay={idx * 50}>
                  <div 
                    onClick={() => setSelectedBook(book)} 
                    className="group relative bg-white p-3 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border border-transparent hover:border-orange-100 h-full flex flex-col"
                  >
                    {/* Image Container */}
                    <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4 relative bg-gray-100">
                      <img 
                        src={book.image} 
                        alt={book.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        loading="lazy"
                      />
                      
                      {/* STATUS BADGE */}
                      <div className="absolute top-2 right-2 z-10">
                          {book.status === 'READY' ? (
                              <span className="bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md flex items-center gap-1">
                                  <Truck className="w-3 h-3" /> READY
                              </span>
                          ) : book.status === 'PO' ? (
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
                           <span className="bg-white/90 text-[10px] px-2 py-0.5 rounded-full font-bold text-[#8B5E3C] shadow-sm">{book.type}</span>
                           <span className="bg-[#FF9E9E]/90 text-[10px] px-2 py-0.5 rounded-full font-bold text-white shadow-sm">{book.age}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-[#8B5E3C] mb-1 line-clamp-2 leading-tight text-left flex-grow">
                      {book.title}
                    </h3>
                    <div className="flex justify-between items-end mt-2">
                      <p className="text-[#FF9E9E] font-bold text-lg">
                        Rp {book.price?.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* --- PAGINATION CONTROLS --- */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="p-2 rounded-full border border-orange-200 text-[#8B5E3C] hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${
                        currentPage === number 
                          ? 'bg-[#8B5E3C] text-white shadow-lg scale-110' 
                          : 'bg-white text-[#8B5E3C] border border-orange-100 hover:bg-orange-50'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full border border-orange-200 text-[#8B5E3C] hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- MODAL POPUP (VISUAL PERSIS MAIN PAGE) --- */}
      {selectedBook && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="absolute inset-0" onClick={() => setSelectedBook(null)}></div>
            
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full overflow-hidden flex flex-col md:flex-row animate-scale-up max-h-[90vh]">
                <button onClick={() => setSelectedBook(null)} className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white text-gray-500 hover:text-red-500 transition-colors shadow-sm"><X className="w-6 h-6" /></button>
                
                {/* Bagian Kiri: Gambar (Style Main Page) */}
                <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-6 md:p-8">
                    <img src={selectedBook.image} alt={selectedBook.title} className="max-w-full max-h-[300px] md:max-h-[500px] object-contain rounded-lg shadow-md" />
                </div>
                
                {/* Bagian Kanan: Info (Style Main Page) */}
                <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col text-left overflow-y-auto">
                    <div className="flex flex-wrap gap-2 mb-3">
                        {/* BADGES */}
                        {selectedBook.status === 'READY' ? (
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">READY STOCK</span>
                        ) : selectedBook.status === 'PO' ? (
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">PRE-ORDER</span>
                        ) : (
                            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">KATALOG REFERENSI</span>
                        )}
                        <span className="inline-block px-3 py-1 bg-orange-100 text-[#8B5E3C] text-xs font-bold rounded-full">{selectedBook.type}</span>
                        <span className="inline-block px-3 py-1 bg-[#FF9E9E] text-white text-xs font-bold rounded-full">{selectedBook.age}</span>
                        {/* New Category Badge */}
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">{selectedBook.category}</span>
                    </div>
                    
                    <h3 className="text-2xl md:text-4xl font-bold text-[#8B5E3C] mb-2 leading-tight">{selectedBook.title}</h3>
                    <p className="text-3xl font-bold text-[#FF9E9E] mb-6">Rp {selectedBook.price?.toLocaleString('id-ID')}</p>
                    
                    {/* INFO BOX STATUS (Visual Abu-abu) */}
                    <div className="bg-slate-50 p-4 rounded-xl mb-6 text-sm text-slate-700 border border-slate-100">
                        <div className="flex justify-between mb-1">
                            <span>Status:</span>
                            <span className="font-bold">
                                {selectedBook.status === 'READY' ? 'Tersedia' : 
                                 selectedBook.status === 'PO' ? 'Pre-Order' : 'Belum Masuk Batch PO'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Estimasi Tiba:</span>
                            <span className="font-bold text-[#8B5E3C]">{selectedBook.eta || 'Hubungi Admin'}</span>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6 text-sm text-slate-600">
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-orange-300" /><span>Penulis: {selectedBook.author}</span></div>
                        <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-orange-300" /><span>Penerbit: {selectedBook.publisher}</span></div>
                        <div className="flex items-center gap-2"><Book className="w-4 h-4 text-orange-300" /><span>Spesifikasi: {selectedBook.pages}</span></div>
                        {/* Deskripsi */}
                        <div className="flex items-start gap-2 mt-2 pt-2 border-t border-dashed border-orange-100">
                            <Globe className="w-4 h-4 text-orange-300 mt-1 flex-shrink-0" />
                            <span className="leading-relaxed">{selectedBook.description || selectedBook.desc || "Belum ada deskripsi."}</span>
                        </div>
                    </div>

                    {/* Preview Video */}
                    {selectedBook.previewurl && (
                        <div className="mb-6">
                            <h4 className="font-bold text-[#8B5E3C] mb-2 flex items-center gap-2">
                                <Eye className="w-4 h-4" /> Preview Buku
                            </h4>
                            <div className={`relative w-full rounded-xl overflow-hidden shadow-sm border border-orange-100 ${selectedBook.previewurl.includes('instagram') ? 'h-[550px]' : 'aspect-video'}`}>
                                <iframe className="absolute inset-0 w-full h-full" src={getEmbedUrl(selectedBook.previewurl) as string} title="Review Preview" allowFullScreen></iframe>
                            </div>
                            <a href={selectedBook.previewurl} target="_blank" className="text-xs text-orange-400 hover:text-orange-600 mt-1 inline-block underline">Buka di aplikasi</a>
                        </div>
                    )}

                    <div className="flex gap-3 mt-auto pt-4">
                         {/* TOMBOL WA DINAMIS */}
                         <a href={getWaLink(selectedBook)} target="_blank" className={`flex-1 text-white py-3 rounded-xl font-bold text-center hover:bg-[#6D4C41] transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg ${selectedBook.status === 'REFERENSI' ? 'bg-slate-500 hover:bg-slate-600' : 'bg-[#8B5E3C] hover:bg-[#6D4C41]'}`}>
                            <MessageCircle className="w-5 h-5" /> 
                            {selectedBook.status === 'READY' ? 'Beli Sekarang' : 
                             selectedBook.status === 'PO' ? 'Ikut PO Sekarang' : 
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