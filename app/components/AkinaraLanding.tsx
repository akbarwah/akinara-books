'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Instagram, MessageCircle, ShoppingBag, Star, Truck, Heart, Menu, X, 
  ArrowRight, MapPin, Mail, Book as BookIcon, User, Globe, Building2, 
  PlayCircle, Eye, Calendar, Clock, Info, ChevronDown, ChevronUp, 
  HelpCircle, EarthIcon, Bookmark, CreditCard, Package, Flame, Zap, Hourglass 
} from 'lucide-react';
import { supabase } from '@/supabaseClient'; 

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
    let text = "";
    if (book.status === 'READY') {
        text = `Halo Admin, saya mau pesan buku *${book.title}* yang Ready Stock.`;
    } else if (book.status === 'PO') {
        text = `Halo Admin, saya mau ikut PO Batch ini untuk buku *${book.title}*.`;
    } else {
        text = `Halo Admin, saya tertarik dengan buku *${book.title}*. Apakah buku ini akan ada di Batch PO berikutnya?`;
    }
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

// --- KOMPONEN: PREMIUM STICKER BADGE ---
const StickerBadge = ({ type }: { type: string }) => {
    if (!type) return null;

    switch (type) {
        case 'BEST SELLER':
            return (
                <div className="absolute -top-4 -right-4 z-30 flex flex-col items-center group-hover:scale-110 transition-transform duration-300 origin-top">
                    <div className="relative flex flex-col items-center animate-bounce-slow">
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
                        <div className="bg-red-600 text-white px-3 py-1 rounded-md flex items-center justify-center border-2 border-white/50">
                            <span className="font-black text-[10px] tracking-widest">SALE</span>
                        </div>
                    </div>
                </div>
            );

        case 'NEW':
            return (
                <div className="absolute -top-2 -right-2 z-30 group-hover:scale-110 transition-transform duration-300 origin-top-right">
                    <div className="relative w-16 h-16">
                        <svg viewBox="0 0 100 100"className="w-full h-full drop-shadow-lg">
                            <path d="M0 0 H100 V60 L50 80 L0 60 Z" className="fill-red-600" />
                            <path d="M0 0 H30 L0 30 Z" className="fill-red-800 opacity-50" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center pb-4 pr-2">
                            <span className="text-white font-black text-sm tracking-wider rotate-45">NEW</span>
                        </div>
                    </div>
                </div>
            );

        case 'HOT':
            return (
                <div className="absolute -top-3 -right-3 z-30 group-hover:scale-110 transition-transform duration-300">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 border-2 border-white shadow-lg flex flex-col items-center justify-center animate-wiggle">
                        <Flame className="w-4 h-4 text-yellow-200 fill-yellow-200" />
                        <span className="text-white font-black text-[9px] italic pr-1">HOT</span>
                    </div>
                </div>
            );

        case 'COMING SOON':
            return (
                <div className="absolute -top-3 -right-3 z-30 group-hover:-translate-y-1 transition-transform duration-300">
                    <div className="bg-blue-600 text-white px-3 py-1.5 rounded-full border-2 border-white shadow-lg flex items-center gap-1.5 animate-float">
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

// --- DATA FAQ ---
const faqData = [
    {
        question: "Apa bedanya status Ready Stock, Pre-Order, dan Referensi?",
        answer: (
            <>
                <strong className="font-bold">Ready Stock</strong> berarti buku tersedia di gudang kami di Yogyakarta dan siap diproses untuk pengiriman. <strong className="font-bold">Pre-Order (PO)</strong> adalah buku yang sedang dalam masa pemesanan impor dengan estimasi waktu tunggu sekitar 4–8 minggu. <strong className="font-bold">Referensi</strong> merupakan arsip buku yang pernah kami jual, namun saat ini belum dibuka embali batch PO-nya.
            </>
        )
    },
    {
        question: "Bagaimana alur pemesanan dan pembayarannya?",
        answer: (
            <>
                Silakan klik tombol pemesanan di katalog, Anda akan terhubung langsung ke WhatsApp Admin kami. Untuk buku <strong className="font-bold">Ready Stock</strong>, pembayaran dilakukan secara penuh. Untuk <strong className="font-bold">Pre-Order (PO)</strong>, Anda cukup membayar DP sebesar 25% di awal, dan pelunasan dilakukan saat buku sudah tiba di Indonesia.
            </>
        )
    },
   {
    question: "Kenapa buku impor (PO) membutuhkan waktu lama untuk sampai?",
    answer: (
        <>
            Karena sebagian besar buku kami diimpor dari penerbit di Inggris, US, atau China. Proses <i className="italic">Shipping</i> (pengiriman) internasional serta pemeriksaan <i className="italic">Customs</i> (Bea Cukai) membutuhkan waktu. Kami memilih jalur yang legal dan aman agar buku sampai dalam kondisi terbaik.
        </>
    )
},
    {
        question: "Apakah buku Ready Stock bisa digabung ongkir dengan buku PO?",
        answer: "Umumnya, buku Ready Stock dikirim terpisah agar si kecil bisa segera membaca buku yang tersedia. Namun, jika estimasi kedatangan buku PO sudah dekat (sekitar 1–2 minggu), Anda dapat mengajukan permintaan hold kiriman kepada Admin untuk penggabungan ongkir."
    },
    {
        question: "Bagaimana cara agar tidak ketinggalan informasi PO buku incaran?",
        answer: "Kami menyarankan Anda untuk bergabung ke WhatsApp Group Community Akinara. Informasi pembukaan dan penutupan PO, promo, serta koleksi buku terbaru biasanya dibagikan lebih awal melalui grup tersebut."
    },
    {
        question: "Apakah ada garansi jika buku datang rusak?",
        answer: "Ya, tentu. Semua buku yang kami jual adalah original. Jika terdapat cacat produksi yang signifikan atau kerusakan akibat pengiriman, silakan kirimkan video unboxing kepada Admin kami. Kami akan membantu proses retur atau pengembalian dana sesuai ketentuan."
    }
];

// --- COMPONENT: NAVBAR ---
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#FFF9F0]/90 backdrop-blur-md border-b border-orange-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 relative bg-white rounded-full overflow-hidden border-2 border-orange-200 shadow-sm hover:scale-105 transition-transform duration-300">
               <img src="/logo-akinara.png" alt="Akinara Logo" className="object-cover w-full h-full" /> 
            </div>
            <span className="font-bold text-2xl text-[#8B5E3C] tracking-wide">Akinara<span className="text-[#FF9E9E]">Books</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#katalog" className="text-[#8B5E3C] font-medium hover:text-[#FF9E9E] transition-colors hover:-translate-y-0.5 transform duration-200">Katalog</a>
            <a href="#faq" className="text-[#8B5E3C] font-medium hover:text-[#FF9E9E] transition-colors hover:-translate-y-0.5 transform duration-200">FAQ</a>
            <a href="#tentang" className="text-[#8B5E3C] font-medium hover:text-[#FF9E9E] transition-colors hover:-translate-y-0.5 transform duration-200">Tentang Kami</a>
            <a href="https://shopee.co.id/akinarabooks" target="_blank" className="bg-[#FF9E9E] hover:bg-[#ff8585] text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 hover:-translate-y-0.5 transform duration-200">
              <ShoppingBag className="w-4 h-4" /> Belanja
            </a>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-[#8B5E3C]">{isOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-[#FFF9F0] border-t border-orange-100 p-4 space-y-4 shadow-lg animate-fade-in-down">
          <a href="#katalog" className="block text-[#8B5E3C] font-medium">Katalog</a>
          <a href="#faq" className="block text-[#8B5E3C] font-medium">FAQ</a>
          <a href="#tentang" className="block text-[#8B5E3C] font-medium">Tentang Kami</a>
          <a href="https://shopee.co.id/akinarabooks" className="block text-[#FF9E9E] font-bold">Ke Shopee</a>
        </div>
      )}
    </nav>
  );
};

// --- COMPONENT: HERO (FINAL ENGLISH VERSION) ---
const Hero = () => {
  return (
    <section className="relative pt-28 pb-8 lg:pt-36 lg:pb-10 overflow-hidden bg-[#FFF9F0]">
      {/* Background blobs tetap sama */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-[#E6E6FA] rounded-full blur-[100px] opacity-60 -translate-y-1/2 translate-x-1/4 animate-pulse duration-5000"></div>
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-[#FFDFC4] rounded-full blur-[80px] opacity-50 translate-y-1/4 -translate-x-1/4 animate-pulse duration-7000"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <Reveal>
            <div className="inline-block mb-4 px-4 py-1.5 bg-white border border-orange-100 rounded-full shadow-sm hover:scale-105 transition-transform cursor-default">
              {/* TAGLINE: Menggunakan "Exceptional" untuk menghindari kata "Curated" */}
              <span className="text-[#8B5E3C] text-sm font-semibold">✨ Treasured Import & Local Children’s Books</span>
            </div>
        </Reveal>
        
        <Reveal delay={200}>
            <div className="relative inline-block">
                <div className="absolute -top-6 -left-8 md:-left-12 text-[#FF9E9E] animate-pulse duration-3000">
                    <Star className="w-8 h-8 md:w-10 md:h-10 fill-current opacity-90 -rotate-12" />
                </div>
                <div className="absolute -top-2 -right-6 md:-right-10 text-yellow-400 animate-bounce duration-4000 delay-700">
                    <Star className="w-5 h-5 md:w-7 md:h-7 fill-current opacity-80 rotate-12" />
                </div>
                <div className="absolute bottom-2 -right-4 md:-right-8 text-[#9D84B7] animate-pulse duration-5000 delay-200">
                    <Star className="w-4 h-4 md:w-6 md:h-6 fill-current opacity-70" />
                </div>
                
                {/* HEADLINE: Format Balanced (3 kata - 3 kata) */}
                <h1 className="text-5xl md:text-7xl font-extrabold text-[#8B5E3C] mb-4 leading-tight relative z-10">
                    Great Minds Start <br />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-[#FF9E9E] to-[#9D84B7]">
                        Between the Pages
                    </span>
                </h1>
            </div>
        </Reveal>
        
        <Reveal delay={400}>
            {/* SUB-HEADLINE: Warm, Joyful, No Redundancy */}
            <p className="text-lg md:text-xl text-[#6D4C41] mb-0 max-w-4xl mx-auto leading-relaxed">
                Where every story is a new adventure. Explore our handpicked collection of extraordinary books, chosen to be the perfect companions for your little explorer’s first steps into the magic of reading.
            </p>
        </Reveal>
      </div>
    </section>
  );
};

// --- COMPONENT: PO INFO BANNER (PREMIUM INTERACTIVE VERSION) ---
const POInfoBanner = () => {
    const [showRules, setShowRules] = useState(false);
    const [daysLeft, setDaysLeft] = useState(0);

    const TARGET_DATE_STR = '2026-01-20T23:59:59';

    const formattedDate = new Date(TARGET_DATE_STR).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short'
    });

    useEffect(() => {
        const targetDate = new Date(TARGET_DATE_STR).getTime();
        const now = new Date().getTime();
        const difference = targetDate - now;
        const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
        setDaysLeft(days > 0 ? days : 0);
    }, []);

    const waLink = "https://wa.me/6282314336969?text=Halo%20Akinara%21%20Saya%20ingin%20tanya%20dan%20pesan%20buku%20PO%20Flying%20Eye%20Books...";

    return (
        <div className="bg-[#FFF9F0] py-8 border-b border-orange-100 font-sans relative overflow-hidden">
            {/* Dekorasi Background Halus */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-50%] left-[-10%] w-96 h-96 bg-orange-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-50%] right-[-10%] w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 relative z-10">
                {/* UPGRADE VISUAL DI SINI: 
                    - group: untuk mengontrol hover anak elemen
                    - hover:-translate-y-1: efek naik sedikit
                    - hover:shadow-xl: bayangan menebal
                    - hover:border-orange-300: border berubah warna
                */}
                <div className="group bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 md:p-8 shadow-lg border border-orange-100 transition-all duration-500 ease-out hover:shadow-[0_20px_40px_-15px_rgba(255,158,158,0.3)] hover:-translate-y-1 hover:border-orange-300 flex flex-col md:flex-row items-center justify-between gap-6 relative">
                    
                    {/* Efek Kilau/Shimmer saat Hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out pointer-events-none rounded-[2rem]"></div>

                    <div className="flex-1 relative z-10 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                            {/* Animated Badge */}
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200 shadow-sm group-hover:bg-green-100 transition-colors">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Ongoing Batch
                            </span>
                            
                            {daysLeft > 0 && (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-200 shadow-sm group-hover:bg-red-100 transition-colors">
                                    <Clock className="w-3 h-3 animate-pulse"/> {daysLeft} Hari Lagi
                                </span>
                            )}
                        </div>

                        <h3 className="text-2xl md:text-3xl font-black text-[#8B5E3C] leading-tight tracking-wide mb-2">
                            Open PO: <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9E9E] to-[#FF7043] group-hover:to-[#FF5722] transition-all">Flying Eye Books</span>
                        </h3>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs md:text-sm text-[#6D4C41] font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-2 bg-orange-50/50 px-3 py-1.5 rounded-lg border border-orange-100/50">
                                <Calendar className="w-4 h-4 text-orange-400"/> 
                                <span>Tutup: <strong className="text-[#8B5E3C]">{formattedDate}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 bg-orange-50/50 px-3 py-1.5 rounded-lg border border-orange-100/50">
                                <Truck className="w-4 h-4 text-orange-400"/> 
                                <span>ETA Indo: <strong className="text-[#8B5E3C]">Mei-Juni 2026</strong></span>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setShowRules(true)}
                        className="relative overflow-hidden w-full md:w-auto px-8 py-4 bg-[#8B5E3C] text-white rounded-2xl font-black text-xs tracking-widest hover:bg-[#6D4C41] transition-all shadow-md active:scale-95 group-hover:shadow-orange-200 group-hover:shadow-lg flex items-center justify-center gap-2"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <Info className="w-4 h-4" /> CARA ORDER
                        </span>
                    </button>
                </div>
            </div>

            {/* Modal Detail & Cara Order (Tidak berubah fungsionalitasnya, hanya styling sedikit) */}
            {showRules && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#8B5E3C]/30 backdrop-blur-md animate-fade-in text-sm">
                    <div className="absolute inset-0" onClick={() => setShowRules(false)}></div>
                    <div className="relative bg-white rounded-[3rem] shadow-2xl max-w-xl w-full p-8 md:p-12 animate-scale-up max-h-[90vh] overflow-y-auto border-4 border-orange-100">
                        
                        <button onClick={() => setShowRules(false)} className="absolute top-8 right-8 text-gray-300 hover:text-red-500 transition-colors bg-gray-50 rounded-full p-2">
                            <X className="w-6 h-6"/>
                        </button>
                        
                        <div className="text-center mb-10">
                            <h3 className="text-2xl font-black text-[#8B5E3C] uppercase tracking-tighter">Order Journey</h3>
                            <p className="text-orange-400 font-bold text-xs uppercase tracking-widest mt-1">Langkah mudah pesan buku impianmu</p>
                        </div>
                        
                        <div className="space-y-8 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-orange-100">
                            <div className="relative pl-12">
                                <span className="absolute left-0 top-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-[#8B5E3C] font-black text-xs z-10 border-4 border-white shadow-sm">1</span>
                                <p className="font-black text-[#8B5E3C] text-base">Pilih Buku & Chat Admin</p>
                                <p className="text-slate-500 leading-relaxed mt-1">Pilih koleksi Flying Eye Books di katalog ini, lalu klik tombol WhatsApp untuk bertanya.</p>
                            </div>
                            
                            <div className="relative pl-12">
                                <span className="absolute left-0 top-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-[#8B5E3C] font-black text-xs z-10 border-4 border-white shadow-sm">2</span>
                                <p className="font-black text-[#8B5E3C] text-base">Konfirmasi Pesanan</p>
                                <p className="text-slate-500 leading-relaxed mt-1">Admin akan mengecek ketersediaan buku dan memberikan detail estimasi waktu tiba (ETA).</p>
                            </div>

                             <div className="relative pl-12">
                                <span className="absolute left-0 top-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-[#8B5E3C] font-black text-xs z-10 border-4 border-white shadow-sm">3</span>
                                <p className="font-black text-[#8B5E3C] text-base">Submit & DP 25%</p>
                                <p className="text-slate-500 leading-relaxed mt-1">Pembayaran DP dilakukan SETELAH kami men-submit orderan ke importir pada h+7 setelah PO ditutup.</p>
                            </div>

                            <div className="relative pl-12">
                                <span className="absolute left-0 top-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-[#8B5E3C] font-black text-xs z-10 border-4 border-white shadow-sm">4</span>
                                <p className="font-black text-[#8B5E3C] text-base">Buku Tiba & Pelunasan</p>
                                <p className="text-slate-500 leading-relaxed mt-1">Saat buku mendarat di gudang bea cukai Jakarta, admin akan mengirimkan invoice pelunasan.</p>
                            </div>

                            <div className="relative pl-12">
                                <span className="absolute left-0 top-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-[#8B5E3C] font-black text-xs z-10 border-4 border-white shadow-sm">5</span>
                                <p className="font-black text-[#8B5E3C] text-base">Siap Meluncur ke Rumah!</p>
                                <p className="text-slate-500 leading-relaxed mt-1">Buku dikemas dengan rapi dan aman untuk dikirim ke alamatmu.</p>
                            </div>
                        </div>

                        <div className="mt-12 space-y-4">
                            <a 
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-5 bg-[#25D366] hover:bg-[#1ebd5a] text-white rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 hover:shadow-green-200 hover:-translate-y-1"
                            >
                                <MessageCircle className="w-6 h-6" /> CHAT ADMIN VIA WA
                            </a>
                            <button 
                                onClick={() => setShowRules(false)}
                                className="w-full py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-[#8B5E3C] transition-colors"
                            >
                                Tutup Panduan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- COMPONENT: FEATURES ---
const Features = () => {
  const features = [
    { icon: <Star className="w-6 h-6 text-yellow-500" />, title: "Koleksi Terkurasi", desc: "Setiap buku dipilih dengan mempertimbangkan usia, tahap perkembangan, serta nilai edukatif yang relevan bagi anak." },
    { icon: <EarthIcon className="w-6 h-6 text-blue-500" />, title: "Koleksi Lokal & Impor Berkualitas", desc: "Menghadirkan buku anak pilihan dari penerbit lokal dan internasional untuk memperkaya pengalaman membaca si kecil." },
    { icon: <Heart className="w-6 h-6 text-pink-500" />, title: "Ramah Anak", desc: "Konten dan material buku diperhatikan agar sesuai untuk anak dan mendukung pengalaman belajar yang positif." },
  ];
  return (
    <section className="py-20 bg-white" id="tentang">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <Reveal><h2 className="text-3xl md:text-4xl font-bold text-[#8B5E3C] mb-4">Mengapa Memilih Akinara Books?</h2></Reveal>
        <Reveal delay={200}><p className="text-[#6D4C41] max-w-4xl mx-auto mb-16">Kami membantu orang tua memilih buku yang tepat, tanpa harus bingung, ragu, atau khawatir soal kualitas</p></Reveal>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <Reveal key={idx} delay={idx * 200}>
                <div className="p-8 rounded-3xl bg-[#FFF9F0] border border-orange-50 text-center hover:shadow-xl transition-all duration-300 group cursor-default hover:-translate-y-2">
                <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
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

// --- COMPONENT: CATALOG PREVIEW (DYNAMIC FROM SUPABASE) ---
const CatalogPreview = () => {
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [highlightBooks, setHighlightBooks] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true); 
  const closeModal = () => setSelectedBook(null);

  useEffect(() => {
    async function fetchHighlights() {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('is_highlight', true)
        .limit(4); 

      if (error) {
        console.error("Error fetching highlights:", error);
      } else {
        setHighlightBooks(data || []);
      }
      setLoading(false);
    }

    fetchHighlights();
  }, []);

  return (
    <section className="py-20 bg-linear-to-b from-white to-[#FFF9F0]" id="katalog">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex flex-col items-center gap-3 mb-12">
            <Reveal><span className="inline-block px-4 py-1.5 bg-[#FF9E9E] text-white rounded-full text-sm font-bold tracking-wide shadow-sm mb-2">KOLEKSI TERBAIK</span></Reveal>
            <Reveal delay={200}><h2 className="text-3xl md:text-5xl font-extrabold text-[#8B5E3C] mb-2">Buku Pilihan Untuk Si Kecil</h2></Reveal>
            <Reveal delay={300}><p className="text-[#6D4C41] text-sm md:text-base font-medium max-w-4xl mx-auto">Jelajahi koleksi buku anak terbaik kami yang penuh warna dan cerita menarik</p></Reveal>
        </div>
        
        {loading ? (
             <div className="text-center py-20">
                <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-[#8B5E3C] rounded-full animate-spin mb-2"></div>
                <p className="text-[#8B5E3C]">Memuat rekomendasi...</p>
             </div>
        ) : highlightBooks.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-orange-200 rounded-3xl">
                <p className="text-gray-400">Belum ada buku yang di-highlight.</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {highlightBooks.map((book, idx) => (
                <Reveal key={book.id} delay={idx * 150}>
                    <div onClick={() => setSelectedBook(book)} className="group relative bg-white p-3 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer h-full flex flex-col border border-transparent hover:border-orange-100">
                        
                        {/* --- FITUR BARU: STIKER LABEL (THE MAGIC CSS) --- */}
                        {book.sticker_text && (
                            <StickerBadge type={book.sticker_text} />
                        )}

                        <div className="aspect-3/4 rounded-xl overflow-hidden mb-4 relative bg-gray-100">
                            <img src={book.image} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            
                            {/* STATUS BADGE */}
                            <div className="absolute top-2 right-2">
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

                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                                <span className="bg-white/90 text-[10px] px-2 py-0.5 rounded-full font-bold text-[#8B5E3C] shadow-sm">{book.type}</span>
                                <span className="bg-[#FF9E9E]/90 text-[10px] px-2 py-0.5 rounded-full font-bold text-white shadow-sm">{book.age}</span>
                            </div>
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="bg-white/90 text-[#8B5E3C] px-3 py-1 rounded-full text-xs font-bold transform scale-90 group-hover:scale-100 transition-transform">Lihat Detail</span>
                            </div>
                        </div>
                        <h3 className="font-bold text-[#8B5E3C] mb-1 line-clamp-1 text-left">{book.title}</h3>
                        <p className="text-[#FF9E9E] font-bold text-lg text-left">Rp {book.price.toLocaleString('id-ID')}</p>
                    </div>
                </Reveal>
            ))}
            </div>
        )}

        <Reveal delay={400}>
            <div className="mt-12">
            <a href="/katalog" className="inline-flex items-center gap-2 bg-[#8B5E3C] text-white px-8 py-3 rounded-full font-bold hover:bg-[#6D4C41] transition-all shadow-lg hover:shadow-orange-200 hover:scale-105">
                Lihat Koleksi Lengkap <ArrowRight className="w-4 h-4" />
            </a>
            </div>
        </Reveal>
      </div>

      {/* MODAL POPUP */}
      {selectedBook && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="absolute inset-0" onClick={closeModal}></div>
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full overflow-hidden flex flex-col md:flex-row animate-scale-up max-h-[90vh]">
                <button onClick={closeModal} className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white text-gray-500 hover:text-red-500 transition-colors shadow-sm"><X className="w-6 h-6" /></button>
                <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-6 md:p-8">
                    <img src={selectedBook.image} alt={selectedBook.title} className="max-w-full max-h-75 md:max-h-125 object-contain rounded-lg shadow-md" />
                </div>
                
                <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col text-left overflow-y-auto">
                    <div className="flex gap-2 mb-3">
                        {selectedBook.status === 'READY' ? (
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">READY STOCK</span>
                        ) : selectedBook.status === 'PO' ? (
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">PRE-ORDER</span>
                        ) : (
                            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">KATALOG REFERENSI</span>
                        )}
                        <span className="inline-block px-3 py-1 bg-orange-100 text-[#8B5E3C] text-xs font-bold rounded-full">{selectedBook.type}</span>
                        <span className="inline-block px-3 py-1 bg-[#FF9E9E] text-white text-xs font-bold rounded-full">{selectedBook.age}</span>
                    </div>
                    
                    <h3 className="text-2xl md:text-4xl font-bold text-[#8B5E3C] mb-2 leading-tight">{selectedBook.title}</h3>
                    <p className="text-3xl font-bold text-[#FF9E9E] mb-6">Rp {selectedBook.price.toLocaleString('id-ID')}</p>
                    
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
                        <div className="flex items-center gap-2"><BookIcon className="w-4 h-4 text-orange-300" /><span>Spesifikasi: {selectedBook.pages}</span></div>
                        <div className="flex items-start gap-2"><Globe className="w-4 h-4 text-orange-300 mt-1" /><span>{selectedBook.desc || selectedBook.description}</span></div>
                    </div>

                    {selectedBook.previewurl && (
                        <div className="mb-6">
                            <h4 className="font-bold text-[#8B5E3C] mb-2 flex items-center gap-2">
                                <Eye className="w-4 h-4" /> Preview Buku
                            </h4>
                            
                            {isEmbeddable(selectedBook.previewurl) ? (
                                <>
                                    <div className={`relative w-full rounded-xl overflow-hidden shadow-sm border border-orange-100 ${selectedBook.previewurl.includes('instagram') ? 'h-137.5' : 'aspect-video'}`}>
                                        <iframe className="absolute inset-0 w-full h-full" src={getEmbedUrl(selectedBook.previewurl) as string} title="Review Preview" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                    </div>
                                    <a href={selectedBook.previewurl} target="_blank" className="text-xs text-orange-400 hover:text-orange-600 mt-1 inline-block underline">Buka di aplikasi</a>
                                </>
                            ) : (
                                <a 
                                    href={selectedBook.previewurl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-lg shadow-sm">
                                            <BookIcon className="w-6 h-6 text-[#8B5E3C]" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#8B5E3C] text-sm">Lihat Isi Buku (Look Inside)</p>
                                            <p className="text-xs text-orange-400">Preview tersedia di website eksternal</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-[#8B5E3C] transform group-hover:translate-x-1 transition-transform" />
                                </a>
                            )}
                        </div>
                    )}
                    
                    <div className="flex gap-3 mt-auto pt-4">
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
    </section>
  );
};

// --- COMPONENT: FAQ SECTION (ADDED BACK) ---
const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const waLink = "https://wa.me/6282314336969";

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-20 bg-white" id="faq">
            <div className="max-w-3xl mx-auto px-4">
                <Reveal>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#8B5E3C] mb-4">Frequently Asked Questions</h2>
                        <p className="text-[#6D4C41]">Semua hal yang perlu Ayah Bunda tahu tentang pemesanan buku</p>
                    </div>
                </Reveal>

                <div className="space-y-4">
                    {faqData.map((item, idx) => (
                        <Reveal key={idx} delay={idx * 100}>
                            <div className={`border rounded-2xl transition-all duration-300 ${openIndex === idx ? 'border-[#FF9E9E] bg-orange-50/30' : 'border-orange-100 bg-white'}`}>
                                <button 
                                    onClick={() => toggleFAQ(idx)}
                                    className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                                >
                                    <span className={`font-bold text-lg ${openIndex === idx ? 'text-[#FF9E9E]' : 'text-[#8B5E3C]'}`}>
                                        {item.question}
                                    </span>
                                    {openIndex === idx ? <ChevronUp className="w-5 h-5 text-[#FF9E9E]" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </button>
                                
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="p-5 pt-0 text-[#6D4C41] leading-relaxed text-sm md:text-base border-t border-dashed border-orange-100 mt-2">
                                        {item.answer}
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>

                <Reveal delay={600}>
                    <div className="mt-12 text-center bg-[#FFF9F0] p-8 rounded-3xl border border-dashed border-orange-200">
                        <p className="text-[#8B5E3C] font-bold mb-3 text-lg">Masih ada pertanyaan yang belum terjawab?</p>
                        <a href={waLink} target="_blank" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold hover:bg-[#128C7E] transition-all shadow-md hover:shadow-lg hover:-translate-y-1">
                            <MessageCircle className="w-5 h-5" /> Hubungi Admin via WhatsApp
                        </a>
                    </div>
                </Reveal>
            </div>
        </section>
    );
};

// --- COMPONENT: FOOTER (REDESAINED: 2 COLS) ---
const Footer = () => {
  const igLink = "https://www.instagram.com/akinarabooks/";
  return (
    <footer className="bg-[#8B5E3C] text-[#FFF9F0] pt-16 pb-8 rounded-t-[3rem] -mt-8 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          
          <Reveal>
            <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span className="bg-[#FFF9F0] text-[#8B5E3C] px-2 py-0.5 rounded text-lg">A</span> Akinara Books
                </h3>
                <p className="text-orange-100/80 leading-relaxed mb-6">
                    Toko buku anak pilihan yang menghadirkan cerita-cerita penuh makna untuk menemani tumbuh kembang si kecil.
                </p>
                <div className="flex gap-4">
                    <a href={igLink} target="_blank" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors hover:scale-110">
                        <Instagram className="w-5 h-5" />
                    </a>
                    <a href="https://shopee.co.id/akinarabooks" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors hover:scale-110">
                        <ShoppingBag className="w-5 h-5" />
                    </a>
                </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="md:text-right">
                <h4 className="font-bold text-lg mb-4 text-orange-200">Lokasi Kami</h4>
                <div className="flex flex-col md:items-end gap-3 text-orange-100/90">
                    <div className="flex items-start gap-3 md:flex-row-reverse">
                        <MapPin className="w-5 h-5 text-orange-300 mt-1 shrink-0" />
                        <span>Maguwoharjo, Yogyakarta<br/></span>
                    </div>
                </div>
            </div>
          </Reveal>

        </div>
        <div className="border-t border-white/10 pt-8 text-center text-orange-200/60 text-sm">
            <p>© 2026 Akinara Books & Library</p>
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
      <POInfoBanner />
      <Features />
      <CatalogPreview />
      <FAQSection /> 
      <Footer />
    </div>
  );
}