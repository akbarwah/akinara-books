'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Instagram, MessageCircle, ShoppingBag, Star, Truck, Heart, Menu, X, ArrowRight, MapPin, Mail, Book, User, Globe } from 'lucide-react';

// --- UTILITY COMPONENT: REVEAL ON SCROLL ---
const Reveal = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- DATA BUKU (Dipindah ke atas agar bisa diakses Modal) ---
const booksData = [
    { 
        id: 1, 
        title: "Ushborne: Pull-back Busy Train Book", 
        price: "Rp 125.000", 
        author: "Fiona Watt",
        pages: "10 Halaman (Board Book)",
        desc: "Buku interaktif yang sangat seru! Dilengkapi dengan mainan kereta api yang bisa ditarik mundur (pull-back) dan berjalan di atas jalur yang ada di dalam buku. Sangat cocok untuk melatih motorik halus anak.",
        image: "https://usborne.com/media/catalog/product/cache/577949ba73ecbe39f04bc3cd25e7620e/9/7/9781409550341_cover_image.jpg" 
    },
    { 
        id: 2, 
        title: "Dear Zoo", 
        price: "Rp 65.000", 
        author: "Rod Campbell",
        pages: "18 Halaman (Lift-the-Flap)",
        desc: "Buku klasik kesayangan jutaan anak di dunia. Bercerita tentang anak yang meminta hewan peliharaan dari kebun binatang. Dengan fitur 'buka-tutup' (lift-the-flap) yang mengajak anak menebak hewan apa di balik keranjang.",
        image: "https://m.media-amazon.com/images/I/71PcexlBwQL._SL1440_.jpg" 
    },
    { 
        id: 3, 
        title: "The Pout-Pout Fish", 
        price: "Rp 95.000", 
        author: "Deborah Diesen",
        pages: "32 Halaman (Hard Cover)",
        desc: "Kisah ikan yang selalu cemberut dan menyebarkan kesedihan. Sampai akhirnya ia menemukan bahwa senyum bisa mengubah segalanya. Cerita berirama (rhyming) yang sangat enak dibacakan nyaring.",
        image: "https://mpd-biblio-covers.imgix.net/9780374360979.jpg" 
    },
    { 
        id: 4, 
        title: "Fifty Shades of Grey", 
        price: "Rp 150.000", 
        author: "E.L James",
        pages: "24 Halaman",
        desc: "Bercerita tentang Ana, gadis yang ditaksir CEO super kaya dan tampan. Kamu akan menemukan perjalanan ngewe yang berbeda.",
        image: "https://m.media-amazon.com/images/I/81OviQ6gLtL.jpg" 
    },
    { 
        id: 5, 
        title: "365 Days", 
        price: "Rp 280.000",
        author: "Blanka Lipinska",
        pages: "336 Halaman", 
        desc: "Laura, seorang wanita muda yang diculik oleh bos mafia Italia, Massimo. Ia diberi waktu 365 hari untuk jatuh cinta padanya. Novel penuh gairah dan drama yang memikat.",
        image: "https://m.media-amazon.com/images/I/71wTeYgIf4L._SY466_.jpg" 
    },
    { 
        id: 6, 
        title: "Mein Kampf",
        author: "Adolf Hitler",
        pages: "720 Halaman",
        desc: "Autobiografi sekaligus manifesto politik Hitler. Ditulis saat dipenjara setelah kudeta gagal, buku ini memaparkan ideologi Nazi, rasisme, dan rencana masa depan Jerman. Kontroversial, penuh propaganda, dan menjadi teks utama yang membentuk sejarah kelam abad ke-20.",
        price: "Rp 210.000", 
        image: "https://blackwells.co.uk/jacket/l/9781935785071.webp" 
    },
    { 
        id: 7, 
        title: "Quantum Entanglement for Babies",
        author: "Chris Ferrie",
        pages: "24 Halaman",
        desc: "Buku sains untuk bayi yang menjelaskan konsep keterikatan kuantum dengan cara yang sederhana dan menyenangkan. Dilengkapi ilustrasi warna-warni yang menarik perhatian si kecil.",
        price: "Rp 96.000", 
        image: "https://m.media-amazon.com/images/I/81JJlf4IfxL._AC_UF1000,1000_QL80_.jpg" 
    },
    { 
        id: 8, 
        title: "Kama Sutra", 
        author: "Vatsyayana",
        pages: "240 Halaman",
        desc: "Teks klasik India tentang cinta, erotisme, dan seni hidup. Lebih dari sekadar manual seks, Kama Sutra membahas keseimbangan antara kesenangan (kama), kewajiban (dharma), dan kesuksesan (artha). Filosofi kuno yang menekankan harmoni dalam kehidupan dan hubungan.",
        price: "Rp 126.000", 
        image: "https://cdn.exoticindia.com/images/products/thumbnails/t800x600/books-2019-003/baf174.jpg" 
    },
];

// --- COMPONENTS ---

// 1. Navbar (Sticky)
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const waLink = "https://wa.me/6282314336969"; 

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#FFF9F0]/90 backdrop-blur-md border-b border-orange-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3 animate-fade-in">
            {/* Logo Image */}
            <div className="w-10 h-10 relative bg-white rounded-full overflow-hidden border-2 border-orange-200 shadow-sm hover:scale-105 transition-transform duration-300">
               <img src="/logo-akinara.png" alt="Akinara Logo" className="object-cover w-full h-full" /> 
            </div>
            <span className="font-bold text-2xl text-[#8B5E3C] tracking-wide">
              Akinara<span className="text-[#FF9E9E]">Books</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#katalog" className="text-[#8B5E3C] font-medium hover:text-[#FF9E9E] transition-colors hover:-translate-y-0.5 transform duration-200">Katalog</a>
            <a href="#tentang" className="text-[#8B5E3C] font-medium hover:text-[#FF9E9E] transition-colors hover:-translate-y-0.5 transform duration-200">Tentang Kami</a>
            <a 
              href="https://shopee.co.id/akinarabooks" 
              target="_blank"
              className="bg-[#FF9E9E] hover:bg-[#ff8585] text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 hover:-translate-y-0.5 transform duration-200"
            >
              <ShoppingBag className="w-4 h-4" /> Belanja
            </a>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-[#8B5E3C]">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#FFF9F0] border-t border-orange-100 p-4 space-y-4 shadow-lg animate-fade-in-down">
          <a href="#katalog" className="block text-[#8B5E3C] font-medium">Katalog</a>
          <a href="#tentang" className="block text-[#8B5E3C] font-medium">Tentang Kami</a>
          <a href="https://shopee.co.id/akinarabooks" className="block text-[#FF9E9E] font-bold">Ke Shopee</a>
        </div>
      )}
    </nav>
  );
};

// 2. Hero Section
const Hero = () => {
  const waLink = "https://wa.me/6282314336969";

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden bg-[#FFF9F0]">
      {/* Background Blobs (Animated) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E6E6FA] rounded-full blur-[100px] opacity-60 -translate-y-1/2 translate-x-1/4 animate-pulse duration-[5000ms]"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FFDFC4] rounded-full blur-[80px] opacity-50 translate-y-1/4 -translate-x-1/4 animate-pulse duration-[7000ms]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <Reveal>
            <div className="inline-block mb-6 px-4 py-1.5 bg-white border border-orange-100 rounded-full shadow-sm hover:scale-105 transition-transform cursor-default">
            <span className="text-[#8B5E3C] text-sm font-semibold">✨ Toko Buku Anak Terkurasi di Jogja</span>
            </div>
        </Reveal>

        <Reveal delay={200}>
            {/* Title Wrapper untuk menampung ornamen */}
            <div className="relative inline-block">
                {/* Ornamen Starry */}
                <div className="absolute -top-4 -left-6 text-[#FF9E9E] animate-pulse duration-[3000ms]"><Star className="w-5 h-5 fill-current opacity-80 rotate-[-12deg]" /></div>
                <div className="absolute top-0 -right-8 text-yellow-400 animate-pulse duration-[4000ms] delay-500"><Star className="w-7 h-7 fill-current opacity-70 rotate-[12deg]" /></div>
                <div className="absolute bottom-4 right-0 text-[#9D84B7] animate-pulse duration-[2500ms] delay-200"><Star className="w-4 h-4 fill-current opacity-60" /></div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-[#8B5E3C] mb-6 leading-tight relative z-10">
                Buka Buku, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9E9E] to-[#9D84B7]">
                    Buka Imajinasi.
                </span>
                </h1>
            </div>
        </Reveal>

        <Reveal delay={400}>
            <p className="text-lg md:text-xl text-[#6D4C41] mb-10 max-w-2xl mx-auto leading-relaxed">
            Selamat datang di <strong>Akinara Books & Library</strong>. Kami menyediakan buku anak pilihan dari seluruh dunia untuk menemani masa kecil si buah hati.
            </p>
        </Reveal>

        <Reveal delay={600}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
                href="https://shopee.co.id/akinarabooks" 
                target="_blank"
                className="w-full sm:w-auto px-8 py-4 bg-[#8B5E3C] text-white rounded-full font-bold text-lg hover:bg-[#6D4C41] shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
                <ShoppingBag className="w-5 h-5" />
                Beli di Shopee
            </a>
            <a 
                href={waLink}
                target="_blank"
                className="w-full sm:w-auto px-8 py-4 bg-white text-[#8B5E3C] border-2 border-[#8B5E3C] rounded-full font-bold text-lg hover:bg-[#FFF9F0] transition-transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
                <MessageCircle className="w-5 h-5" />
                Chat Admin
            </a>
            </div>
        </Reveal>
      </div>
      
      {/* Wavy Shape Divider */}
      <div className="absolute bottom-0 left-0 w-full leading-none overflow-hidden rotate-180">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[60px] md:h-[100px] fill-white">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>
    </section>
  );
};

// 3. Features Section
const Features = () => {
  const features = [
    { 
        icon: <Star className="w-6 h-6 text-yellow-500" />, 
        title: "Koleksi Pilihan", 
        desc: "Buku-buku terbaik yang dikurasi khusus untuk mendukung tumbuh kembang anak." 
    },
    { 
        icon: <Truck className="w-6 h-6 text-blue-500" />, 
        title: "Pengiriman Luas", 
        desc: "Melayani pengiriman ke seluruh Indonesia dengan packing aman dan rapi." 
    },
    { 
        icon: <Heart className="w-6 h-6 text-pink-500" />, 
        title: "Ramah Anak", 
        desc: "Setiap buku dipilih dengan mempertimbangkan keamanan dan nilai edukatif." 
    },
  ];

  return (
    <section className="py-20 bg-white" id="tentang">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-[#8B5E3C] mb-4">Mengapa Memilih Kami?</h2>
        </Reveal>
        
        <Reveal delay={200}>
            <p className="text-[#6D4C41] max-w-4xl mx-auto mb-16">
                Kami berkomitmen menghadirkan buku-buku berkualitas untuk menemani petualangan belajar si kecil.
            </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <Reveal key={idx} delay={idx * 200}>
                <div className="p-8 rounded-3xl bg-[#FFF9F0] border border-orange-50 text-center hover:shadow-xl transition-all duration-300 group cursor-default hover:-translate-y-2">
                <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#8B5E3C] mb-3">{feature.title}</h3>
                <p className="text-[#6D4C41] leading-relaxed text-sm">{feature.desc}</p>
                </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// 4. Catalog Preview (With Modal Logic)
const CatalogPreview = () => {
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const closeModal = () => setSelectedBook(null);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#FFF9F0]" id="katalog">
      <div className="max-w-7xl mx-auto px-4 text-center">
        
        <div className="flex flex-col items-center gap-3 mb-12">
            <Reveal>
                <span className="inline-block px-4 py-1.5 bg-[#FF9E9E] text-white rounded-full text-sm font-bold tracking-wide shadow-sm mb-2">
                    KOLEKSI TERBARU
                </span>
            </Reveal>
            <Reveal delay={200}>
                <h2 className="text-3xl md:text-5xl font-extrabold text-[#8B5E3C] mb-2">
                    Buku Pilihan Untuk Si Kecil
                </h2>
            </Reveal>
            <Reveal delay={300}>
                <p className="text-[#6D4C41] text-sm md:text-base font-medium max-w-4xl mx-auto">
                    Jelajahi koleksi buku anak terbaik kami yang penuh warna dan cerita menarik
                </p>
            </Reveal>
        </div>
        
        {/* Grid Buku */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {booksData.map((book, idx) => (
            <Reveal key={book.id} delay={idx * 150}>
                <div 
                    onClick={() => setSelectedBook(book)} // Event saat diklik
                    className="group relative bg-white p-3 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                >
                <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4 relative bg-gray-100">
                    <img 
                        src={book.image} 
                        alt={book.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/90 text-[#8B5E3C] px-3 py-1 rounded-full text-xs font-bold transform scale-90 group-hover:scale-100 transition-transform">Lihat Detail</span>
                    </div>
                </div>

                <h3 className="font-bold text-[#8B5E3C] mb-1 line-clamp-1 text-left">{book.title}</h3>
                <p className="text-[#FF9E9E] font-bold text-lg text-left">{book.price}</p>
                </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={400}>
            <div className="mt-12">
            <a href="https://www.instagram.com/akinarabooks/" target="_blank" className="inline-flex items-center gap-2 bg-[#8B5E3C] text-white px-8 py-3 rounded-full font-bold hover:bg-[#6D4C41] transition-all shadow-lg hover:shadow-orange-200 hover:scale-105">
                Lihat Semua Koleksi <ArrowRight className="w-4 h-4" />
            </a>
            </div>
        </Reveal>
      </div>

      {/* MODAL POPUP (Diperbaiki agar gambar tidak terpotong) */}
      {selectedBook && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="absolute inset-0" onClick={closeModal}></div>

            <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row animate-scale-up max-h-[90vh]">
                
                <button onClick={closeModal} className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white text-gray-500 hover:text-red-500 transition-colors shadow-sm">
                    <X className="w-6 h-6" />
                </button>

                {/* Bagian Gambar (Kiri/Atas) - DIPERBAIKI */}
                <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-6 md:p-8">
                    {/* max-h dan object-contain adalah kuncinya */}
                    <img 
                        src={selectedBook.image} 
                        alt={selectedBook.title} 
                        className="max-w-full max-h-[300px] md:max-h-[450px] object-contain rounded-lg shadow-md" 
                    />
                </div>

                {/* Bagian Teks (Kanan/Bawah) */}
                <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center text-left overflow-y-auto">
                    <span className="inline-block px-3 py-1 bg-orange-100 text-[#8B5E3C] text-xs font-bold rounded-full w-fit mb-3">Best Seller</span>
                    <h3 className="text-2xl md:text-3xl font-bold text-[#8B5E3C] mb-2 leading-tight">{selectedBook.title}</h3>
                    <p className="text-2xl font-bold text-[#FF9E9E] mb-6">{selectedBook.price}</p>

                    <div className="space-y-3 mb-8 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-orange-300" />
                            <span>Penulis: {selectedBook.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Book className="w-4 h-4 text-orange-300" />
                            <span>Spesifikasi: {selectedBook.pages}</span>
                        </div>
                         <div className="flex items-start gap-2">
                            <Globe className="w-4 h-4 text-orange-300 mt-1" />
                            <span>{selectedBook.desc}</span>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-auto">
                         <a 
                            href="https://shopee.co.id/akinarabooks" 
                            target="_blank"
                            className="flex-1 bg-[#8B5E3C] text-white py-3 rounded-xl font-bold text-center hover:bg-[#6D4C41] transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                        >
                            <ShoppingBag className="w-5 h-5" /> Beli Sekarang
                        </a>
                    </div>
                </div>
            </div>
        </div>
      )}
    </section>
  );
};

// 5. Footer
const Footer = () => {
  const igLink = "https://www.instagram.com/akinarabooks/";
  const waLink = "https://wa.me/6282314336969";

  return (
    <footer className="bg-[#8B5E3C] text-[#FFF9F0] pt-16 pb-8 rounded-t-[3rem] mt-[-2rem] relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          <Reveal>
            <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="bg-[#FFF9F0] text-[#8B5E3C] px-2 py-0.5 rounded text-lg">A</span> Akinara Books
                </h3>
                <p className="text-orange-100/80 leading-relaxed mb-6">
                Toko buku anak pilihan yang menghadirkan cerita-cerita penuh makna untuk menemani tumbuh kembang si kecil.
                </p>
                <div className="flex gap-4">
                <a href={igLink} target="_blank" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors hover:scale-110"><Instagram className="w-5 h-5" /></a>
                <a href={waLink} target="_blank" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors hover:scale-110"><MessageCircle className="w-5 h-5" /></a>
                <a href="https://shopee.co.id" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors hover:scale-110"><ShoppingBag className="w-5 h-5" /></a>
                </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div>
                <h4 className="font-bold text-lg mb-4 text-orange-200">Hubungi Kami</h4>
                <ul className="space-y-3">
                <li className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-300 mt-1 flex-shrink-0" />
                    <span>Maguwoharjo, Yogyakarta, Indonesia</span>
                </li>
                <li className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-orange-300 flex-shrink-0" />
                    <a href={waLink} target="_blank" className="hover:text-white transition-colors">
                    +62 823-1433-6969
                    </a>
                </li>
                </ul>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div>
                <h4 className="font-bold text-lg mb-4 text-orange-200">Jam Buka</h4>
                <div className="bg-[#6D4C41] p-4 rounded-xl border border-white/10 hover:border-orange-300 transition-colors">
                <div className="flex justify-between mb-2">
                    <span>Senin - Jumat</span>
                    <span className="font-bold">09:00 - 17:00</span>
                </div>
                <div className="flex justify-between text-orange-200">
                    <span>Sabtu - Minggu</span>
                    <span className="font-bold">10:00 - 15:00</span>
                </div>
                </div>
            </div>
          </Reveal>

        </div>

        <div className="border-t border-white/10 pt-8 text-center text-orange-200/60 text-sm">
          <p>© 2026 Akinara Books & Library. Dibuat dengan ❤️ di Yogyakarta.</p>
        </div>
      </div>
    </footer>
  );
};

// --- MAIN EXPORT ---
export default function AkinaraLanding() {
  return (
    <div className="min-h-screen bg-[#FFF9F0] font-sans overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <CatalogPreview />
      <Footer />
    </div>
  );
}