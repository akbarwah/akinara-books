'use client';

import { SpeedInsights } from "@vercel/speed-insights/next"
import React, { useState, useEffect, useRef } from 'react';
import { 
  Instagram, MessageCircle, ShoppingBag, Star, Truck, Heart, Menu, X, 
  ArrowRight, MapPin, Mail, Book as BookIcon, User, Globe, Building2, 
  PlayCircle, Eye, Calendar, Clock, Info, ChevronDown, ChevronUp, 
  HelpCircle, EarthIcon, Bookmark, CreditCard, Package, Flame, Zap, Hourglass,
  Trash2, Plus, Minus, ShoppingCart, AlertCircle 
} from 'lucide-react';
import { supabase } from '@/supabaseClient'; 
import { useCart } from '../context/CartContext'; 

// IMPORT BARU: MiniCatalog
import MiniCatalog from './MiniCatalog'; 

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

// --- KOMPONEN CART DRAWER (Tetap di sini sebagai Global) ---
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
                            <p className="text-sm font-bold text-yellow-800">Order Campuran</p>
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
                                <div className={`absolute top-0 right-0 rounded-bl-xl rounded-tr-xl px-2 py-0.5 text-[8px] font-bold text-white ${item.status === 'READY' ? 'bg-green-500' : 'bg-blue-500'}`}>
                                    {item.status}
                                </div>
                                <div className="w-20 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between pt-2">
                                    <div>
                                        <h4 className="font-bold text-[#8B5E3C] line-clamp-1 text-sm">{item.title}</h4>
                                        <p className="text-xs text-orange-400 font-bold mt-1">
                                            Rp {item.price.toLocaleString('id-ID')}
                                        </p>
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
                            <span className="text-xl font-black text-[#8B5E3C]">
                                Rp {getCartTotal().toLocaleString('id-ID')}
                            </span>
                        </div>
                        <button onClick={checkoutToWhatsApp} className="w-full py-4 bg-[#25D366] hover:bg-[#1ebd5a] text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95">
                            <MessageCircle className="w-5 h-5" /> Checkout via WhatsApp
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- DATA FAQ ---
const faqData = [
    {
        question: "Apa bedanya status Ready Stock, Pre-Order, dan Backlist?",
        answer: (
            <>
                <strong className="font-bold">Ready Stock</strong> artinya buku tersedia di gudang kami dan supplier (Yogyakarta/Surabaya), siap kirim. <strong className="font-bold">Pre-Order (PO)</strong> adalah buku yang sedang dalam masa pemesanan baik impor/lokal, estimasi waktu tunggu sekitar 8-12 minggu. <strong className="font-bold">Backlist</strong> merupakan list buku yang pernah kami jual di masa Pre-Order, namun saat ini belum dibuka kembali batch PO-nya.
            </>
        )
    },
    {
        question: "Bagaimana alur pemesanan dan pembayarannya?",
        answer: (
            <>
                Silakan klik tombol pemesanan di katalog untuk terhubung ke WhatsApp Admin. Untuk <strong className="font-bold">Ready Stock</strong>, pembayaran dilakukan secara penuh. Untuk <strong className="font-bold">Pre-Order (PO)</strong>, cukup DP 25% saat masa PO ditutup. Pelunasan dilakukan saat buku tiba di Indonesia (Bea Cukai/Gudang Importir). Setelah lunas, buku disortir dan dikirim ke gudang kami sebelum dikirim ke alamat Anda.
            </>
        )
    },
    {
        question: "Kenapa buku impor (PO) membutuhkan waktu yang lama sekali?",
        answer: "Karena sebagian besar buku diimpor dari penerbit Inggris, US, dan Australia menggunakan kargo laut (sea freight). Faktor eksternal seperti red line bea cukai, cuaca, atau konsolidasi warehouse juga memengaruhi kecepatan waktu tempuh."
    },
    {
        question: "Apakah buku Ready Stock bisa digabung ongkir dengan buku PO?",
        answer: (
            <>
                <strong className="font-bold">Bisa</strong>, jika estimasi kedatangan buku PO sudah dekat (1–2 minggu). Waktu keep maksimal 1 bulan (Sumatra, Jawa, Bali) dan 2 bulan (Kalimantan, Sulawesi, dll). Buku yang di-keep <strong className="font-bold">wajib lunas</strong> untuk menghindari risiko kerusakan atau hal di luar kendali.
            </>
        )
    },
    {
        question: "Bagaimana cara agar tidak ketinggalan informasi PO buku?",
        answer: (
            <>
                Kami menyarankan Anda untuk bergabung ke{" "}
                <a href="https://chat.whatsapp.com/FhPdtrbBbYY6R6J9afilfC" target="_blank" rel="noopener noreferrer" className="text-[#FF9E9E] font-bold hover:underline">
                    WhatsApp Group Akinarabook
                </a>. 
                Informasi pembukaan dan penutupan PO, promo, flash sale, serta koleksi buku terbaru biasanya dibagikan lebih awal melalui grup tersebut.
            </>
        )
    },
    {
        question: "Apakah ada garansi jika buku datang rusak?",
        answer: "Ya, tentu. Semua buku yang kami jual dijamin Original Publisher. Jika terdapat cacat produksi atau kerusakan akibat pengiriman, silakan kirimkan video unboxing kepada Admin kami. Kami akan membantu proses retur atau pengembalian dana sesuai ketentuan."
    }
];

// --- COMPONENT: PO INFO BANNER ---
const POInfoBanner = () => {
    const [daysLeft, setDaysLeft] = useState(0);
    const [isExpired, setIsExpired] = useState(false);
    const TARGET_DATE_STR = '2026-01-20T23:59:59'; 
    const formattedDate = new Date(TARGET_DATE_STR).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

    useEffect(() => {
        const targetDate = new Date(TARGET_DATE_STR).getTime();
        const now = new Date().getTime();
        const difference = targetDate - now;
        
        if (difference < 0) {
            setIsExpired(true);
            setDaysLeft(0);
        } else {
            setIsExpired(false);
            const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
            setDaysLeft(days);
        }
    }, []);

    const waitlistLink = "https://wa.me/6282314336969?text=Halo%20Admin%20Akinara%2C%20saya%20terlambat%20ikut%20PO%20Flying%20Eye%20Books.%20Apakah%20masih%20bisa%20pesan%20atau%20saya%20boleh%20gabung%20Waitlist%20jika%20ada%20slot%20sisa%3F";
    
    return (
        <div className="bg-[#FFF9F0] py-8 border-b border-orange-100 font-sans relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className={`absolute top-[-50%] left-[-10%] w-96 h-96 rounded-full blur-3xl animate-pulse ${isExpired ? 'bg-orange-100/30' : 'bg-orange-200/20'}`}></div>
                <div className="absolute bottom-[-50%] right-[-10%] w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 relative z-10">
                <div className={`group backdrop-blur-sm rounded-[2rem] p-6 md:p-8 shadow-lg border transition-all duration-500 ease-out hover:-translate-y-1 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden ${isExpired ? 'bg-white/60 border-slate-200' : 'bg-white/80 border-orange-100 hover:shadow-[0_20px_40px_-15px_rgba(255,158,158,0.3)] hover:border-orange-300'}`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out pointer-events-none rounded-[2rem]"></div>
                    <div className="flex-1 relative z-10 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                            {isExpired ? (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200 shadow-sm">
                                    <span className="relative flex h-2 w-2"><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span> Order Submitted
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200 shadow-sm group-hover:bg-green-100 transition-colors">
                                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span> Ongoing Batch
                                </span>
                            )}
                            {!isExpired && daysLeft > 0 && (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-200 shadow-sm group-hover:bg-red-100 transition-colors">
                                    <Clock className="w-3 h-3 animate-pulse"/> {daysLeft} Hari Lagi
                                </span>
                            )}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-[#8B5E3C] leading-tight tracking-wide mb-2">
                            {isExpired ? "Batch Closed: " : "Open PO: "}
                            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isExpired ? 'from-[#8B5E3C] to-[#6D4C41]' : 'from-[#FF9E9E] to-[#FF7043] group-hover:to-[#FF5722]'} transition-all`}>
                                Flying Eye Books
                            </span>
                        </h3>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs md:text-sm text-[#6D4C41] font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                            {!isExpired && (
                                <div className="flex items-center gap-2 bg-orange-50/50 px-3 py-1.5 rounded-lg border border-orange-100/50">
                                    <Calendar className="w-4 h-4 text-orange-400"/> 
                                    <span>Tutup: <strong className="text-[#8B5E3C]">{formattedDate}</strong></span>
                                </div>
                            )}
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isExpired ? 'bg-blue-50/50 border-blue-100/50' : 'bg-orange-50/50 border-orange-100/50'}`}>
                                <Truck className={`w-4 h-4 ${isExpired ? 'text-blue-400' : 'text-orange-400'}`}/> 
                                <span>ETA Indo: <strong className="text-[#8B5E3C]">Mei-Juni 2026</strong></span>
                            </div>
                        </div>
                    </div>
                    {isExpired && (
                        <a href={waitlistLink} target="_blank" rel="noopener noreferrer" className="relative overflow-hidden w-full md:w-auto px-8 py-4 bg-slate-600 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-slate-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                            <span className="relative z-10 flex items-center gap-2"><Bookmark className="w-4 h-4" /> GABUNG WAITLIST</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: NAVBAR ---
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { getCartCount, setIsCartOpen } = useCart();

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
            
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-[#8B5E3C] hover:text-[#FF9E9E] transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {getCartCount() > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {getCartCount()}
                    </span>
                )}
            </button>

            <a href="https://shopee.co.id/akinarabooks" target="_blank" className="bg-[#FF9E9E] hover:bg-[#ff8585] text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 hover:-translate-y-0.5 transform duration-200">
              <ShoppingBag className="w-4 h-4" /> Shopee
            </a>
          </div>
          <div className="md:hidden flex items-center gap-4">
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-[#8B5E3C]">
                <ShoppingCart className="w-6 h-6" />
                {getCartCount() > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{getCartCount()}</span>}
            </button>
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

// --- COMPONENT: HERO ---
const Hero = () => {
  return (
    <section className="relative pt-28 pb-8 lg:pt-36 lg:pb-10 overflow-hidden bg-[#FFF9F0]">
      <div className="absolute top-0 right-0 w-125 h-125 bg-[#E6E6FA] rounded-full blur-[100px] opacity-60 -translate-y-1/2 translate-x-1/4 animate-pulse duration-5000"></div>
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-[#FFDFC4] rounded-full blur-[80px] opacity-50 translate-y-1/4 -translate-x-1/4 animate-pulse duration-7000"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <Reveal>
            <div className="inline-block mb-4 px-4 py-1.5 bg-white border border-orange-100 rounded-full shadow-sm hover:scale-105 transition-transform cursor-default">
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
                <h1 className="text-5xl md:text-7xl font-extrabold text-[#8B5E3C] mb-4 leading-tight relative z-10">
                    Great Minds Start <br />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-[#FF9E9E] to-[#9D84B7]">
                        Between the Pages
                    </span>
                </h1>
            </div>
        </Reveal>
        
        <Reveal delay={400}>
            <p className="text-lg md:text-xl text-[#6D4C41] mb-0 max-w-4xl mx-auto leading-relaxed">
                Explore our handpicked collection of extraordinary books, chosen to be the perfect companions for your little explorer’s first steps into the magic of reading.
            </p>
        </Reveal>
      </div>
    </section>
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

// --- COMPONENT: FAQ SECTION ---
const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const toggleFAQ = (index: number) => { setOpenIndex(openIndex === index ? null : index); };

    return (
        <section className="py-20 bg-white" id="faq">
            <div className="max-w-3xl mx-auto px-4">
                <Reveal>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#8B5E3C] mb-4">Frequently Asked Questions</h2>
                        <p className="text-[#6D4C41]">Informasi lengkap seputar pemesanan dan pengiriman buku</p>
                    </div>
                </Reveal>
                <div className="space-y-4">
                    {faqData.map((item, idx) => (
                        <Reveal key={idx} delay={idx * 100}>
                            <div className={`border rounded-2xl transition-all duration-300 ${openIndex === idx ? 'border-[#FF9E9E] bg-orange-50/30' : 'border-orange-100 bg-white'}`}>
                                <button onClick={() => toggleFAQ(idx)} className="w-full flex items-center justify-between p-5 text-left focus:outline-none">
                                    <span className={`font-bold text-lg ${openIndex === idx ? 'text-[#FF9E9E]' : 'text-[#8B5E3C]'}`}>{item.question}</span>
                                    {openIndex === idx ? <ChevronUp className="w-5 h-5 text-[#FF9E9E]" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === idx ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="p-5 pt-0 text-[#6D4C41] leading-relaxed text-sm md:text-base border-t border-dashed border-orange-100 mt-2">{item.answer}</div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
                <Reveal delay={600}>
                    <div className="mt-12 text-center bg-[#FFF9F0] p-8 rounded-3xl border border-dashed border-orange-200">
                        <p className="text-[#8B5E3C] font-bold mb-3 text-lg">Masih ada pertanyaan yang belum terjawab?</p>
                        <a href="https://wa.me/6282314336969" target="_blank" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold hover:bg-[#128C7E] transition-all shadow-md hover:shadow-lg hover:-translate-y-1"><MessageCircle className="w-5 h-5" /> Hubungi Admin via WhatsApp</a>
                    </div>
                </Reveal>
            </div>
        </section>
    );
};

// --- COMPONENT: FOOTER ---
const Footer = () => {
  const igLink = "https://www.instagram.com/akinarabooks/";
  return (
    <footer className="bg-[#8B5E3C] text-[#FFF9F0] pt-16 pb-8 rounded-t-[3rem] -mt-8 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <Reveal>
            <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><span className="bg-[#FFF9F0] text-[#8B5E3C] px-2 py-0.5 rounded text-lg">A</span> Akinara Books</h3>
                <p className="text-orange-100/80 leading-relaxed mb-6">Toko buku anak pilihan yang menghadirkan cerita-cerita penuh makna untuk menemani tumbuh kembang si kecil.</p>
                <div className="flex gap-4">
                    <a href={igLink} target="_blank" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors hover:scale-110"><Instagram className="w-5 h-5" /></a>
                    <a href="https://shopee.co.id/akinarabooks" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors hover:scale-110"><ShoppingBag className="w-5 h-5" /></a>
                </div>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="md:text-right">
                <h4 className="font-bold text-lg mb-4 text-orange-200">Lokasi Kami</h4>
                <div className="flex flex-col md:items-end gap-3 text-orange-100/90">
                    <div className="flex items-start gap-3 md:flex-row-reverse"><MapPin className="w-5 h-5 text-orange-300 mt-1 shrink-0" /><span>Maguwoharjo, Yogyakarta<br/></span></div>
                </div>
            </div>
          </Reveal>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-orange-200/60 text-sm"><p>© 2026 Akinara Books & Library</p></div>
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
      
      {/* INI DIA PERUBAHAN UTAMANYA: CUKUP PANGGIL 1 BARIS */}
      <MiniCatalog />
      
      <FAQSection /> 
      <Footer />
      <CartDrawer />
    </div>
  );
}