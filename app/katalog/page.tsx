'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { supabase } from '../../supabaseClient'; 
import { 
  X, Search, Filter, Truck, Clock, Bookmark, 
  MessageCircle, Eye, User, Building2, Book as BookIcon, Globe, 
  ChevronDown, ArrowLeft, ShoppingBag, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Layers, ArrowRight, 
  Star, Flame, Zap, Hourglass, ShoppingCart, Minus, Plus, Trash2, AlertCircle, Sparkles // Added Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../context/CartContext'; 
import { useRouter, useSearchParams } from 'next/navigation';

// --- UTILITY COMPONENT ---
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

// --- HELPER FUNCTIONS ---
const isEmbeddable = (url: string) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('instagram.com');
};

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
    const text = `Halo Admin Akinara, saya tertarik dengan buku *${book.title}* (${book.type}). Apakah varian ini akan ada di Batch PO berikutnya?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

// --- KOMPONEN: CART DRAWER ---
const CartDrawer = () => {
    const { 
        isCartOpen, setIsCartOpen, cartItems, 
        removeFromCart, decreaseQuantity, addToCart, 
        getCartTotal, checkoutToWhatsApp, hasMixedItems 
    } = useCart();

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
                onClick={() => setIsCartOpen(false)}
            ></div>
            <div className="relative w-full max-w-md bg-[#FFF9F0] h-full shadow-2xl flex flex-col animate-slide-in-right">
                <div className="p-6 border-b border-orange-100 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-bold text-[#8B5E3C] flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-[#FF9E9E]" /> Keranjang Belanja
                    </h2>
                    <button 
                        onClick={() => setIsCartOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {hasMixedItems && (
                    <div className="bg-yellow-50 border-b border-yellow-200 p-4 flex gap-3 items-start animate-fade-in">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-yellow-800">Order Campuran Terdeteksi</p>
                            <p className="text-xs text-yellow-700 mt-1 leading-relaxed">
                                Kamu menggabungkan buku <b>Ready</b> & <b>PO</b>. Pengiriman mungkin terpisah (ongkir dobel) atau menunggu PO tiba. Admin akan konfirmasi via WA.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                            <ShoppingCart className="w-16 h-16 text-orange-200" />
                            <p className="text-[#8B5E3C] font-medium">Keranjangmu masih kosong.</p>
                            <button onClick={() => setIsCartOpen(false)} className="text-sm underline text-[#FF9E9E]">Cari buku dulu yuk!</button>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item.id} className="flex gap-4 bg-white p-3 rounded-2xl shadow-sm border border-orange-50 relative group">
                                <div className={`absolute top-0 right-0 rounded-bl-xl rounded-tr-xl px-2 py-0.5 text-[8px] font-bold text-white ${item.status === 'READY' ? 'bg-green-500' : 'bg-blue-500'}`}>{item.status}</div>
                                <div className="w-20 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between pt-2">
                                    <div>
                                        <h4 className="font-bold text-[#8B5E3C] line-clamp-1 text-sm">{item.title}</h4>
                                        <p className="text-xs text-orange-400 font-bold mt-1">Rp {item.price.toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1">
                                            <button onClick={() => decreaseQuantity(item.id)} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-[#8B5E3C] hover:text-red-500 disabled:opacity-50"><Minus className="w-3 h-3" /></button>
                                            <span className="text-sm font-bold text-[#8B5E3C] w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center bg-[#8B5E3C] text-white rounded-md shadow-sm hover:bg-[#6D4C41]"><Plus className="w-3 h-3" /></button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {cartItems.length > 0 && (
                    <div className="p-6 bg-white border-t border-orange-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-500 font-medium">Total Estimasi</span>
                            <span className="text-xl font-black text-[#8B5E3C]">Rp {getCartTotal().toLocaleString('id-ID')}</span>
                        </div>
                        <button onClick={checkoutToWhatsApp} className="w-full py-4 bg-[#25D366] hover:bg-[#1ebd5a] text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"><MessageCircle className="w-5 h-5" /> Checkout via WhatsApp</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- STICKER BADGE ---
const StickerBadge = ({ type }: { type: string }) => {
    if (!type) return null;
    switch (type) {
        case 'BEST SELLER': return (<div className="absolute -top-4 -right-4 z-30 flex flex-col items-center group-hover:scale-110 transition-transform duration-300 origin-top"><div className="relative flex flex-col items-center animate-bounce-slow"><div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 shadow-xl border-2 border-white flex flex-col items-center justify-center text-center z-10"><span className="text-[8px] font-black text-yellow-900 leading-none">BEST</span><span className="text-[8px] font-black text-white leading-none mt-0.5 drop-shadow-md">SELLER</span><Star className="w-3 h-3 text-white fill-white mt-0.5 absolute -top-1 right-0 animate-pulse" /></div><div className="absolute -bottom-3 z-0 flex gap-1"><div className="w-3 h-5 bg-yellow-600 transform skew-y-[20deg] rounded-b-sm"></div><div className="w-3 h-5 bg-yellow-600 transform -skew-y-[20deg] rounded-b-sm"></div></div></div></div>);
        case 'SALE': return (<div className="absolute -top-3 -right-2 z-30 group-hover:rotate-6 transition-transform duration-300 origin-bottom-left"><div className="relative shadow-lg"><div className="bg-red-600 text-white pl-5 pr-3 py-1 rounded-md flex items-center justify-center border-2 border-white/50 relative"><div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-sm"></div><span className="font-black text-[10px] tracking-widest">SALE</span></div></div></div>);
        case 'NEW': return (<div className="absolute -top-5 -right-5 z-30 group-hover:rotate-180 transition-transform duration-700"><div className="relative w-16 h-16 flex items-center justify-center"><svg viewBox="0 0 100 100" className="w-full h-full text-green-400 drop-shadow-lg animate-pulse-slow"><path fill="currentColor" d="M50 0L61 35L98 35L68 57L79 91L50 70L21 91L32 57L2 35L39 35Z" /></svg><span className="absolute text-green-900 font-black text-[10px] transform -rotate-12">NEW!</span></div></div>);
        case 'HOT': return (<div className="absolute -top-3 -right-3 z-30 group-hover:scale-110 transition-transform duration-300"><div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 border-2 border-white shadow-lg flex flex-col items-center justify-center animate-wiggle"><Flame className="w-4 h-4 text-yellow-200 fill-yellow-200" /><span className="text-white font-black text-[9px] italic pr-1">HOT</span></div></div>);
        case 'COMING SOON': return (<div className="absolute -top-3 -right-3 z-30 group-hover:-translate-y-1 transition-transform duration-300"><div className="bg-blue-600 text-white px-3 py-1.5 rounded-full border-2 border-white shadow-lg flex items-center gap-1.5 animate-float"><Hourglass className="w-3 h-3 text-blue-200" /><div className="flex flex-col items-start leading-none"><span className="text-[7px] font-bold text-blue-200 uppercase">Coming</span><span className="text-[8px] font-black uppercase">Soon</span></div></div></div>);
        default: return null;
    }
};

// --- TIPE DATA ---
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
  sticker_text?: string;
};

type BookGroup = {
    title: string;
    books: Book[]; 
}

// --- KOMPONEN ISI KATALOG ---
function KatalogContent() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedGroup, setSelectedGroup] = useState<BookGroup | null>(null);
  const [activeVariant, setActiveVariant] = useState<Book | null>(null);

  const [filterSearch, setFilterSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua'); 
  const [filterCategory, setFilterCategory] = useState('Semua'); 
  const [filterAge, setFilterAge] = useState('Semua');       
  const [filterType, setFilterType] = useState('Semua');
  const [filterPublisher, setFilterPublisher] = useState('Semua');

  const router = useRouter();
  const searchParams = useSearchParams();
  const itemsPerPage = 12; 
  const topRef = useRef<HTMLDivElement>(null);

  const currentPage = Number(searchParams.get('page')) || 1;
  const { addToCart, getCartCount, setIsCartOpen } = useCart();

  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      const { data, error } = await supabase
        .from('books')
        .select('*');

      if (error) {
        console.error('Error fetching:', error);
      } else if (data) {
        const priority: { [key: string]: number } = {
            'READY': 1, 'PO': 2, 'BACKLIST': 3, 'ARCHIVE': 4, 'REFERENSI': 5
        };
        const sortedData = data.sort((a, b) => {
            const priorityA = priority[a.status] || 99;
            const priorityB = priority[b.status] || 99;
            if (priorityA !== priorityB) return priorityA - priorityB;
            return a.id - b.id;
        });
        setBooks(sortedData);
      }
      setLoading(false);
    }
    fetchBooks();
  }, []);

  useEffect(() => {
    if (currentPage !== 1) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', '1');
        router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [filterSearch, filterStatus, filterCategory, filterAge, filterType, filterPublisher]); 

  useEffect(() => {
    if (selectedGroup && selectedGroup.books.length > 0) {
        const readyVariant = selectedGroup.books.find(b => b.status === 'READY');
        setActiveVariant(readyVariant || selectedGroup.books[0]);
    }
  }, [selectedGroup]);

  // --- LOGIKA REKOMENDASI (SCORING + DEDUPLIKASI JUDUL) ---
  const relatedBooks = useMemo(() => {
    if (!activeVariant || books.length === 0) return [];
    
    // Helper: Ambil 2 kata pertama dari judul (untuk deteksi seri)
    const getSeriesPrefix = (title: string) => {
        return title.toLowerCase().replace(/[^\w\s]/gi, '').split(' ').slice(0, 2).join(' ');
    };

    const currentSeries = getSeriesPrefix(activeVariant.title);
    const activeTitleClean = activeVariant.title.trim().toLowerCase();

    // 1. Hitung SKOR dulu untuk semua kandidat
    const scoredCandidates = books
        .filter(b => b.title.trim().toLowerCase() !== activeTitleClean) // Pastikan bukan buku yang sedang dibuka
        .map(b => {
            let score = 0;

            // A. MATCH JUDUL/SERI (Bobot: 10 Poin)
            if (getSeriesPrefix(b.title) === currentSeries && currentSeries.length > 3) {
                score += 10;
            }

            // B. MATCH PENULIS (Bobot: 5 Poin)
            if (b.author && activeVariant.author && b.author === activeVariant.author) {
                score += 5;
            }

            // C. MATCH KATEGORI (Bobot: 1 Poin)
            if (b.category === activeVariant.category) {
                score += 1;
            }

            return { ...b, score };
        })
        .filter(b => b.score > 0) // Hanya ambil yang punya kemiripan
        .sort((a, b) => b.score - a.score); // Urutkan dari skor tertinggi

    // 2. DEDUPLIKASI (Hanya ambil 1 varian per Judul)
    const uniqueResults: Book[] = [];
    const seenTitles = new Set<string>();

    for (const book of scoredCandidates) {
        const cleanTitle = book.title.trim().toLowerCase();

        // Jika judul ini BELUM pernah masuk ke list rekomendasi
        if (!seenTitles.has(cleanTitle)) {
            uniqueResults.push(book);
            seenTitles.add(cleanTitle); // Tandai judul ini sudah diambil
        }

        // Stop jika sudah dapat 3 rekomendasi unik
        if (uniqueResults.length >= 3) break;
    }

    return uniqueResults;
  }, [activeVariant, books]);

  const handleRelatedClick = (relatedBook: Book) => {
    const cleanTitle = relatedBook.title.trim();
    const rawGroup = books.filter(b => b.title.trim() === cleanTitle);
    
    if (rawGroup.length > 0) {
        const newGroup = { title: cleanTitle, books: rawGroup };
        setSelectedGroup(newGroup);
        const modalContent = document.querySelector('.modal-content-scroll');
        if (modalContent) modalContent.scrollTop = 0;
    }
  };


  const uniquePublishers = useMemo(() => ['Semua', ...Array.from(new Set(books.map(b => b.publisher).filter(Boolean))).sort()], [books]);
  const uniqueAges = useMemo(() => ['Semua', ...Array.from(new Set(books.map(b => b.age).filter(Boolean))).sort()], [books]);
  const uniqueTypes = useMemo(() => ['Semua', ...Array.from(new Set(books.map(b => b.type).filter(Boolean))).sort()], [books]);

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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGroups = processedBooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(processedBooks.length / itemsPerPage);

  const maxPageButtons = 10;
  const startPage = Math.floor((currentPage - 1) / maxPageButtons) * maxPageButtons + 1;
  const endPage = Math.min(startPage + maxPageButtons - 1, totalPages);
  
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    router.push(`?${params.toString()}`); 
    
    if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <Reveal><div className="text-center mb-10"><h1 className="text-3xl md:text-5xl font-extrabold text-[#8B5E3C] mb-4">Koleksi Buku Pilihan</h1><p className="text-[#6D4C41] text-base md:text-lg max-w-2xl mx-auto">Temukan buku yang tepat berdasarkan usia, status ketersediaan, atau kategori.</p></div></Reveal>
        <div ref={topRef} className="scroll-mt-24"></div> 
        <Reveal delay={100}>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 mb-10">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-[#8B5E3C] font-bold text-lg w-full md:w-auto"><Filter className="w-5 h-5" /> Filter Pencarian</div>
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Cari judul atau penulis..." value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-[#FF9E9E]/50 bg-[#FFF9F0]" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[{ label: "Status", val: filterStatus, set: setFilterStatus, opts: ["READY", "PO", "BACKLIST"], default: "Semua Status" },{ label: "Jenis Buku", val: filterCategory, set: setFilterCategory, opts: ["Impor", "Lokal"], default: "Semua Jenis" },{ label: "Umur", val: filterAge, set: setFilterAge, opts: uniqueAges.filter(x => x !== 'Semua'), default: "Semua Umur" },{ label: "Penerbit", val: filterPublisher, set: setFilterPublisher, opts: uniquePublishers.filter(x => x !== 'Semua'), default: "Semua Penerbit" },{ label: "Format", val: filterType, set: setFilterType, opts: uniqueTypes.filter(x => x !== 'Semua'), default: "Semua Format" }].map((f, i) => (
                <div key={i} className="relative">
                    <label className="text-xs font-bold text-orange-400 ml-1 mb-1 block">{f.label}</label>
                    <div className="relative">
                    <select value={f.val} onChange={(e) => f.set(e.target.value)} className="w-full appearance-none px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[#8B5E3C] font-medium focus:outline-none focus:border-[#FF9E9E] truncate pr-8">
                        <option value="Semua">{f.default}</option>
                        {f.opts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between items-center border-t border-gray-100 pt-3">
              <button onClick={() => { setFilterType('Semua'); setFilterStatus('Semua'); setFilterCategory('Semua'); setFilterAge('Semua'); setFilterPublisher('Semua'); setFilterSearch(''); }} className="text-xs text-[#FF9E9E] font-bold hover:underline">Reset Semua Filter</button>
              <span className="text-xs text-orange-400 font-medium">Total: <b>{processedBooks.length}</b> Judul</span>
            </div>
          </div>
        </Reveal>

        {loading ? (
          <div className="text-center py-20"><div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-[#8B5E3C] rounded-full animate-spin mb-2"></div><p className="text-[#8B5E3C]">Sedang mengambil buku...</p></div>
        ) : processedBooks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-orange-200"><p className="text-lg text-gray-400">Tidak ada buku yang cocok dengan filter ini.</p></div>
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
                    <div onClick={() => setSelectedGroup(group)} className="group relative bg-white p-3 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border border-transparent hover:border-orange-100 h-full flex flex-col">
                        {displayBook.sticker_text && <StickerBadge type={displayBook.sticker_text} />}
                        <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4 relative bg-gray-100">
                            <img src={displayBook.image} alt={displayBook.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy"/>
                            <div className="absolute top-2 right-2 z-10">
                                {displayBook.status === 'READY' ? (
                                    <span className="bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md flex items-center gap-1"><Truck className="w-3 h-3" /> READY</span>
                                ) : displayBook.status === 'PO' ? (
                                    <span className="bg-blue-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md flex items-center gap-1"><Clock className="w-3 h-3" /> PO</span>
                                ) : (
                                    <span className="bg-slate-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md flex items-center gap-1"><Bookmark className="w-3 h-3" /> BACKLIST</span>
                                )}
                            </div>
                            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                                <span className="bg-white/90 text-[10px] px-2 py-0.5 rounded-full font-bold text-[#8B5E3C] shadow-sm">{displayBook.type}</span>
                                <span className="bg-[#FF9E9E]/90 text-[10px] px-2 py-0.5 rounded-full font-bold text-white shadow-sm">{displayBook.age}</span>
                            </div>
                            {hasVariants && <div className="absolute bottom-2 right-2 z-10"><span className="bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md flex items-center gap-1"><Layers className="w-3 h-3" /> {group.books.length} Opsi</span></div>}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="bg-white/90 text-[#8B5E3C] px-3 py-1 rounded-full text-xs font-bold transform scale-90 group-hover:scale-100 transition-transform">Lihat Detail</span></div>
                        </div>
                        <h3 className="font-bold text-[#8B5E3C] mb-1 line-clamp-2 leading-tight text-left flex-grow">{displayBook.title}</h3>
                        <div className="mt-2">
                            <p className="text-[#FF9E9E] font-bold text-lg">{hasVariants && <span className="text-sm text-gray-400 font-normal mr-1">Mulai</span>}Rp {minPrice.toLocaleString('id-ID')}</p>
                            <p className="text-xs text-gray-400 mb-1">{displayBook.category}</p>
                        </div>
                    </div>
                    </Reveal>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
                <button onClick={() => paginate(1)} disabled={currentPage === 1} className="p-2 rounded-full border border-orange-200 text-[#8B5E3C] hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronsLeft className="w-5 h-5" /></button>
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-full border border-orange-200 text-[#8B5E3C] hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft className="w-5 h-5" /></button>
                <div className="flex gap-2">
                  {pageNumbers.map((number) => (
                    <button key={number} onClick={() => paginate(number)} className={`w-10 h-10 rounded-full font-bold text-sm transition-all flex-shrink-0 ${currentPage === number ? 'bg-[#8B5E3C] text-white shadow-lg scale-110' : 'bg-white text-[#8B5E3C] border border-orange-100 hover:bg-orange-50'}`}>{number}</button>
                  ))}
                </div>
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-full border border-orange-200 text-[#8B5E3C] hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight className="w-5 h-5" /></button>
                <button onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-full border border-orange-200 text-[#8B5E3C] hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronsRight className="w-5 h-5" /></button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedGroup && activeVariant && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="absolute inset-0" onClick={() => setSelectedGroup(null)}></div>
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full overflow-hidden flex flex-col md:flex-row animate-scale-up max-h-[90vh]">
                <button onClick={() => setSelectedGroup(null)} className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white text-gray-500 hover:text-red-500 transition-colors shadow-sm"><X className="w-6 h-6" /></button>
                <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-6 md:p-8"><img src={activeVariant.image} alt={activeVariant.title} className="max-w-full max-h-[300px] md:max-h-[500px] object-contain rounded-lg shadow-md" /></div>
                
                <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col text-left overflow-y-auto modal-content-scroll">
                    
                    {selectedGroup.books.length > 1 && (
                        <div className="mb-6">
                            <span className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Pilih Format Buku:</span>
                            <div className="flex flex-wrap gap-2">
                                {selectedGroup.books.map((bookVar) => (
                                    <button key={bookVar.id} onClick={() => setActiveVariant(bookVar)} className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all flex flex-col items-start ${activeVariant.id === bookVar.id ? 'bg-[#FFF9F0] border-[#8B5E3C] text-[#8B5E3C] ring-2 ring-orange-200' : 'bg-white border-gray-200 text-gray-500 hover:border-orange-300'}`}><span>{bookVar.type}</span><span className="text-xs font-normal">Rp {bookVar.price.toLocaleString('id-ID')}</span></button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {activeVariant.status === 'READY' ? <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">READY STOCK</span> : activeVariant.status === 'PO' ? <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">PRE-ORDER</span> : <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">BACKLIST</span>}
                        <span className="inline-block px-3 py-1 bg-orange-100 text-[#8B5E3C] text-xs font-bold rounded-full">{activeVariant.type}</span>
                        <span className="inline-block px-3 py-1 bg-[#FF9E9E] text-white text-xs font-bold rounded-full">{activeVariant.age}</span>
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">{activeVariant.category}</span>
                        {selectedGroup.books.length === 1 && <span className="inline-block px-3 py-1 bg-orange-100 text-[#8B5E3C] text-xs font-bold rounded-full">{activeVariant.type}</span>}
                    </div>
                    <h3 className="text-2xl md:text-4xl font-bold text-[#8B5E3C] mb-2 leading-tight">{activeVariant.title}</h3>
                    <p className="text-3xl font-bold text-[#FF9E9E] mb-6">Rp {activeVariant.price?.toLocaleString('id-ID')}</p>
                    <div className="bg-slate-50 p-4 rounded-xl mb-6 text-sm text-slate-700 border border-slate-100">
                        <div className="flex justify-between mb-1"><span>Status:</span><span className="font-bold">{activeVariant.status === 'READY' ? 'Tersedia' : activeVariant.status === 'PO' ? 'Pre-Order' : 'Belum Masuk Batch PO'}</span></div>
                        <div className="flex justify-between"><span>Estimasi Tiba:</span><span className="font-bold text-[#8B5E3C]">{activeVariant.eta || 'Hubungi Admin'}</span></div>
                    </div>
                    <div className="space-y-3 mb-6 text-sm text-slate-600">
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-orange-300" /><span>Penulis: {activeVariant.author}</span></div>
                        <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-orange-300" /><span>Penerbit: {activeVariant.publisher}</span></div>
                        <div className="flex items-center gap-2"><BookIcon className="w-4 h-4 text-orange-300" /><span>Spesifikasi: {activeVariant.pages}</span></div>
                        <div className="flex items-start gap-2 mt-2 pt-2 border-t border-dashed border-orange-100"><Globe className="w-4 h-4 text-orange-300 mt-1 flex-shrink-0" /><span className="leading-relaxed">{activeVariant.description || activeVariant.desc || "Belum ada deskripsi."}</span></div>
                    </div>
                    {activeVariant.previewurl && (
                        <div className="mb-6">
                            <h4 className="font-bold text-[#8B5E3C] mb-2 flex items-center gap-2"><Eye className="w-4 h-4" /> Preview Buku</h4>
                            {isEmbeddable(activeVariant.previewurl) ? (
                                <><div className={`relative w-full rounded-xl overflow-hidden shadow-sm border border-orange-100 ${activeVariant.previewurl.includes('instagram') ? 'h-[550px]' : 'aspect-video'}`}><iframe className="absolute inset-0 w-full h-full" src={getEmbedUrl(activeVariant.previewurl) as string} title="Review Preview" allowFullScreen></iframe></div><a href={activeVariant.previewurl} target="_blank" className="text-xs text-orange-400 hover:text-orange-600 mt-1 inline-block underline">Buka di aplikasi</a></>
                            ) : (
                                <a href={activeVariant.previewurl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-all group"><div className="flex items-center gap-3"><div className="bg-white p-2 rounded-lg shadow-sm"><BookIcon className="w-6 h-6 text-[#8B5E3C]" /></div><div><p className="font-bold text-[#8B5E3C] text-sm">Lihat Isi Buku (Look Inside)</p><p className="text-xs text-orange-400">Preview tersedia di website eksternal</p></div></div><ArrowRight className="w-5 h-5 text-[#8B5E3C] transform group-hover:translate-x-1 transition-transform" /></a>
                            )}
                        </div>
                    )}
                    <div className="flex gap-3 pt-4 mb-8 border-b border-gray-100 pb-8">
                         {activeVariant.status === 'BACKLIST' || activeVariant.status === 'REFERENSI' || activeVariant.status === 'ARCHIVE' ? (
                            <a href={getWaLink(activeVariant)} target="_blank" className="flex-1 text-white py-3 rounded-xl font-bold text-center hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg bg-slate-500">
                                <MessageCircle className="w-5 h-5" /> Tanya Jadwal PO
                            </a>
                         ) : (
                            <button onClick={() => { addToCart(activeVariant); setSelectedGroup(null); }} className="flex-1 text-white py-3 rounded-xl font-bold text-center hover:bg-[#6D4C41] transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg bg-[#8B5E3C]">
                                <ShoppingBag className="w-5 h-5" /> Tambah ke Keranjang
                            </button>
                         )}
                    </div>

                    {/* --- BAGIAN REKOMENDASI PRODUK (DEDUPLIKASI JUDUL) --- */}
                    {relatedBooks.length > 0 && (
                        <div className="animate-fade-in">
                            <h4 className="font-bold text-[#8B5E3C] mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-yellow-500" /> Mungkin Kamu Suka Juga...
                            </h4>
                            <div className="grid grid-cols-3 gap-3">
                                {relatedBooks.map((relBook) => (
                                    <div 
                                        key={relBook.id} 
                                        onClick={() => handleRelatedClick(relBook)}
                                        className="cursor-pointer group/card"
                                    >
                                        <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-2 border border-transparent group-hover/card:border-orange-200 transition-all relative">
                                            <img src={relBook.image} alt={relBook.title} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500" />
                                            {relBook.status === 'READY' && <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></div>}
                                        </div>
                                        <h5 className="text-xs font-bold text-[#6D4C41] line-clamp-2 leading-tight group-hover/card:text-orange-500 transition-colors">
                                            {relBook.title}
                                        </h5>
                                        <p className="text-[10px] text-gray-500 mt-0.5">Rp {relBook.price.toLocaleString('id-ID')}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
      )}
      <CartDrawer />
    </>
  );
}

// --- MAIN PAGE WRAPPER ---
export default function KatalogPage() {
  return (
    <div className="min-h-screen bg-[#FFF9F0] font-sans text-[#6D4C41]">
        <nav className="sticky top-0 z-40 bg-[#FFF9F0]/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 text-[#8B5E3C] hover:text-[#FF9E9E] transition-colors font-bold"><ArrowLeft className="w-5 h-5" /> Kembali</Link>
                <div className="text-xl font-bold text-[#8B5E3C]">Akinara<span className="text-[#FF9E9E]">Catalog</span></div>
                <div className="flex items-center gap-4">
                    <div className="relative p-2 text-[#8B5E3C]">
                         <ShoppingCart className="w-6 h-6" />
                    </div>
                    <a href="https://shopee.co.id/akinarabooks" target="_blank" className="bg-[#FF9E9E] text-white p-2 rounded-full hover:bg-[#ff8585] transition-colors"><ShoppingBag className="w-5 h-5" /></a>
                </div>
            </div>
        </nav>
        
        <Suspense fallback={<div className="text-center py-20 text-[#8B5E3C]">Memuat Katalog...</div>}>
            <KatalogContent />
        </Suspense>
    </div>
  );
}