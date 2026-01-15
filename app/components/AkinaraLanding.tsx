'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Instagram, MessageCircle, ShoppingBag, Star, Truck, Heart, Menu, X, ArrowRight, MapPin, Mail, Book, User, Globe, Building2, PlayCircle, Eye, Calendar, Clock, Info, ChevronDown, ChevronUp, HelpCircle, EarthIcon, Bookmark, CreditCard, Package } from 'lucide-react';

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

// --- HELPER: WA MESSAGE GENERATOR ---
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
                Silakan klik tombol pemesanan di katalog, Anda akan terhubung langsung ke WhatsApp Admin kami. Untuk buku <strong className="font-bold">Ready Stock</strong>, pembayaran dilakukan secara penuh. Untuk <strong className="font-bold">Pre-Order (PO)</strong>, Anda cukup membayar DP sebesar 50% di awal, dan pelunasan dilakukan saat buku sudah tiba di Indonesia.
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

// --- DATA BUKU ---
const booksData = [
    { 
        id: 1, 
        title: "Ushborne: Pull-back Busy Train Book", 
        price: "Rp 125.000", 
        type: "Board Book", 
        age: "0-2 Thn",
        status: "PO", 
        eta: "Akhir Feb 2026", 
        publisher: "Usborne Publishing",
        author: "Fiona Watt",
        pages: "10 Halaman",
        desc: "Buku interaktif yang sangat seru! Dilengkapi dengan mainan kereta api.",
        image: "https://usborne.com/media/catalog/product/cache/577949ba73ecbe39f04bc3cd25e7620e/9/7/9781409550341_cover_image.jpg",
        previewurl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
    },
    { 
        id: 2, 
        title: "Dear Zoo", 
        price: "Rp 65.000", 
        type: "Lift-the-Flap",
        age: "0-2 Thn",
        status: "READY", 
        eta: "Siap Kirim", 
        publisher: "Macmillan Children's",
        author: "Rod Campbell",
        pages: "18 Halaman",
        desc: "Buku klasik kesayangan jutaan anak di dunia.",
        image: "https://m.media-amazon.com/images/I/71PcexlBwQL._SL1440_.jpg",
        previewurl: "https://www.instagram.com/reel/DCEwwKPiY-H/"
    },
    { 
        id: 6, 
        title: "The Encyclopedia of Dinosaurs", 
        price: "Rp 250.000", 
        type: "Hardcover", 
        age: "6+ Thn", 
        status: "REFERENSI", 
        eta: "Hubungi Admin",
        publisher: "Hermes House",
        author: "Dougal Dixon",
        pages: "120 Halaman",
        desc: "Ensiklopedia lengkap tentang dinosaurus dengan ilustrasi memukau.",
        image: "https://m.media-amazon.com/images/I/81yq0v2r3sL._SL1500_.jpg",
        previewurl: ""
    },
    { 
        id: 4, 
        title: "Quantum Entanglement for Babies",
        price: "Rp 96.000",
        type: "Board Book",
        age: "0-2 Thn",
        status: "READY",
        eta: "Siap Kirim",
        publisher: "Sourcebooks Jabberwocky",
        author: "Chris Ferrie",
        pages: "24 Halaman",
        desc: "Buku sains untuk bayi.",
        image: "https://m.media-amazon.com/images/I/81JJlf4IfxL._AC_UF1000,1000_QL80_.jpg",
        previewurl: ""
    },
];

// --- COMPONENT: PO INFO BANNER (SLIM VERSION) ---
const POInfoBanner = () => {
    const [showRules, setShowRules] = useState(false);
    const [daysLeft, setDaysLeft] = useState(0);

    useEffect(() => {
        const targetDate = new Date('2026-01-30T23:59:59').getTime();
        const now = new Date().getTime();
        const difference = targetDate - now;
        const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
        setDaysLeft(days > 0 ? days : 0);
    }, []);

    const waLink = "https://wa.me/6282314336969?text=Halo%20Akinara%21%20Saya%20ingin%20tanya%20dan%20pesan%20buku%20PO%20Flying%20Eye%20Books...";

    return (
        <div className="bg-[#FFF9F0] py-6 border-b border-orange-100 font-sans">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-[1.8rem] p-6 md:p-7 shadow-sm border border-orange-200 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
                    
                    <div className="flex-1 relative z-10 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <span className="flex items-center gap-1 px-2.5 py-0.5 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-wider border border-green-100">
                                <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                                Ongoing Batch
                            </span>
                            {daysLeft > 0 && (
                                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-red-50 text-red-500 rounded-full text-[9px] font-black uppercase tracking-wider border border-red-100">
                                    <Clock className="w-2.5 h-2.5"/> {daysLeft} Hari Lagi
                                </span>
                            )}
                        </div>

                        <h3 className="text-2xl md:text-2xl font-black text-[#8B5E3C] leading-tight tracking-tighter">
                            Open PO: <span className="text-[#FF9E9E]">Flying Eye Books Publisher</span>
                        </h3>
                        
                        {/* Jarak mt-3 agar lebih rapat */}
                        <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-4 text-[13px] text-[#6D4C41] font-bold">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-orange-400"/> 
                                <span>Tutup: <strong className="text-[#8B5E3C]">30 Jan</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-orange-400"/> 
                                <span>ETA Indo: <strong className="text-[#8B5E3C]">Akhir Feb</strong></span>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setShowRules(true)}
                        className="w-full md:w-auto px-6 py-3.5 bg-[#8B5E3C] text-white rounded-2xl font-black text-xs hover:bg-[#6D4C41] transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                    >
                        <Info className="w-4 h-4" /> CARA ORDER
                    </button>
                </div>
            </div>

{/* Modal Detail & Cara Order */}
            {showRules && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#8B5E3C]/20 backdrop-blur-md animate-fade-in text-sm">
                    <div className="absolute inset-0" onClick={() => setShowRules(false)}></div>
                    <div className="relative bg-white rounded-[3rem] shadow-2xl max-w-xl w-full p-8 md:p-12 animate-scale-up max-h-[90vh] overflow-y-auto">
                        
                        <button onClick={() => setShowRules(false)} className="absolute top-8 right-8 text-gray-300 hover:text-red-500 transition-colors">
                            <X className="w-6 h-6"/>
                        </button>
                        
                        <div className="text-center mb-10">
                            <h3 className="text-2xl font-black text-[#8B5E3C] uppercase tracking-tighter">Order Journey</h3>
                            <p className="text-orange-400 font-bold text-xs uppercase tracking-widest mt-1">Langkah mudah pesan buku impianmu</p>
                        </div>
                        
                        {/* ALUR ORDER STEPS */}
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
                                <span className="absolute left-0 top-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-black text-xs z-10 border-4 border-white shadow-sm animate-pulse">3</span>
                                <p className="font-black text-orange-600 text-base">Submit & DP 50%</p>
                                <p className="text-slate-600 font-bold leading-relaxed mt-1 bg-orange-50 p-3 rounded-xl border border-orange-100">
                                    Pembayaran DP dilakukan SETELAH kami men-submit orderan ke penerbit untuk memastikan slot bukumu aman.
                                </p>
                            </div>

                            <div className="relative pl-12">
                                <span className="absolute left-0 top-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-[#8B5E3C] font-black text-xs z-10 border-4 border-white shadow-sm">4</span>
                                <p className="font-black text-[#8B5E3C] text-base">Buku Tiba & Pelunasan</p>
                                <p className="text-slate-500 leading-relaxed mt-1">Saat buku mendarat di gudang Akinara Jogja, admin akan mengirimkan invoice pelunasan.</p>
                            </div>

                            <div className="relative pl-12">
                                <span className="absolute left-0 top-0 w-8 h-8 bg-[#FF9E9E] rounded-full flex items-center justify-center text-white font-black text-xs z-10 border-4 border-white shadow-sm">5</span>
                                <p className="font-black text-[#8B5E3C] text-base">Siap Meluncur ke Rumah!</p>
                                <p className="text-slate-500 leading-relaxed mt-1 font-medium">Buku dikemas dengan rapi dan aman untuk dikirim ke alamatmu.</p>
                            </div>
                        </div>

                        {/* TOMBOL WA LANGSUNG */}
                        <div className="mt-12 space-y-4">
                            <a 
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-5 bg-[#25D366] hover:bg-[#1ebd5a] text-white rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
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
// --- COMPONENT: FAQ SECTION ---
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

                {/* FAQ CTA (BARU) */}
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

// --- MAIN COMPONENTS ---

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

// --- HERO (REVISI SPACING LEBIH RAPAT) ---
const Hero = () => {
  return (
    // UBAH 1: pb-16 jadi pb-8, dan lg:pb-32 jadi lg:pb-16 (Padding bawah dikurangi drastis)
    <section className="relative pt-32 pb-8 lg:pt-48 lg:pb-16 overflow-hidden bg-[#FFF9F0]">
      <div className="absolute top-0 right-0 w-125 h-125 bg-[#E6E6FA] rounded-full blur-[100px] opacity-60 -translate-y-1/2 translate-x-1/4 animate-pulse duration-5000"></div>
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-[#FFDFC4] rounded-full blur-[80px] opacity-50 translate-y-1/4 -translate-x-1/4 animate-pulse duration-7000"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <Reveal>
            <div className="inline-block mb-6 px-4 py-1.5 bg-white border border-orange-100 rounded-full shadow-sm hover:scale-105 transition-transform cursor-default">
            <span className="text-[#8B5E3C] text-sm font-semibold">✨ Toko Buku Anak Import & Lokal Terkurasi</span>
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
                <h1 className="text-5xl md:text-7xl font-extrabold text-[#8B5E3C] mb-6 leading-tight relative z-10">
                    Buka Buku, <br />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-[#FF9E9E] to-[#9D84B7]">
                        Buka Imajinasi.
                    </span>
                </h1>
            </div>
        </Reveal>
        
        <Reveal delay={400}>
    {/* mb-0 karena button di bawah sudah dihapus */}
    <p className="text-lg md:text-xl text-[#6D4C41] mb-0 max-w-4xl mx-auto leading-relaxed">
        {/* REVISI COPYWRITING */}
        Mendampingi masa emas si kecil dengan literasi berkualitas. 
        <br className="hidden md:block" />
        Bantu mereka mencintai membaca, belajar, dan bereksplorasi sejak dini.
    </p>
</Reveal>
      </div>
    </section>
  );
};

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

const CatalogPreview = () => {
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const closeModal = () => setSelectedBook(null);
  const isInstagram = (url: string) => url && url.includes('instagram.com');

  return (
    <section className="py-20 bg-linear-to-b from-white to-[#FFF9F0]" id="katalog">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex flex-col items-center gap-3 mb-12">
            <Reveal><span className="inline-block px-4 py-1.5 bg-[#FF9E9E] text-white rounded-full text-sm font-bold tracking-wide shadow-sm mb-2">KOLEKSI TERBAIK</span></Reveal>
            <Reveal delay={200}><h2 className="text-3xl md:text-5xl font-extrabold text-[#8B5E3C] mb-2">Buku Pilihan Untuk Si Kecil</h2></Reveal>
            <Reveal delay={300}><p className="text-[#6D4C41] text-sm md:text-base font-medium max-w-4xl mx-auto">Jelajahi koleksi buku anak terbaik kami yang penuh warna dan cerita menarik</p></Reveal>
        </div>
        
        {/* Grid Buku */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {booksData.map((book, idx) => (
            <Reveal key={book.id} delay={idx * 150}>
                <div onClick={() => setSelectedBook(book)} className="group relative bg-white p-3 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                <div className="aspect-3/4 rounded-xl overflow-hidden mb-4 relative bg-gray-100">
                    <img src={book.image} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    
                    {/* STATUS BADGE (3 VARIAN) */}
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
                <p className="text-[#FF9E9E] font-bold text-lg text-left">{book.price}</p>
                </div>
            </Reveal>
          ))}
        </div>

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
                        {/* BADGE DI MODAL */}
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
                    <p className="text-3xl font-bold text-[#FF9E9E] mb-6">{selectedBook.price}</p>
                    
                    {/* INFO BOX STATUS */}
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
                            <div className={`relative w-full rounded-xl overflow-hidden shadow-sm border border-orange-100 ${isInstagram(selectedBook.previewurl) ? 'h-137.5' : 'aspect-video'}`}>
                                <iframe className="absolute inset-0 w-full h-full" src={getEmbedUrl(selectedBook.previewurl) as string} title="Review Preview" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
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
          
          {/* KOLOM 1: Brand & Social */}
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

          {/* KOLOM 2: Lokasi (Rata Kanan di Desktop) */}
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