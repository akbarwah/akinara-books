'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Filter, Search, ArrowLeft, X, User, Book, Globe, Building2, MessageCircle, Eye, Truck, Clock } from 'lucide-react';
import Link from 'next/link';

// --- UTILITY COMPONENT ---
const Reveal = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setIsVisible(true); if (ref.current) observer.unobserve(ref.current); } }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);
  return <div ref={ref} className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

// --- HELPER: SMART EMBED URL ---
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

// --- DATA BUKU LENGKAP (DENGAN STATUS PO/READY) ---
const allBooks = [
  // 4 BUKU DARI LANDING PAGE (SINKRONKAN DATA)
  { 
    id: 1, 
    title: "Ushborne: Pull-back Busy Train Book", 
    price: 125000, 
    type: "Board Book", 
    age: "0-2 Thn",
    status: "PO", // Pre-Order
    eta: "Akhir Feb 2026",
    lang: "Inggris",
    publisher: "Usborne Publishing", 
    author: "Fiona Watt",
    pages: "10 Halaman",
    desc: "Buku interaktif yang sangat seru! Dilengkapi dengan mainan kereta api yang bisa ditarik mundur (pull-back).",
    image: "https://usborne.com/media/catalog/product/cache/577949ba73ecbe39f04bc3cd25e7620e/9/7/9781409550341_cover_image.jpg",
    previewurl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
  },
  { 
    id: 2, 
    title: "Dear Zoo", 
    price: 65000, 
    type: "Lift-the-Flap",
    age: "0-2 Thn",
    status: "READY", // Ready Stock
    eta: "Siap Kirim",
    lang: "Inggris",
    publisher: "Macmillan Children's",
    author: "Rod Campbell",
    pages: "18 Halaman",
    desc: "Buku klasik kesayangan jutaan anak di dunia. Bercerita tentang anak yang meminta hewan peliharaan.",
    image: "https://m.media-amazon.com/images/I/71PcexlBwQL._SL1440_.jpg",
    previewurl: "https://www.instagram.com/reel/DCEwwKPiY-H/" 
  },
  { 
    id: 3, 
    title: "The Pout-Pout Fish", 
    price: 95000, 
    type: "Hardcover",
    age: "3-5 Thn",
    status: "PO",
    eta: "Maret 2026",
    lang: "Inggris",
    publisher: "Farrar Straus Giroux",
    author: "Deborah Diesen",
    pages: "32 Halaman",
    desc: "Kisah ikan yang selalu cemberut dan menyebarkan kesedihan. Sampai akhirnya ia menemukan senyum.",
    image: "https://mpd-biblio-covers.imgix.net/9780374360979.jpg",
    previewurl: "https://www.instagram.com/p/DR3WbEPjJBs/" 
  }, 
  { 
    id: 4, 
    title: "Quantum Entanglement for Babies",
    price: 96000,
    type: "Board Book",
    age: "0-2 Thn",
    status: "READY",
    eta: "Siap Kirim",
    lang: "Inggris",
    publisher: "Sourcebooks Jabberwocky",
    author: "Chris Ferrie",
    pages: "24 Halaman",
    desc: "Buku sains untuk bayi yang menjelaskan konsep keterikatan kuantum dengan cara yang sederhana.",
    image: "https://m.media-amazon.com/images/I/81JJlf4IfxL._AC_UF1000,1000_QL80_.jpg",
    previewurl: ""
  },
  // BUKU TAMBAHAN KATALOG (Setel Statusnya juga)
  { 
    id: 5, 
    title: "Siapa yang Kentut?",
    price: 45000, 
    type: "Picture Book",
    age: "3-5 Thn", 
    status: "READY",
    eta: "Siap Kirim",
    lang: "Indonesia", 
    publisher: "Minima Pustaka",
    author: "Noor H. Dee",
    pages: "10 Halaman",
    desc: "Buku lucu tentang berbagai hewan dan suara kentut mereka yang menggelitik.",
    image: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1720623066i/216330686.jpg",
    previewurl: ""
  },
  { 
    id: 6, 
    title: "The Encyclopedia of Dinosaurs", 
    price: 250000, 
    type: "Hardcover", 
    age: "6+ Thn", 
    status: "PO",
    eta: "Maret 2026",
    lang: "Inggris", 
    publisher: "Hermes House",
    author: "Dougal Dixon",
    pages: "256 Halaman",
    desc: "Ensiklopedia lengkap tentang dinosaurus dengan ilustrasi memukau.",
    image: "https://m.media-amazon.com/images/I/81yq0v2r3sL._SL1500_.jpg",
    previewurl: ""
  },
  { 
    id: 7, 
    title: "I can Hear Farm Animals",
    price: 180000, 
    type: "Interactive", 
    age: "0-2 Thn", 
    status: "PO",
    eta: "Akhir Feb 2026",
    lang: "Inggris", 
    publisher: "Lake Press",
    author: "Roger Priddy",
    pages: "10 Halaman Suara",
    desc: "Tekan tombolnya dan dengarkan suara hewan ternak yang lucu.",
    image: "https://m.media-amazon.com/images/I/91xjfOd5KCL._SL1500_.jpg",
    previewurl: ""
  },
  { 
    id: 8, 
    title: "Puasa Pertamaku",
    price: 56000,
    type: "Board Book", 
    age: "3-5 Thn", 
    status: "READY",
    eta: "Siap Kirim",
    lang: "Indonesia", 
    publisher: "Dar! Mizan",
    author: "Iwok Abqar",
    pages: "12 Halaman",
    desc: "Buku edukatif yang mengenalkan anak pada konsep puasa dalam Islam dengan cara yang menyenangkan",
    image: "https://static.mizanstore.com/d/img/book/cover/rw-589--.jpg",
    previewurl: ""
  },
];

export default function CatalogPage() {
  const [selectedType, setSelectedType] = useState("Semua");
  const [selectedAge, setSelectedAge] = useState("Semua");
  const [selectedLang, setSelectedLang] = useState("Semua");
  const [selectedPublisher, setSelectedPublisher] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState(allBooks);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);

  const types = ["Semua", "Board Book", "Picture Book", "Hardcover", "Activity", "Pop-up", "Interactive", "Lift-the-Flap"];
  const ages = ["Semua", "0-2 Thn", "3-5 Thn", "6+ Thn"];
  const langs = ["Semua", "Indonesia", "Inggris"];
  const publishers = ["Semua", ...Array.from(new Set(allBooks.map(item => item.publisher)))];

  useEffect(() => {
    let result = allBooks;
    if (selectedType !== "Semua") result = result.filter(book => book.type === selectedType);
    if (selectedAge !== "Semua") result = result.filter(book => book.age === selectedAge);
    if (selectedLang !== "Semua") result = result.filter(book => book.lang === selectedLang);
    if (selectedPublisher !== "Semua") result = result.filter(book => book.publisher === selectedPublisher);
    if (searchQuery) result = result.filter(book => book.title.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredBooks(result);
  }, [selectedType, selectedAge, selectedLang, selectedPublisher, searchQuery]);

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const closeModal = () => setSelectedBook(null);
  const isInstagram = (url: string) => url && url.includes('instagram.com');

  return (
    <div className="min-h-screen bg-[#FFF9F0] font-sans text-[#6D4C41]">
      
      {/* HEADER */}
      <header className="bg-white border-b border-orange-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-[#8B5E3C] hover:text-[#FF9E9E] transition-colors font-bold">
                <ArrowLeft className="w-5 h-5" /> Kembali
            </Link>
            <h1 className="text-xl font-bold text-[#8B5E3C]">Katalog Lengkap</h1>
            <button className="md:hidden p-2 bg-orange-50 rounded-full text-[#8B5E3C]" onClick={() => setShowMobileFilter(true)}>
                <Filter className="w-5 h-5" />
            </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR FILTER */}
        <aside className={`fixed inset-0 z-40 bg-white p-6 md:static md:bg-transparent md:p-0 md:w-64 md:block overflow-y-auto transition-transform duration-300 ${showMobileFilter ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <div className="flex justify-between items-center mb-6 md:hidden">
                <h2 className="text-xl font-bold">Filter</h2>
                <button onClick={() => setShowMobileFilter(false)}><X /></button>
            </div>
            <div className="space-y-8">
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Cari judul..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-[#FF9E9E] bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div>
                    <h3 className="font-bold text-[#8B5E3C] mb-3">Penerbit</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">{publishers.map(pub => (<label key={pub} className="flex items-center gap-2 cursor-pointer hover:text-[#FF9E9E]"><input type="radio" name="publisher" className="accent-[#FF9E9E]" checked={selectedPublisher === pub} onChange={() => setSelectedPublisher(pub)} /><span className="text-sm">{pub}</span></label>))}</div>
                </div>
                <div>
                    <h3 className="font-bold text-[#8B5E3C] mb-3">Usia</h3>
                    <div className="space-y-2">{ages.map(age => (<label key={age} className="flex items-center gap-2 cursor-pointer hover:text-[#FF9E9E]"><input type="radio" name="age" className="accent-[#FF9E9E]" checked={selectedAge === age} onChange={() => setSelectedAge(age)} /><span className="text-sm">{age}</span></label>))}</div>
                </div>
                <div>
                    <h3 className="font-bold text-[#8B5E3C] mb-3">Jenis Buku</h3>
                    <div className="space-y-2">{types.map(type => (<label key={type} className="flex items-center gap-2 cursor-pointer hover:text-[#FF9E9E]"><input type="radio" name="type" className="accent-[#FF9E9E]" checked={selectedType === type} onChange={() => setSelectedType(type)} /><span className="text-sm">{type}</span></label>))}</div>
                </div>
                <div>
                    <h3 className="font-bold text-[#8B5E3C] mb-3">Bahasa</h3>
                    <div className="space-y-2">{langs.map(lang => (<label key={lang} className="flex items-center gap-2 cursor-pointer hover:text-[#FF9E9E]"><input type="radio" name="lang" className="accent-[#FF9E9E]" checked={selectedLang === lang} onChange={() => setSelectedLang(lang)} /><span className="text-sm">{lang}</span></label>))}</div>
                </div>
                 <button onClick={() => { setSelectedType("Semua"); setSelectedAge("Semua"); setSelectedLang("Semua"); setSelectedPublisher("Semua"); setSearchQuery(""); }} className="w-full py-2 bg-orange-100 text-[#8B5E3C] rounded-lg text-sm font-bold hover:bg-orange-200 transition-colors">Reset Filter</button>
            </div>
        </aside>

        {/* GRID PRODUK */}
        <main className="flex-1">
            <div className="mb-4 text-sm text-gray-500">Menampilkan <strong>{filteredBooks.length}</strong> buku</div>
            {filteredBooks.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-orange-200"><p className="text-xl text-gray-400">Tidak ada buku yang cocok dengan filter ini.</p></div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBooks.map((book, idx) => (
                        <Reveal key={book.id} delay={idx * 100}>
                            <div onClick={() => setSelectedBook(book)} className="bg-white p-3 rounded-2xl shadow-sm hover:shadow-xl transition-all group cursor-pointer hover:-translate-y-1">
                                <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-3 relative">
                                    <img src={book.image} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    
                                    {/* STATUS BADGE DI KATALOG */}
                                    <div className="absolute top-2 right-2">
                                        {book.status === 'READY' ? (
                                            <span className="bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md flex items-center gap-1">
                                                <Truck className="w-3 h-3" /> READY
                                            </span>
                                        ) : (
                                            <span className="bg-blue-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> PRE-ORDER
                                            </span>
                                        )}
                                    </div>

                                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                                        <span className="bg-white/90 text-[10px] px-2 py-0.5 rounded-full font-bold text-[#8B5E3C] shadow-sm">{book.type}</span>
                                        <span className="bg-[#FF9E9E]/90 text-[10px] px-2 py-0.5 rounded-full font-bold text-white shadow-sm">{book.age}</span>
                                    </div>
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="bg-white/90 text-[#8B5E3C] px-3 py-1 rounded-full text-xs font-bold">Lihat Detail</span>
                                    </div>
                                </div>
                                <h3 className="font-bold text-[#8B5E3C] text-sm md:text-base line-clamp-2 min-h-[2.5rem]">{book.title}</h3>
                                <p className="text-[#FF9E9E] font-bold mt-2">{formatRupiah(book.price)}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            )}
        </main>
      </div>

      {/* MODAL POPUP (FULL FEATURE) */}
      {selectedBook && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="absolute inset-0" onClick={closeModal}></div>
            
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full overflow-hidden flex flex-col md:flex-row animate-scale-up max-h-[90vh]">
                
                <button onClick={closeModal} className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white text-gray-500 hover:text-red-500 transition-colors shadow-sm"><X className="w-6 h-6" /></button>
                
                <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-6 md:p-8">
                    <img src={selectedBook.image} alt={selectedBook.title} className="max-w-full max-h-[300px] md:max-h-[500px] object-contain rounded-lg shadow-md" />
                </div>
                
                <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col text-left overflow-y-auto">
                    <div className="flex gap-2 mb-3">
                        {/* BADGE DI DALAM MODAL KATALOG */}
                        {selectedBook.status === 'READY' ? (
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">READY STOCK</span>
                        ) : (
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">PRE-ORDER</span>
                        )}
                        <span className="inline-block px-3 py-1 bg-orange-100 text-[#8B5E3C] text-xs font-bold rounded-full">{selectedBook.type}</span>
                        <span className="inline-block px-3 py-1 bg-[#FF9E9E] text-white text-xs font-bold rounded-full">{selectedBook.age}</span>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-bold text-[#8B5E3C] mb-2 leading-tight">{selectedBook.title}</h3>
                    <p className="text-2xl font-bold text-[#FF9E9E] mb-6">{formatRupiah(selectedBook.price)}</p>
                    
                    {/* INFO BOX STATUS & ETA */}
                    <div className="bg-slate-50 p-4 rounded-xl mb-6 text-sm text-slate-700 border border-slate-100">
                        <div className="flex justify-between mb-1">
                            <span>Status:</span>
                            <span className="font-bold">{selectedBook.status === 'READY' ? 'Tersedia' : 'Pre-Order'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Estimasi Tiba:</span>
                            <span className="font-bold text-[#8B5E3C]">{selectedBook.eta}</span>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6 text-sm text-slate-600">
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-orange-300" /><span>Penulis: {selectedBook.author}</span></div>
                        <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-orange-300" /><span>Penerbit: {selectedBook.publisher}</span></div>
                        <div className="flex items-center gap-2"><Book className="w-4 h-4 text-orange-300" /><span>Spesifikasi: {selectedBook.pages}</span></div>
                        <div className="flex items-start gap-2"><Globe className="w-4 h-4 text-orange-300 mt-1" /><span>{selectedBook.desc}</span></div>
                    </div>

                    {selectedBook.previewurl && (
                        <div className="mb-6">
                            <h4 className="font-bold text-[#8B5E3C] mb-2 flex items-center gap-2">
                                <Eye className="w-4 h-4" /> Preview Buku
                            </h4>
                            <div className={`relative w-full rounded-xl overflow-hidden shadow-sm border border-orange-100 ${isInstagram(selectedBook.previewurl) ? 'h-[550px]' : 'aspect-video'}`}>
                                <iframe 
                                    className="absolute inset-0 w-full h-full"
                                    src={getEmbedUrl(selectedBook.previewurl) as string} 
                                    title="Review Preview" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <a href={selectedBook.ppreviewurl} target="_blank" className="text-xs text-orange-400 hover:text-orange-600 mt-1 inline-block underline">
                                Buka di aplikasi aslinya
                            </a>
                        </div>
                    )}

                    <div className="flex gap-3 mt-auto pt-4">
                         <a href="https://wa.me/6282314336969" target="_blank" className="flex-1 bg-[#8B5E3C] text-white py-3 rounded-xl font-bold text-center hover:bg-[#6D4C41] transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                            <MessageCircle className="w-5 h-5" /> {selectedBook.status === 'READY' ? 'Beli Sekarang' : 'Ikut PO Sekarang'}
                        </a>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}