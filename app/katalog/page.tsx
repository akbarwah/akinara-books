'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Filter, Search, ArrowLeft, X, User, Book, Globe, Building2, MessageCircle, Eye, Truck, Clock, Bookmark } from 'lucide-react';
import Link from 'next/link';

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
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- HELPER: SMART EMBED URL ---
const getEmbedUrl = (url: string) => {
    if (!url) return null;

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('youtu.be')) {
            videoId = url.split('/').pop()?.split('?')[0] || '';
        } else if (url.includes('watch?v=')) {
            videoId = url.split('v=')[1]?.split('&')[0] || '';
        } else if (url.includes('/embed/')) {
            return url;
        }
        return `https://www.youtube.com/embed/${videoId}`;
    }

    if (url.includes('instagram.com')) {
        let cleanUrl = url.split('?')[0]; 
        if (cleanUrl.endsWith('/')) {
            cleanUrl = cleanUrl.slice(0, -1);
        }
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
        // Status REFERENSI
        text = `Halo Admin, saya tertarik dengan buku *${book.title}*. Apakah buku ini akan ada di Batch PO berikutnya?`;
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

// --- DATA BUKU LENGKAP (152 BUKU) ---
const allBooks = [
  { id: 1, title: "Ushborne: Pull-back Busy Train Book", price: 125000, type: "Board Book", age: "0-2 Thn", status: "PO", eta: "Akhir Feb 2026", category: "Impor", publisher: "Usborne Publishing", author: "Fiona Watt", pages: "10 Halaman", desc: "Buku interaktif yang sangat seru! Dilengkapi dengan mainan kereta api yang bisa ditarik mundur (pull-back).", image: "https://usborne.com/media/catalog/product/cache/577949ba73ecbe39f04bc3cd25e7620e/9/7/9781409550341_cover_image.jpg", previewurl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  { id: 2, title: "Dear Zoo", price: 65000, type: "Lift-the-Flap", age: "0-2 Thn", status: "READY", eta: "Siap Kirim", category: "Impor", publisher: "Macmillan Children's", author: "Rod Campbell", pages: "18 Halaman", desc: "Buku klasik kesayangan jutaan anak di dunia. Bercerita tentang anak yang meminta hewan peliharaan.", image: "https://m.media-amazon.com/images/I/71PcexlBwQL._SL1440_.jpg", previewurl: "https://www.instagram.com/reel/DCEwwKPiY-H/?igsh=ZXAzdG5qYzY2dDI1" },
  { id: 3, title: "The Pout-Pout Fish", price: 95000, type: "Hardcover", age: "3-5 Thn", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Farrar Straus Giroux", author: "Deborah Diesen", pages: "32 Halaman", desc: "Kisah ikan yang selalu cemberut dan menyebarkan kesedihan. Sampai akhirnya ia menemukan senyum.", image: "https://mpd-biblio-covers.imgix.net/9780374360979.jpg", previewurl: "https://www.instagram.com/p/DR3WbEPjJBs/?igsh=c3NiZHBrYXNqb2Jn" },
  { id: 4, title: "Quantum Entanglement for Babies", price: 96000, type: "Board Book", age: "0-2 Thn", status: "READY", eta: "Siap Kirim", category: "Impor", publisher: "Sourcebooks Jabberwocky", author: "Chris Ferrie", pages: "24 Halaman", desc: "Buku sains untuk bayi yang menjelaskan konsep keterikatan kuantum dengan cara yang sederhana.", image: "https://m.media-amazon.com/images/I/81JJlf4IfxL._AC_UF1000,1000_QL80_.jpg", previewurl: "" },
  { id: 5, title: "Siapa yang Kentut?", price: 45000, type: "Picture Book", age: "3-5 Thn", status: "READY", eta: "Siap Kirim", category: "Lokal", publisher: "Minima Pustaka", author: "Noor H. Dee", pages: "24 Halaman", desc: "Buku lucu tentang berbagai hewan dan suara kentut mereka yang menggelitik.", image: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1720623066i/216330686.jpg", previewurl: "" },
  { id: 6, title: "The Encyclopedia of Dinosaurs", price: 250000, type: "Hardcover", age: "6+ Thn", status: "REFERENSI", eta: "Hubungi Admin", category: "Impor", publisher: "Hermes House", author: "Dougal Dixon", pages: "120 Halaman", desc: "Ensiklopedia lengkap tentang dinosaurus dengan ilustrasi memukau.", image: "https://m.media-amazon.com/images/I/81yq0v2r3sL._SL1500_.jpg", previewurl: "" },
  { id: 7, title: "I can Hear Farm Animals", price: 180000, type: "Interactive", age: "0-2 Thn", status: "PO", eta: "Akhir Feb 2026", category: "Impor", publisher: "Lake Press", author: "Roger Priddy", pages: "10 Halaman Suara", desc: "Tekan tombolnya dan dengarkan suara hewan ternak yang lucu.", image: "https://m.media-amazon.com/images/I/91xjfOd5KCL._SL1500_.jpg", previewurl: "" },
  { id: 8, title: "Puasa Pertamaku", price: 56000, type: "Board Book", age: "3-5 Thn", status: "READY", eta: "Siap Kirim", category: "Lokal", publisher: "Dar! Mizan", author: "Iwok Abqar", pages: "12 Halaman", desc: "Buku edukatif yang mengenalkan anak pada konsep puasa dalam Islam dengan cara yang menyenangkan.", image: "https://static.mizanstore.com/d/img/book/cover/rw-589--.jpg", previewurl: "" },
  { id: 9, title: "A Mouse Called Julian", price: 150000, type: "Hardback", age: "3-5 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Joe Todd-Stanton", pages: "40 Halaman", desc: "Julian si tikus penyendiri akhirnya sadar bahwa punya teman makan malam itu ternyata menyenangkan.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 10, title: "A Mouse Called Julian", price: 150000, type: "Paperback", age: "3-5 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Joe Todd-Stanton", pages: "40 Halaman", desc: "Julian si tikus penyendiri akhirnya sadar bahwa punya teman makan malam itu ternyata menyenangkan.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 11, title: "Can I Sleep Here? Baby Dolphin", price: 150000, type: "Hardback", age: "0-3 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Ella Bailey", pages: "24 Halaman", desc: "Bayi lumba-lumba mencari tempat tidur yang aman di lautan luas dan bertemu banyak teman baru.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 12, title: "Can I Sleep Here? Baby Lion", price: 150000, type: "Hardback", age: "0-3 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Ella Bailey", pages: "24 Halaman", desc: "Singa kecil yang mengantuk mencari spot terbaik untuk tidur siang di padang rumput Afrika.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 13, title: "Can I Sleep Here? Baby Monkey", price: 150000, type: "Hardback", age: "0-3 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Ella Bailey", pages: "24 Halaman", desc: "Monyet kecil melompat dari satu pohon ke pohon lain mencari dahan ternyaman untuk tidur.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 14, title: "Can I Sleep Here? Baby Penguin", price: 150000, type: "Hardback", age: "0-3 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Ella Bailey", pages: "24 Halaman", desc: "Petualangan bayi penguin mencari kehangatan di tengah dinginnya es Antartika.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 15, title: "Farah Loves Mangos", price: 150000, type: "Paperback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Sarthak Sinha", pages: "32 Halaman", desc: "Farah sangat suka mangga, tapi ia harus belajar sabar menunggu buah kesukaannya matang di pohon.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 16, title: "Hug Me", price: 150000, type: "Hardback", age: "3-5 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Simona Ciraolo", pages: "32 Halaman", desc: "Kaktus kecil yang kesepian hanya menginginkan satu hal sederhana: sebuah pelukan hangat.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 17, title: "Hug Me", price: 150000, type: "Paperback", age: "3-5 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Simona Ciraolo", pages: "32 Halaman", desc: "Kaktus kecil yang kesepian hanya menginginkan satu hal sederhana: sebuah pelukan hangat.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 18, title: "Imelda and The Goblin King", price: 150000, type: "Paperback", age: "4-7 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Briony May Smith", pages: "32 Halaman", desc: "Imelda harus berani menghadapi Raja Goblin yang nakal untuk menyelamatkan hutan peri.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 19, title: "Leaf", price: 150000, type: "Paperback", age: "4-7 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Sandra Dieckmann", pages: "32 Halaman", desc: "Kisah beruang kutub yang terdampar di hutan dan usahanya untuk kembali pulang ke rumah.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 20, title: "My Dad Used to Be So Cool", price: 150000, type: "Paperback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Keith Negley", pages: "40 Halaman", desc: "Seorang anak yang heran melihat masa lalu ayahnya yang ternyata seorang musisi rock keren.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 21, title: "No Such Thing", price: 150000, type: "Paperback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Ella Bailey", pages: "32 Halaman", desc: "Georgia si gadis pemberani mencari penjelasan logis untuk kejadian aneh di rumahnya.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 22, title: "One Day on Our Blue Plane Ocean", price: 150000, type: "Paperback", age: "4-7 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Ella Bailey", pages: "32 Halaman", desc: "Menjelajahi kehidupan bawah laut dari pagi hingga malam bersama hewan-hewan samudra.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 23, title: "One Day on Our Blue Planet Antarcti", price: 150000, type: "Paperback", age: "4-7 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Ella Bailey", pages: "32 Halaman", desc: "Mengikuti keseharian hewan-hewan kutub bertahan hidup di benua paling dingin di bumi.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 24, title: "One Day on Our Blue Planet Outback", price: 150000, type: "Paperback", age: "4-7 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Ella Bailey", pages: "32 Halaman", desc: "Petualangan seru melihat kanguru dan koala beraktivitas di alam liar Australia.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 25, title: "One Day on Our Blue Planet Savannah", price: 150000, type: "Paperback", age: "4-7 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Ella Bailey", pages: "32 Halaman", desc: "Melihat singa dan jerapah menjalani hari mereka di padang rumput Afrika yang luas.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 26, title: "The Comet", price: 150000, type: "Paperback", age: "4-7 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Joe Todd-Stanton", pages: "40 Halaman", desc: "Nyla pindah rumah dan merasa kesepian, sampai sebuah komet ajaib membawanya berpetualang.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 27, title: "The Good Night Airport", price: 150000, type: "Paperback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Tori Kosara", pages: "32 Halaman", desc: "Mengucapkan selamat tidur pada pesawat-pesawat yang lelah setelah seharian terbang.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 28, title: "The Good Night Garage", price: 150000, type: "Paperback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Tori Kosara", pages: "32 Halaman", desc: "Saatnya mobil, truk, dan bus masuk ke garasi untuk beristirahat setelah bekerja keras.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 29, title: "The Planet in a Pickle Jar", price: 150000, type: "Paperback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Martin Stanev", pages: "32 Halaman", desc: "Dua cucu yang heran dengan nenek mereka yang suka menyimpan keajaiban alam di dalam toples.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 30, title: "The Secret of Black Rock", price: 150000, type: "Paperback", age: "4-7 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Joe Todd-Stanton", pages: "32 Halaman", desc: "Erin nekat menyelinap ke kapal ibunya untuk membuktikan mitos batu hitam itu tidak berbahaya.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 31, title: "When Im Big", price: 150000, type: "Paperback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Ella Bailey", pages: "32 Halaman", desc: "Dinosaurus kecil yang tidak sabar ingin cepat besar agar bisa melakukan hal-hal hebat.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 32, title: "Wild", price: 150000, type: "Paperback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Emily Hughes", pages: "32 Halaman", desc: "Gadis kecil yang dibesarkan oleh alam liar merasa aneh saat harus tinggal di kota manusia.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 33, title: "Wrong Time Rooster", price: 150000, type: "Paperback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Michael Parkin", pages: "32 Halaman", desc: "Ayam jago yang selalu salah waktu berkokok, membuat seluruh peternakan jadi kacau balau.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 34, title: "Arthur and the Golden Rope", price: 160000, type: "Paperback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Joe Todd-Stanton", pages: "56 Halaman", desc: "Arthur yang kecil harus menolong dewa Thor dengan mencari tali emas ajaib yang legendaris.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 35, title: "Baby Kraken", price: 160000, type: "Paperback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Ani Manzanas", pages: "32 Halaman", desc: "Bayi Kraken yang dikira monster menyeramkan padahal ia hanya ingin bermain dengan teman.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 36, title: "Bonkers About Beetles", price: 160000, type: "Paperback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Owen Davey", pages: "40 Halaman", desc: "Fakta-fakta menakjubkan tentang ribuan jenis kumbang dengan ilustrasi yang sangat indah.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 37, title: "Crazy About Cats", price: 160000, type: "Paperback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Owen Davey", pages: "40 Halaman", desc: "Ensiklopedia visual tentang kucing-kucing liar dari seluruh dunia, dari macan hingga kucing hutan.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 38, title: "Fantasy Sports 1 The Court of Souls", price: 160000, type: "Paperback", age: "8-12 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Sam Bosma", pages: "56 Halaman", desc: "Komik seru tentang penyihir muda yang harus memenangkan pertandingan basket melawan mumi.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 39, title: "Fantasy Sports 2 The Bandit of Barb", price: 160000, type: "Paperback", age: "8-12 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Sam Bosma", pages: "64 Halaman", desc: "Lanjutan turnamen olahraga magis, kali ini bola voli melawan bandit di pantai misterius.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 40, title: "Fantasy Sports No 3 The Green King", price: 160000, type: "Paperback", age: "8-12 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Sam Bosma", pages: "64 Halaman", desc: "Babak final olahraga fantasi, golf mini melawan Raja Hijau raksasa di lapangan berbahaya.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 41, title: "Guess Who? In the Jungle", price: 160000, type: "Hardback", age: "2-5 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Owen Davey", pages: "10 Halaman", desc: "Buku tebak-tebakan seru untuk balita, mencari siapa hewan yang bersembunyi di balik hutan.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 42, title: "Guess Who? In the Ocean", price: 160000, type: "Hardback", age: "2-5 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Owen Davey", pages: "10 Halaman", desc: "Buku interaktif mengenalkan hewan laut dengan cara menebak siapa yang ada di balik ombak.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 43, title: "Hilda and The Bird Parade", price: 160000, type: "Paperback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Luke Pearson", pages: "44 Halaman", desc: "Hilda menyelamatkan burung gagak yang terluka dan terseret dalam parade festival kota.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 44, title: "Hilda and The Black Hound", price: 160000, type: "Paperback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Luke Pearson", pages: "64 Halaman", desc: "Hilda menyelidiki misteri anjing hitam raksasa yang meneror kota Trolberg.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 45, title: "Hilda and The Midnight Giant", price: 160000, type: "Paperback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Luke Pearson", pages: "44 Halaman", desc: "Hilda mencoba mencari tahu kenapa raksasa-raksasa misterius muncul di rumahnya tiap malam.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 46, title: "Hilda and The Mountain King", price: 160000, type: "Paperback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Luke Pearson", pages: "80 Halaman", desc: "Puncak petualangan Hilda yang terbangun sebagai troll dan harus mendamaikan dua dunia.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 47, title: "Hilda and The Troll", price: 160000, type: "Paperback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Luke Pearson", pages: "40 Halaman", desc: "Awal mula kisah Hilda bertemu troll batu yang berubah wujud saat malam tiba.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 48, title: "Hilda and Twig Hide from the Rain", price: 160000, type: "Paperback", age: "5-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Luke Pearson", pages: "48 Halaman", desc: "Cerita pendek Hilda dan peliharaannya Twig yang berteduh dari hujan badai yang aneh.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 49, title: "How Many Animals Can Fit in This", price: 160000, type: "Paperback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Natalia Yaskina", pages: "40 Halaman", desc: "Belajar konsep ukuran dengan cara lucu: berapa banyak hewan yang muat di benda-benda ini?", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 50, title: "Kai and The Monkey King", price: 160000, type: "Paperback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Joe Todd-Stanton", pages: "52 Halaman", desc: "Kai mencari Raja Kera legendaris untuk membantunya menyelamatkan desanya dari bahaya.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 51, title: "Leo and the Gorgons Curse", price: 160000, type: "Paperback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Joe Todd-Stanton", pages: "56 Halaman", desc: "Leo harus mematahkan kutukan Medusa dengan keberanian dan kecerdikannya.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 52, title: "Mad About Monkeys", price: 160000, type: "Paperback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Owen Davey", pages: "40 Halaman", desc: "Jelajahi dunia primata yang ribut dan penuh warna dengan ilustrasi grafis yang keren.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 53, title: "Marcy & The Riddle of The Sphinx", price: 160000, type: "Paperback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Joe Todd-Stanton", pages: "56 Halaman", desc: "Marcy harus mengatasi ketakutannya akan gelap demi menyelamatkan ayahnya di Mesir kuno.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 54, title: "Me and My Fear", price: 160000, type: "Paperback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Francesca Sanna", pages: "40 Halaman", desc: "Gadis imigran yang berteman dengan rasa takutnya sendiri saat beradaptasi di tempat baru.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 55, title: "Monster Support Group The Werewolf", price: 160000, type: "Paperback", age: "7-10 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Laura Suarez", pages: "64 Halaman", desc: "Kisah lucu manusia serigala yang curhat tentang masalah hidupnya di grup dukungan monster.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 56, title: "My Very Own Space", price: 160000, type: "Paperback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Pippa Goodhart", pages: "32 Halaman", desc: "Kelinci kecil yang hanya ingin sedikit ruang pribadi untuk membaca dengan tenang.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 57, title: "Obsessive About Octopuses", price: 160000, type: "Paperback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Owen Davey", pages: "40 Halaman", desc: "Buku tentang gurita yang cerdas dan menyamar dengan sangat baik di lautan luas.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 58, title: "Passionate About Penguins", price: 160000, type: "Paperback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Owen Davey", pages: "40 Halaman", desc: "Mengenal berbagai jenis penguin di dunia yang unik dan menggemaskan.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 59, title: "Professor Brownstones Vault Kai", price: 160000, type: "Paperback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Joe Todd-Stanton", pages: "56 Halaman", desc: "Membuka rahasia-rahasia kuno di perpustakaan rahasia keluarga Brownstone.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 60, title: "Professor Brownstones Vault Marcy", price: 160000, type: "Paperback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Joe Todd-Stanton", pages: "56 Halaman", desc: "Marcy kembali dalam petualangan arkeologi yang menegangkan untuk mencari peninggalan dewa.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 61, title: "Smart About Sharks", price: 160000, type: "Paperback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Owen Davey", pages: "40 Halaman", desc: "Menghapus stigma seram hiu dan menunjukkan betapa pentingnya mereka bagi ekosistem laut.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 62, title: "The Island", price: 160000, type: "Paperback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Francesca Sanna", pages: "40 Halaman", desc: "Kisah tentang empati dan penerimaan terhadap orang baru di sebuah komunitas pulau.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 63, title: "The Journey", price: 160000, type: "Paperback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Francesca Sanna", pages: "48 Halaman", desc: "Buku bergambar yang menyentuh tentang perjalanan keluarga mencari tempat tinggal yang aman.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 64, title: "The Squirrels Who Squabbled", price: 160000, type: "Paperback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Rachel Bright", pages: "32 Halaman", desc: "Dua tupai yang berebut satu buah pinus terakhir hingga akhirnya sadar pentingnya berbagi.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 65, title: "The Way Home for Wolf", price: 160000, type: "Paperback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Rachel Bright", pages: "32 Halaman", desc: "Anak serigala yang tersesat di badai salju belajar bahwa meminta bantuan bukanlah kelemahan.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 66, title: "Toto the Ninja Cat and the Great Sn", price: 160000, type: "Paperback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Dermot O'Leary", pages: "192 Halaman", desc: "Kisah kucing ninja yang buta tapi sangat hebat dalam menumpas kejahatan di London.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 67, title: "Wild Animals of The North", price: 160000, type: "Paperback", age: "5-10 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Dieter Braun", pages: "144 Halaman", desc: "Ensiklopedia ilustrasi hewan-hewan di belahan bumi utara dengan gaya seni yang unik.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 68, title: "Wild Animals of The South", price: 160000, type: "Paperback", age: "5-10 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Dieter Braun", pages: "144 Halaman", desc: "Menjelajahi fauna unik di belahan bumi selatan lewat ilustrasi yang memukau mata.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 69, title: "A First Book of Animals", price: 180000, type: "Paperback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Nicola Davies", pages: "104 Halaman", desc: "Kumpulan puisi dan ilustrasi tentang hewan-hewan yang cocok untuk dibaca bersama anak.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 70, title: "A First Book of Nature", price: 180000, type: "Paperback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Nicola Davies", pages: "108 Halaman", desc: "Mengenalkan anak pada siklus musim dan keindahan alam lewat kata-kata dan gambar indah.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 71, title: "Animetrics", price: 180000, type: "Paperback", age: "8-12 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Joanna Webster", pages: "64 Halaman", desc: "Buku aktivitas mewarnai kode angka yang akan membentuk gambar hewan geometris keren.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 72, title: "Hidden World Forest", price: 180000, type: "Hardback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Libby Walden", pages: "16 Halaman", desc: "Buku angkat-tutup (lift-the-flap) yang membongkar rahasia kehidupan di dalam hutan.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 73, title: "Hidden World Jungle", price: 180000, type: "Hardback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Libby Walden", pages: "16 Halaman", desc: "Intip apa saja yang bersembunyi di balik rimbunnya dedaunan hutan hujan tropis.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 74, title: "Hidden World Ocean", price: 180000, type: "Hardback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Libby Walden", pages: "16 Halaman", desc: "Jelajahi dunia bawah laut yang tersembunyi lewat fitur interaktif angkat-tutup.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 75, title: "Life", price: 180000, type: "Hardback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Cynthia Rylant", pages: "48 Halaman", desc: "Pesan filosofis tentang keindahan hidup dan harapan yang disampaikan lewat ilustrasi lembut.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 76, title: "Lights out Nightly", price: 180000, type: "Hardback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Marina Gioti", pages: "32 Halaman", desc: "Buku pengantar tidur yang mengajak anak mematikan lampu dan bermimpi indah.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 77, title: "Maps Postcards", price: 180000, type: "Paperback", age: "Semua Umur", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Aleksandra Mizielinska", pages: "60 Halaman", desc: "Kumpulan kartu pos dengan peta-peta indah dari buku best-seller 'Maps'.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 78, title: "Meet The Dogs", price: 180000, type: "Hardback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Blexbolex", pages: "40 Halaman", desc: "Gaya seni unik yang mengenalkan berbagai karakter anjing yang lucu-lucu.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 79, title: "Neon Leon", price: 180000, type: "Hardback", age: "2-5 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Jane Clarke", pages: "32 Halaman", desc: "Leon si bunglon neon mencari tempat di mana ia bisa membaur dengan warna kulitnya.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 80, title: "Pick a Pine Tree", price: 180000, type: "Hardback", age: "3-7 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Patricia Toht", pages: "40 Halaman", desc: "Kisah meriah tentang tradisi memilih dan menghias pohon natal bersama keluarga.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 81, title: "Pick a Pumpkin", price: 180000, type: "Hardback", age: "3-7 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Patricia Toht", pages: "40 Halaman", desc: "Siklus seru merayakan musim gugur dan membuat lampion labu untuk Halloween.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 82, title: "Plume", price: 180000, type: "Hardback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Isabelle Simler", pages: "48 Halaman", desc: "Buku artistik yang fokus pada detail keindahan bulu-bulu burung yang menawan.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 83, title: "Seeing Stars", price: 180000, type: "Paperback", age: "7-12 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Sara Gillingham", pages: "64 Halaman", desc: "Mengenal rasi bintang dan mitologi di baliknya lewat desain grafis minimalis.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 84, title: "The Blue Hour", price: 180000, type: "Hardback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Isabelle Simler", pages: "48 Halaman", desc: "Menangkap momen magis saat langit berubah biru menjelang malam tiba.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 85, title: "The Boy Who Dreamed of Dragons", price: 180000, type: "Hardback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Caryl Hart", pages: "32 Halaman", desc: "Albie menemukan telur naga di bawah tempat tidurnya dan petualangan fantasi pun dimulai.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 86, title: "The Frog Who Lost His Underpants", price: 180000, type: "Hardback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Quentin Zuttion", pages: "32 Halaman", desc: "Kisah jenaka katak yang panik mencari celana dalamnya yang hilang di danau.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 87, title: "The High Street", price: 180000, type: "Hardback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Alice Melvin", pages: "32 Halaman", desc: "Buku belanja interaktif menyusuri toko-toko unik di jalan utama kota.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 88, title: "The Lost Cousin", price: 180000, type: "Hardback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Sheena Knowles", pages: "32 Halaman", desc: "Petualangan mencari sepupu yang hilang di tengah keramaian festival budaya.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 89, title: "This is a Dog", price: 180000, type: "Hardback", age: "2-5 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Ross Collins", pages: "32 Halaman", desc: "Buku konsep yang berantakan karena ada tupai yang terus mengacaukan pengenalan hewan.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 90, title: "Under My Tree", price: 180000, type: "Hardback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Muriel Tallandier", pages: "32 Halaman", desc: "Seorang anak menjalin ikatan persahabatan dengan sebuah pohon di kebun neneknya.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 91, title: "Up in the Air", price: 180000, type: "Hardback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Zoe Armstrong", pages: "32 Halaman", desc: "Melihat dunia dari perspektif langit: burung, awan, dan keajaiban yang melayang.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 92, title: "Where the Wild Thyme Blows", price: 180000, type: "Hardback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Patricia Hegarty", pages: "32 Halaman", desc: "Kisah puitis tentang keajaiban alam dan rahasia yang tersimpan di balik bunga-bunga liar.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 93, title: "A House That Once Was", price: 210000, type: "Hardback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Julie Fogliano", pages: "48 Halaman", desc: "Dua anak menemukan rumah kosong di hutan dan membayangkan siapa yang dulu tinggal di sana.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 94, title: "About Habitats Oceans", price: 210000, type: "Paperback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Cathryn Sill", pages: "48 Halaman", desc: "Panduan pengenalan ekosistem laut yang sangat edukatif untuk pembaca pemula.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 95, title: "About Habitats Polar Regions", price: 210000, type: "Paperback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Cathryn Sill", pages: "48 Halaman", desc: "Mempelajari cara hewan kutub bertahan hidup di cuaca ekstrem Arktik dan Antartika.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 96, title: "About Habitats Rainforests", price: 210000, type: "Paperback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Cathryn Sill", pages: "48 Halaman", desc: "Menjelajahi keragaman hayati hutan hujan lewat fakta sains yang disederhanakan.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 97, title: "Astro Cat Atomic Adventure", price: 210000, type: "Hardback", age: "7-11 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Dr. Dominic Walliman", pages: "64 Halaman", desc: "Astro Cat mengajak anak belajar fisika atom dan partikel dengan cara yang sangat seru.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 98, title: "Astro Cat Frontier of Space", price: 210000, type: "Hardback", age: "7-11 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Dr. Dominic Walliman", pages: "64 Halaman", desc: "Petualangan Astro Cat menjelajahi galaksi, bintang, dan misteri luar angkasa.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 99, title: "Astro Cat Human Body", price: 210000, type: "Hardback", age: "7-11 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Dr. Dominic Walliman", pages: "64 Halaman", desc: "Bedah tuntas anatomi dan cara kerja tubuh manusia bersama si kucing profesor.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 100, title: "Beyond the Great South Wall", price: 210000, type: "Hardback", age: "8-12 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Frank Savile", pages: "64 Halaman", desc: "Ekspedisi fantasi melewati tembok raksasa di kutub untuk menemukan peradaban kuno.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 101, title: "Darwin's On the Origin of Species", price: 210000, type: "Hardback", age: "9-12 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Anna Brett", pages: "64 Halaman", desc: "Adaptasi indah teori evolusi Darwin yang dibuat mudah dimengerti oleh anak-anak.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 102, title: "Elephantantastic", price: 210000, type: "Hardback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Michael Engler", pages: "40 Halaman", desc: "Seorang anak memesan gajah sungguhan dari toko mainan, dan kegaduhan pun terjadi.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 103, title: "Grow", price: 210000, type: "Hardback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Rizwana Khan", pages: "32 Halaman", desc: "Belajar tentang kesabaran dan proses tumbuh kembang lewat menanam biji kecil.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 104, title: "Home", price: 210000, type: "Hardback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Carson Ellis", pages: "40 Halaman", desc: "Melihat berbagai macam rumah di seluruh dunia, dari kastil hingga rumah di sepatu.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 105, title: "How Big is Big? How Far is Far?", price: 210000, type: "Hardback", age: "5-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Jan Van Der Veken", pages: "40 Halaman", desc: "Buku infografis keren yang menjelaskan perbandingan skala di alam semesta.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 106, title: "I can Hear the Ocean", price: 210000, type: "Hardback", age: "0-3 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Roger Priddy", pages: "10 Halaman", desc: "Buku suara interaktif yang membawa suasana pantai dan ombak ke genggaman si kecil.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 107, title: "Journey to the River Sea", price: 210000, type: "Hardback", age: "9-12 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Eva Ibbotson", pages: "320 Halaman", desc: "Novel petualangan klasik tentang gadis yatim piatu yang menyusuri sungai Amazon.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 108, title: "Jungles", price: 210000, type: "Hardback", age: "5-10 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Mia Cassany", pages: "48 Halaman", desc: "Menjelajahi keanekaragaman hutan paling liar di dunia lewat ilustrasi detail yang indah.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 109, title: "Last Day of Summer", price: 210000, type: "Hardback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Lamar Giles", pages: "40 Halaman", desc: "Momen melankolis namun indah saat liburan musim panas berakhir dan sekolah dimulai.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 110, title: "Little Guides to Great Lives Amelia", price: 210000, type: "Hardback", age: "7-10 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Isabel Thomas", pages: "64 Halaman", desc: "Biografi bergambar Amelia Earhart, pilot wanita pertama yang menyeberangi Atlantik.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 111, title: "Little Guides to Great Lives Darwin", price: 210000, type: "Hardback", age: "7-10 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Dan Green", pages: "64 Halaman", desc: "Mempelajari kehidupan Charles Darwin dan bagaimana ia mengubah pandangan dunia tentang alam.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 112, title: "Little Guides to Great Lives Frieda", price: 210000, type: "Hardback", age: "7-10 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Isabel Thomas", pages: "64 Halaman", desc: "Mengenal Frida Kahlo dan semangat seninya yang tak pernah padam di tengah keterbatasan.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 113, title: "Little Guides to Great Lives Curie", price: 210000, type: "Hardback", age: "7-10 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Isabel Thomas", pages: "64 Halaman", desc: "Kisah Marie Curie, ilmuwan wanita penerima Nobel yang mengabdi pada dunia sains.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 114, title: "Little Guides to Great Lives Mandela", price: 210000, type: "Hardback", age: "7-10 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Isabel Thomas", pages: "64 Halaman", desc: "Perjuangan Nelson Mandela melawan ketidakadilan demi kemerdekaan Afrika Selatan.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 115, title: "Looking for Yesterday", price: 210000, type: "Hardback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Alison Jay", pages: "32 Halaman", desc: "Gadis kecil yang mencoba mencari 'hari kemarin' yang indah agar bisa mengulangnya lagi.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 116, title: "Marcy and the Riddle of the Sphinx", price: 210000, type: "Hardback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Joe Todd-Stanton", pages: "56 Halaman", desc: "Edisi hardcover petualangan Marcy menyelamatkan ayahnya di reruntuhan Mesir.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 117, title: "Mason Mooney Paranormal Detective", price: 210000, type: "Hardback", age: "8-12 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Seaerra Miller", pages: "72 Halaman", desc: "Detektif paranormal sombong Mason Mooney mencoba membuktikan hantu itu nyata.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 118, title: "Mason Mooney Doppelganger Detective", price: 210000, type: "Hardback", age: "8-12 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Seaerra Miller", pages: "80 Halaman", desc: "Mason harus menghadapi kembaran jahatnya yang muncul dari dimensi lain.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 119, title: "Millions of Cats", price: 210000, type: "Hardback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Wanda Gag", pages: "32 Halaman", desc: "Buku bergambar klasik tertua yang menceritakan tentang pasangan tua yang ingin memelihara kucing.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 120, title: "Nanny Piggins & the Pursuit of Piggins", price: 210000, type: "Hardback", age: "7-12 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "R.A. Spratt", pages: "256 Halaman", desc: "Kisah pengasuh babi yang eksentrik dan sangat mencintai cokelat serta petualangan.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 121, title: "Night Walk", price: 210000, type: "Hardback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Marie Dorleans", pages: "40 Halaman", desc: "Petualangan sebuah keluarga berjalan kaki di tengah malam yang sunyi untuk melihat matahari terbit.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 122, title: "On The Origin of Species", price: 210000, type: "Hardback", age: "9-12 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Sabina Radeva", pages: "64 Halaman", desc: "Ilustrasi biologi yang luar biasa untuk mengenalkan anak pada keragaman makhluk hidup.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 123, title: "Otto the Book Bear", price: 210000, type: "Hardback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Katie Cleminson", pages: "32 Halaman", desc: "Beruang yang hidup di dalam buku mencari tempat tinggal baru saat ia tertinggal di sebuah rumah.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 124, title: "Professor Brownstone Kai", price: 210000, type: "Hardback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Joe Todd-Stanton", pages: "52 Halaman", desc: "Edisi hardcover buku Brownstone seri Kai.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 125, title: "Professor Brownstone Leo", price: 210000, type: "Hardback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Joe Todd-Stanton", pages: "56 Halaman", desc: "Edisi hardcover buku Brownstone seri Leo.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 126, title: "Professor Brownstone Marcy", price: 210000, type: "Hardback", age: "6-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Joe Todd-Stanton", pages: "56 Halaman", desc: "Edisi hardcover buku Brownstone seri Marcy.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 127, title: "Questions and Answers About Life", price: 210000, type: "Hardback", age: "5-10 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Katie Daynes", pages: "14 Halaman", desc: "Buku angkat-tutup yang menjawab pertanyaan filosofis anak tentang kehidupan dengan sederhana.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 128, title: "Questions and Answers About Science", price: 210000, type: "Hardback", age: "5-10 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Katie Daynes", pages: "14 Halaman", desc: "Mencari tahu jawaban 'Kenapa' dan 'Bagaimana' sains bekerja lewat fitur lift-the-flap.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 129, title: "Questions and Answers About Space", price: 210000, type: "Hardback", age: "5-10 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Katie Daynes", pages: "14 Halaman", desc: "Menjelaskan misteri lubang hitam, planet, dan astronot untuk anak-anak.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 130, title: "Sakaloolash", price: 210000, type: "Hardback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Fiona Robinson", pages: "40 Halaman", desc: "Anak-anak membuat petualangan bajak laut yang luar biasa dari benda-benda di sekitar mereka.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 131, title: "Schackleton's Journey", price: 210000, type: "Hardback", age: "8-12 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "William Grill", pages: "80 Halaman", desc: "Kisah nyata ekspedisi Shackleton yang heroik bertahan hidup di tengah es Antartika.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 132, title: "The Blue Giant", price: 210000, type: "Hardback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Katie Cottle", pages: "32 Halaman", desc: "Raksasa laut biru meminta tolong pada seorang anak untuk membersihkan sampah di lautan.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 133, title: "The Fate of Fausto", price: 210000, type: "Hardback", age: "4-9 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Oliver Jeffers", pages: "96 Halaman", desc: "Fabel modern tentang pria serakah yang ingin memiliki segala yang ada di alam semesta.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 134, title: "The Little Gardener", price: 210000, type: "Hardback", age: "3-7 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Emily Hughes", pages: "40 Halaman", desc: "Kisah menyentuh tentang tukang kebun kecil yang pantang menyerah merawat taman raksasanya.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 135, title: "The Night Box", price: 210000, type: "Hardback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Louise Greig", pages: "32 Halaman", desc: "Seorang anak menyimpan siang hari di dalam kotak ajaib dan membiarkan malam menyelimuti bumi.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 136, title: "The Night Gardener", price: 210000, type: "Hardback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "The Fan Brothers", pages: "48 Halaman", desc: "Seorang tukang kebun misterius yang memangkas pohon-pohon kota menjadi bentuk hewan ajaib.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 137, title: "The People's Painter", price: 210000, type: "Hardback", age: "6-10 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Lev Itzhak", pages: "40 Halaman", desc: "Kisah pelukis yang ingin mengabadikan kehidupan rakyat biasa dalam karyanya.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 138, title: "The Secret of Black Rock Hardback", price: 210000, type: "Hardback", age: "4-7 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Joe Todd-Stanton", pages: "40 Halaman", desc: "Edisi hardcover dari kisah Erin dan rahasia batu hitam raksasa.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 139, title: "The Wolves of Currumpaw", price: 210000, type: "Hardback", age: "9-12 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "William Grill", pages: "88 Halaman", desc: "Adaptasi kisah nyata tentang raja serigala Lobo yang legendaris di New Mexico.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 140, title: "Walk With Me", price: 210000, type: "Hardback", age: "4-8 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Jairo Buitrago", pages: "32 Halaman", desc: "Gadis kecil yang membayangkan singa menemaninya berjalan pulang agar ia merasa aman.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 141, title: "Wanderlust", price: 210000, type: "Hardback", age: "7-12 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Reinhardt Kleist", pages: "48 Halaman", desc: "Perjalanan keliling dunia untuk menemukan keajaiban-keajaiban yang tak terduga.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 142, title: "Wild", price: 210000, type: "Hardback", age: "3-6 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Emily Hughes", pages: "32 Halaman", desc: "Edisi hardcover dari buku 'Wild' yang ikonik.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 143, title: "Wild Animals of the North", price: 210000, type: "Hardback", age: "5-10 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Dieter Braun", pages: "144 Halaman", desc: "Edisi hardcover ensiklopedia hewan belahan bumi utara.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 144, title: "Wild Animals of the South", price: 210000, type: "Hardback", age: "5-10 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Dieter Braun", pages: "144 Halaman", desc: "Edisi hardcover ensiklopedia hewan belahan bumi selatan.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 145, title: "World of Wonders", price: 210000, type: "Hardback", age: "Semua Umur", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Aimee Nezhukumatathil", pages: "176 Halaman", desc: "Esai indah tentang keterkaitan manusia dengan alam dan makhluk-makhluk unik di dalamnya.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 146, title: "Bandoola", price: 255000, type: "Hardback", age: "8-12 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "William Grill", pages: "80 Halaman", desc: "Kisah nyata gajah penyelamat dalam Perang Dunia II yang sangat mengharukan.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 147, title: "Bandit of Barkland", price: 255000, type: "Hardback", age: "8-12 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Sam Bosma", pages: "64 Halaman", desc: "Novel grafis aksi fantasi di kota Barkland yang penuh intrik dan pencurian.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 148, title: "Dinosaurium", price: 255000, type: "Hardback", age: "7-12 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Lily Murray", pages: "112 Halaman", desc: "Membawa museum dinosaurus ke rumah Anda lewat ilustrasi besar dan detail sains akurat.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 149, title: "Hilda's Book of Beasts and Spirits", price: 255000, type: "Hardback", age: "7-11 Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Emily Hibbs", pages: "128 Halaman", desc: "Panduan lengkap makhluk ajaib yang pernah ditemui Hilda dalam petualangannya.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 150, title: "Liberty", price: 255000, type: "Paperback", age: "12+ Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Julian Voloj", pages: "144 Halaman", desc: "Kisah sejarah di balik patung Liberty dan imigran yang datang ke Amerika.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 151, title: "Skating Wilder", price: 255000, type: "Paperback", age: "12+ Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Brandon Dumais", pages: "264 Halaman", desc: "Komik tentang persahabatan dan pencarian jati diri lewat olahraga skateboard.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" },
  { id: 152, title: "The Art of Drag", price: 285000, type: "Paperback", age: "15+ Tahun", status: "PO", eta: "Maret 2026", category: "Impor", publisher: "Flying Eye Books", author: "Jake Hall", pages: "136 Halaman", desc: "Sejarah seni drag queen dan king dari masa Shakespeare hingga budaya pop modern.", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", previewurl: "" }
];

export default function CatalogPage() {
  const [selectedType, setSelectedType] = useState("Semua");
  const [selectedAge, setSelectedAge] = useState("Semua");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedPublisher, setSelectedPublisher] = useState("Semua");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState(allBooks);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);

  // Filter Options
  const types = ["Semua", "Board Book", "Picture Book", "Hardcover", "Activity", "Pop-up", "Interactive", "Lift-the-Flap"];
  const ages = ["Semua", "0-2 Thn", "3-5 Thn", "6+ Thn"];
  const categories = ["Semua", "Lokal", "Impor"];
  const publishers = ["Semua", ...Array.from(new Set(allBooks.map(item => item.publisher)))];
  
  // Filter Stok Baru (Dengan Katalog Referensi)
  const statuses = [
      { label: "Semua", value: "Semua" },
      { label: "Ready Stock", value: "READY" },
      { label: "Pre-Order", value: "PO" },
      { label: "Katalog Referensi", value: "REFERENSI" }
  ];

  useEffect(() => {
    let result = allBooks;
    if (selectedType !== "Semua") result = result.filter(book => book.type === selectedType);
    if (selectedAge !== "Semua") result = result.filter(book => book.age === selectedAge);
    if (selectedCategory !== "Semua") result = result.filter(book => book.category === selectedCategory);
    if (selectedPublisher !== "Semua") result = result.filter(book => book.publisher === selectedPublisher);
    if (selectedStatus !== "Semua") result = result.filter(book => book.status === selectedStatus);
    if (searchQuery) result = result.filter(book => book.title.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredBooks(result);
  }, [selectedType, selectedAge, selectedCategory, selectedPublisher, selectedStatus, searchQuery]);

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
                
                {/* FILTER STATUS STOCK */}
                <div>
                    <h3 className="font-bold text-[#8B5E3C] mb-3">Status Stok</h3>
                    <div className="space-y-2">
                        {statuses.map(status => (
                            <label key={status.value} className="flex items-center gap-2 cursor-pointer hover:text-[#FF9E9E]">
                                <input 
                                    type="radio" 
                                    name="status" 
                                    className="accent-[#FF9E9E]" 
                                    checked={selectedStatus === status.value} 
                                    onChange={() => setSelectedStatus(status.value)} 
                                />
                                <span className="text-sm">{status.label}</span>
                            </label>
                        ))}
                    </div>
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
                    <h3 className="font-bold text-[#8B5E3C] mb-3">Format Buku</h3> 
                    <div className="space-y-2">{types.map(type => (<label key={type} className="flex items-center gap-2 cursor-pointer hover:text-[#FF9E9E]"><input type="radio" name="type" className="accent-[#FF9E9E]" checked={selectedType === type} onChange={() => setSelectedType(type)} /><span className="text-sm">{type}</span></label>))}</div>
                </div>

                <div>
                    <h3 className="font-bold text-[#8B5E3C] mb-3">Jenis Buku</h3>
                    <div className="space-y-2">{categories.map(cat => (<label key={cat} className="flex items-center gap-2 cursor-pointer hover:text-[#FF9E9E]"><input type="radio" name="category" className="accent-[#FF9E9E]" checked={selectedCategory === cat} onChange={() => setSelectedCategory(cat)} /><span className="text-sm">{cat}</span></label>))}</div>
                </div>

                 <button 
                    onClick={() => { 
                        setSelectedType("Semua"); 
                        setSelectedAge("Semua"); 
                        setSelectedCategory("Semua"); 
                        setSelectedPublisher("Semua"); 
                        setSelectedStatus("Semua");
                        setSearchQuery(""); 
                    }} 
                    className="w-full py-2 bg-orange-100 text-[#8B5E3C] rounded-lg text-sm font-bold hover:bg-orange-200 transition-colors"
                 >
                    Reset Filter
                 </button>
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
                                    
                                    {/* STATUS BADGE DI GRID (3 VARIANT) */}
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

      {/* MODAL POPUP */}
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
                        {/* BADGE DI MODAL (3 VARIANT) */}
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
                    
                    <h3 className="text-2xl md:text-3xl font-bold text-[#8B5E3C] mb-2 leading-tight">{selectedBook.title}</h3>
                    <p className="text-2xl font-bold text-[#FF9E9E] mb-6">{formatRupiah(selectedBook.price)}</p>
                    
                    {/* INFO BOX STATUS & ETA (UPDATED) */}
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
                            <div className={`relative w-full rounded-xl overflow-hidden shadow-sm border border-orange-100 ${isInstagram(selectedBook.previewurl) ? 'h-[550px]' : 'aspect-video'}`}>
                                <iframe 
                                    className="absolute inset-0 w-full h-full"
                                    src={getEmbedUrl(selectedBook.previewurl) as string} 
                                    title="Review Preview" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <a href={selectedBook.previewurl} target="_blank" className="text-xs text-orange-400 hover:text-orange-600 mt-1 inline-block underline">
                                Buka di aplikasi
                            </a>
                        </div>
                    )}

                    <div className="flex gap-3 mt-auto pt-4">
                        {/* TOMBOL DINAMIS (READY / PO / REFERENSI) */}
                         <a href={getWaLink(selectedBook)} target="_blank" className={`flex-1 text-white py-3 rounded-xl font-bold text-center transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg ${selectedBook.status === 'REFERENSI' ? 'bg-slate-500 hover:bg-slate-600' : 'bg-[#8B5E3C] hover:bg-[#6D4C41]'}`}>
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