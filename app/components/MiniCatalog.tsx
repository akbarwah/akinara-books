'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/supabaseClient'; 
import { 
  ShoppingBag, Star, Truck, Clock, Bookmark, 
  MessageCircle, Eye, User, Building2, Book as BookIcon, Globe, 
  X, ArrowRight, Sparkles, AlertCircle, Flame, Hourglass
} from 'lucide-react';
import { useCart } from '../context/CartContext'; 

// --- DEFINISI TIPE DATA (UPDATE: Tambah is_highlight) ---
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
  is_highlight?: boolean; // <-- INI PENTING UNTUK FITUR ADMIN
};

// --- HELPER UNTUK LOGIKA ---
const getSeriesPrefix = (title: string) => {
    return title.toLowerCase().replace(/[^\w\s]/gi, '').split(' ').slice(0, 2).join(' ');
};

const getWaLink = (book: any) => {
    const phone = "6282314336969"; 
    const text = `Halo Admin Akinara, saya tertarik dengan buku *${book.title}* (${book.type}). Apakah varian ini akan ada di Batch PO berikutnya?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

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

// --- STICKER BADGE COMPONENT ---
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

// --- COMPONENT UTAMA ---
export default function MiniCatalog() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      // FETCHING STRATEGY:
      // 1. Ambil 50 buku (untuk stok data rekomendasi).
      // 2. Order by 'is_highlight' descending -> Supaya buku highlight PASTI keambil di top 50.
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('is_highlight', { ascending: false }) // Prioritas ambil yang di-highlight
        .limit(50); 

      if (error) {
        console.error('Error fetching:', error);
      } else if (data) {
        const typedData = data as unknown as Book[];
        
        // SORTING STRATEGY (Client Side):
        // Level 1: is_highlight (True -> Paling Atas)
        // Level 2: Status Priority (Ready > PO > Backlist)
        // Level 3: ID (Terbaru/Stabil)
        
        const priority: { [key: string]: number } = { 'READY': 1, 'PO': 2, 'BACKLIST': 3 };
        
        const sortedData = typedData.sort((a, b) => {
            // 1. Cek Highlight
            const isHighlightA = a.is_highlight ? 1 : 0;
            const isHighlightB = b.is_highlight ? 1 : 0;
            if (isHighlightA !== isHighlightB) {
                return isHighlightB - isHighlightA; // Yang true (1) duluan
            }

            // 2. Cek Status (Jika sama-sama highlight atau sama-sama tidak)
            const priorityA = priority[a.status] || 99;
            const priorityB = priority[b.status] || 99;
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            // 3. Cek ID
            return a.id - b.id;
        });

        setBooks(sortedData);
      }
      setLoading(false);
    }
    fetchBooks();
  }, []);

  // --- LOGIKA REKOMENDASI ---
  const relatedBooks = useMemo(() => {
    if (!activeBook || books.length === 0) return [];
    
    const currentSeries = getSeriesPrefix(activeBook.title);
    const activeTitleClean = activeBook.title.trim().toLowerCase();

    // 1. Scoring
    const scoredCandidates = books
        .filter(b => b.title.trim().toLowerCase() !== activeTitleClean)
        .map(b => {
            let score = 0;
            if (getSeriesPrefix(b.title) === currentSeries && currentSeries.length > 3) score += 10;
            if (b.author && activeBook.author && b.author === activeBook.author) score += 5;
            if (b.category === activeBook.category) score += 1;
            return { ...b, score };
        })
        .filter(b => b.score > 0)
        .sort((a, b) => b.score - a.score);

    // 2. Deduplikasi
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

  // Handle click rekomendasi
  const handleRelatedClick = (relatedBook: Book) => {
      setActiveBook(relatedBook);
      const modalContent = document.querySelector('.modal-content-scroll');
      if (modalContent) modalContent.scrollTop = 0;
  };

  // TAMPILKAN 4 BUKU TERATAS (Highlight -> Ready -> dll)
  const displayedBooks = books.slice(0, 4);

  return (
    <section className="py-20 bg-linear-to-b from-white to-[#FFF9F0]" id="katalog">
      <div className="max-w-7xl mx-auto px-4 text-center">
        
        <div className="flex flex-col items-center gap-3 mb-12">
            <span className="inline-block px-4 py-1.5 bg-[#FF9E9E] text-white rounded-full text-sm font-bold tracking-wide shadow-sm mb-2">KOLEKSI TERBAIK</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#8B5E3C] mb-2">Buku Pilihan Untuk Si Kecil</h2>
            <p className="text-[#6D4C41] text-sm md:text-base font-medium max-w-4xl mx-auto">Jelajahi koleksi buku anak terbaik kami yang penuh warna dan cerita menarik</p>
        </div>

        {loading ? (
            <div className="text-center py-20">
                <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-[#8B5E3C] rounded-full animate-spin mb-2"></div>
                <p className="text-[#8B5E3C]">Memuat rekomendasi...</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {displayedBooks.map((book) => (
                    <div 
                        key={book.id} 
                        onClick={() => setActiveBook(book)}
                        className="group relative bg-white p-3 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer h-full flex flex-col border border-transparent hover:border-orange-100"
                    >
                        {book.sticker_text && <StickerBadge type={book.sticker_text} />}
                        
                        <div className="relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-4">
                            <img src={book.image} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            
                            <div className="absolute top-2 right-2">
                                {book.status === 'READY' ? (
                                    <span className="bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md flex items-center gap-1"><Truck className="w-3 h-3" /> READY</span>
                                ) : book.status === 'PO' ? (
                                    <span className="bg-blue-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md flex items-center gap-1"><Clock className="w-3 h-3" /> PO</span>
                                ) : (
                                    <span className="bg-slate-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md flex items-center gap-1"><Bookmark className="w-3 h-3" /> BACKLIST</span>
                                )}
                            </div>
                        </div>
                        <h3 className="font-bold text-[#8B5E3C] line-clamp-1 group-hover:text-[#FF9E9E] transition-colors text-left">{book.title}</h3>
                        <p className="text-[#FF9E9E] font-bold text-lg text-left">Rp {book.price.toLocaleString('id-ID')}</p>
                    </div>
                ))}
            </div>
        )}

        <div className="mt-12">
            <a href="/katalog" className="inline-flex items-center gap-2 bg-[#8B5E3C] text-white px-8 py-3 rounded-full font-bold hover:bg-[#6D4C41] transition-all shadow-lg hover:shadow-orange-200 hover:scale-105">
                Lihat Koleksi Lengkap <ArrowRight className="w-4 h-4" />
            </a>
        </div>

        {/* --- MODAL POPUP --- */}
        {activeBook && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in text-left">
                <div className="absolute inset-0" onClick={() => setActiveBook(null)}></div>
                <div className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full overflow-hidden flex flex-col md:flex-row animate-scale-up max-h-[90vh]">
                    <button onClick={() => setActiveBook(null)} className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white text-gray-500 hover:text-red-500 transition-colors shadow-sm"><X className="w-6 h-6" /></button>
                    
                    <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-6 md:p-8">
                        <img src={activeBook.image} alt={activeBook.title} className="max-w-full max-h-[300px] md:max-h-[500px] object-contain rounded-lg shadow-md" />
                    </div>

                    <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto modal-content-scroll">
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                            {activeBook.status === 'READY' ? <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">READY STOCK</span> : activeBook.status === 'PO' ? <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">PRE-ORDER</span> : <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">BACKLIST</span>}
                            <span className="inline-block px-3 py-1 bg-orange-100 text-[#8B5E3C] text-xs font-bold rounded-full">{activeBook.type}</span>
                            <span className="inline-block px-3 py-1 bg-[#FF9E9E] text-white text-xs font-bold rounded-full">{activeBook.age}</span>
                        </div>

                        <h3 className="text-2xl md:text-4xl font-bold text-[#8B5E3C] mb-2 leading-tight">{activeBook.title}</h3>
                        <p className="text-3xl font-bold text-[#FF9E9E] mb-6">Rp {activeBook.price?.toLocaleString('id-ID')}</p>

                        <div className="bg-slate-50 p-4 rounded-xl mb-6 text-sm text-slate-700 border border-slate-100">
                            <div className="flex justify-between mb-1"><span>Status:</span><span className="font-bold">{activeBook.status === 'READY' ? 'Tersedia' : activeBook.status === 'PO' ? 'Pre-Order' : 'Belum Masuk Batch PO'}</span></div>
                            <div className="flex justify-between"><span>Estimasi Tiba:</span><span className="font-bold text-[#8B5E3C]">{activeBook.eta || 'Hubungi Admin'}</span></div>
                        </div>

                        <div className="space-y-3 mb-6 text-sm text-slate-600 border-t border-dashed border-gray-200 pt-4">
                            <div className="flex items-center gap-2"><User className="w-4 h-4 text-orange-300" /><span>Penulis: {activeBook.author}</span></div>
                            <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-orange-300" /><span>Penerbit: {activeBook.publisher}</span></div>
                            <div className="flex items-center gap-2"><BookIcon className="w-4 h-4 text-orange-300" /><span>Spesifikasi: {activeBook.pages}</span></div>
                            <div className="flex items-start gap-2 mt-2"><Globe className="w-4 h-4 text-orange-300 mt-1 flex-shrink-0" /><span className="leading-relaxed">{activeBook.description || activeBook.desc || "Deskripsi belum tersedia."}</span></div>
                        </div>

                        {activeBook.previewurl && isEmbeddable(activeBook.previewurl) && (
                            <div className="mb-6">
                                <h4 className="font-bold text-[#8B5E3C] mb-2 flex items-center gap-2"><Eye className="w-4 h-4" /> Preview Buku</h4>
                                <div className={`relative w-full rounded-xl overflow-hidden shadow-sm border border-orange-100 ${activeBook.previewurl.includes('instagram') ? 'h-[550px]' : 'aspect-video'}`}>
                                    <iframe className="absolute inset-0 w-full h-full" src={getEmbedUrl(activeBook.previewurl) as string} title="Review Preview" allowFullScreen></iframe>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 mb-8 border-b border-gray-100 pb-8 mt-auto">
                            {activeBook.status === 'BACKLIST' || activeBook.status === 'REFERENSI' || activeBook.status === 'ARCHIVE' ? (
                                <a href={getWaLink(activeBook)} target="_blank" className="flex-1 text-white py-3 rounded-xl font-bold text-center hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg bg-slate-500">
                                    <MessageCircle className="w-5 h-5" /> Tanya Stok
                                </a>
                            ) : (
                                <button onClick={() => { addToCart(activeBook); setActiveBook(null); }} className="flex-1 text-white py-3 rounded-xl font-bold text-center hover:bg-[#6D4C41] transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg bg-[#8B5E3C]">
                                    <ShoppingBag className="w-5 h-5" /> Tambah ke Keranjang
                                </button>
                            )}
                        </div>

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

      </div>
    </section>
  );
}