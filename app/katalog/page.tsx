'use client';

import React, { useState, useEffect } from 'react';
import { Filter, Search, ShoppingBag, ArrowLeft, X, User, Book, Globe } from 'lucide-react';
import Link from 'next/link';

// --- DATA BUKU LENGKAP ---
const allBooks = [
  { 
    id: 1, 
    title: "Ushborne: Pull-back Busy Train", 
    price: 125000, 
    type: "Board Book", 
    age: "0-2 Tahun", 
    lang: "Inggris", 
    author: "Fiona Watt",
    pages: "10 Halaman",
    desc: "Buku interaktif dengan mainan kereta yang bisa berjalan di jalurnya.",
    image: "https://usborne.com/media/catalog/product/cache/577949ba73ecbe39f04bc3cd25e7620e/9/7/9781409550341_cover_image.jpg"
  },
  { 
    id: 2, 
    title: "Dear Zoo", 
    price: 65000, 
    type: "Lift-the-Flap", 
    age: "0-2 Tahun", 
    lang: "Inggris", 
    author: "Rod Campbell",
    pages: "18 Halaman",
    desc: "Buku klasik tentang mencari hewan peliharaan yang sempurna.",
    image: "https://m.media-amazon.com/images/I/71PcexlBwQL._SL1440_.jpg"
  },
  { 
    id: 3, 
    title: "Si Kancil Anak Nakal", 
    price: 45000, 
    type: "Picture Book", 
    age: "3-5 Tahun", 
    lang: "Indonesia", 
    author: "Tira Ikranegara",
    pages: "24 Halaman",
    desc: "Dongeng nusantara yang mengajarkan tentang kejujuran dan kecerdikan.",
    image: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=800&auto=format&fit=crop"
  },
  { 
    id: 4, 
    title: "Encyclopedia of Dinosaurs", 
    price: 250000, 
    type: "Hardcover", 
    age: "6+ Tahun", 
    lang: "Inggris", 
    author: "Dr. Thomas Holtz",
    pages: "120 Halaman",
    desc: "Ensiklopedia lengkap tentang dinosaurus dengan ilustrasi memukau.",
    image: "https://images.unsplash.com/photo-1559869279-d7796d859df9?q=80&w=800&auto=format&fit=crop"
  },
  { 
    id: 5, 
    title: "Harry Potter Pop-Up", 
    price: 350000, 
    type: "Pop-up", 
    age: "6+ Tahun", 
    lang: "Inggris", 
    author: "J.K Rowling",
    pages: "12 Halaman Pop-up",
    desc: "Keajaiban dunia sihir Hogwarts dalam bentuk 3 dimensi.",
    image: "https://m.media-amazon.com/images/I/91tA-NnS1HL._AC_UF1000,1000_QL80_.jpg"
  },
  { 
    id: 6, 
    title: "Belajar Angka & Huruf", 
    price: 35000, 
    type: "Activity", 
    age: "3-5 Tahun", 
    lang: "Indonesia", 
    author: "Tim Redaksi",
    pages: "32 Halaman",
    desc: "Buku aktivitas wipe-clean untuk melatih motorik halus.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop"
  },
  { 
    id: 7, 
    title: "Sound Book: Farm Animals", 
    price: 180000, 
    type: "Interactive", 
    age: "0-2 Tahun", 
    lang: "Inggris", 
    author: "Sam Taplin",
    pages: "10 Halaman Suara",
    desc: "Tekan tombolnya dan dengarkan suara hewan ternak yang lucu.",
    image: "https://m.media-amazon.com/images/I/81+2+1+k1lL._AC_UF1000,1000_QL80_.jpg"
  },
  { 
    id: 8, 
    title: "Aku Anak Jujur", 
    price: 55000, 
    type: "Picture Book", 
    age: "3-5 Tahun", 
    lang: "Indonesia", 
    author: "Kak Seto",
    pages: "24 Halaman",
    desc: "Cerita bergambar pembangun karakter anak sejak dini.",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop"
  },
];

export default function CatalogPage() {
  const [selectedType, setSelectedType] = useState("Semua");
  const [selectedAge, setSelectedAge] = useState("Semua");
  const [selectedLang, setSelectedLang] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState(allBooks);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  
  // State untuk Modal
  const [selectedBook, setSelectedBook] = useState<any>(null);

  const types = ["Semua", "Board Book", "Picture Book", "Hardcover", "Activity", "Pop-up", "Interactive", "Lift-the-Flap"];
  const ages = ["Semua", "0-2 Tahun", "3-5 Tahun", "6+ Tahun"];
  const langs = ["Semua", "Indonesia", "Inggris"];

  useEffect(() => {
    let result = allBooks;
    if (selectedType !== "Semua") result = result.filter(book => book.type === selectedType);
    if (selectedAge !== "Semua") result = result.filter(book => book.age === selectedAge);
    if (selectedLang !== "Semua") result = result.filter(book => book.lang === selectedLang);
    if (searchQuery) result = result.filter(book => book.title.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredBooks(result);
  }, [selectedType, selectedAge, selectedLang, searchQuery]);

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const closeModal = () => setSelectedBook(null);

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
                 <button onClick={() => { setSelectedType("Semua"); setSelectedAge("Semua"); setSelectedLang("Semua"); setSearchQuery(""); }} className="w-full py-2 bg-orange-100 text-[#8B5E3C] rounded-lg text-sm font-bold hover:bg-orange-200 transition-colors">Reset Filter</button>
            </div>
        </aside>

        {/* GRID PRODUK */}
        <main className="flex-1">
            <div className="mb-4 text-sm text-gray-500">Menampilkan <strong>{filteredBooks.length}</strong> buku</div>
            {filteredBooks.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-orange-200"><p className="text-xl text-gray-400">Tidak ada buku yang cocok dengan filter ini.</p></div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBooks.map((book) => (
                        <div key={book.id} onClick={() => setSelectedBook(book)} className="bg-white p-3 rounded-2xl shadow-sm hover:shadow-xl transition-all group cursor-pointer hover:-translate-y-1">
                            <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-3 relative">
                                <img src={book.image} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                    ))}
                </div>
            )}
        </main>
      </div>

      {/* MODAL POPUP */}
      {selectedBook && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="absolute inset-0" onClick={closeModal}></div>
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row animate-scale-up max-h-[90vh]">
                <button onClick={closeModal} className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white text-gray-500 hover:text-red-500 transition-colors shadow-sm"><X className="w-6 h-6" /></button>
                <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-6 md:p-8">
                    <img src={selectedBook.image} alt={selectedBook.title} className="max-w-full max-h-[300px] md:max-h-[450px] object-contain rounded-lg shadow-md" />
                </div>
                <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center text-left overflow-y-auto">
                    <span className="inline-block px-3 py-1 bg-orange-100 text-[#8B5E3C] text-xs font-bold rounded-full w-fit mb-3">{selectedBook.type}</span>
                    <h3 className="text-2xl md:text-3xl font-bold text-[#8B5E3C] mb-2 leading-tight">{selectedBook.title}</h3>
                    <p className="text-2xl font-bold text-[#FF9E9E] mb-6">{formatRupiah(selectedBook.price)}</p>
                    <div className="space-y-3 mb-8 text-sm text-slate-600">
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-orange-300" /><span>Penulis: {selectedBook.author}</span></div>
                        <div className="flex items-center gap-2"><Book className="w-4 h-4 text-orange-300" /><span>Spesifikasi: {selectedBook.pages}</span></div>
                        <div className="flex items-start gap-2"><Globe className="w-4 h-4 text-orange-300 mt-1" /><span>{selectedBook.desc}</span></div>
                    </div>
                    <div className="flex gap-3 mt-auto">
                         <a href="https://shopee.co.id/akinarabooks" target="_blank" className="flex-1 bg-[#8B5E3C] text-white py-3 rounded-xl font-bold text-center hover:bg-[#6D4C41] transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                            <ShoppingBag className="w-5 h-5" /> Beli Sekarang
                        </a>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}