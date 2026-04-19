'use client';

import React, { useState, useMemo } from 'react';
import {
    ShoppingBag, Truck, Clock, Bookmark,
    MessageCircle, Eye, User, Building2, Book as BookIcon, Globe,
    ArrowLeft, Share2, Sparkles, Copy, Check,
    ChevronRight, Play, ExternalLink
} from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import Link from 'next/link';
import type { Book } from '@/app/types/book';

import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import CartDrawer from '@/app/components/CartDrawer';
import StickerBadge from '@/app/components/StickerBadge';
import {
    PLACEHOLDER_IMAGE,
    getSeriesPrefix,
} from '@/app/components/helpers/bookHelpers';

// ==================== HELPERS ====================

const formatRupiah = (num: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(num);

const getWaLink = (book: Book): string => {
    const phone = '6282314336969';
    const text = `Halo Admin Akinara, saya tertarik dengan buku *${book.title}* (${book.type}). Apakah varian ini akan ada di Batch PO berikutnya?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

const isEmbeddable = (url: string): boolean => {
    if (!url) return false;
    return (
        url.includes('youtube.com') ||
        url.includes('youtu.be') ||
        url.includes('instagram.com')
    );
};

const getEmbedUrl = (url: string): string | null => {
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
        if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
        cleanUrl = cleanUrl.replace('/reel/', '/p/');
        return `${cleanUrl}/embed`;
    }
    return url;
};

const StatusBadge = ({ status, size = 'md' }: { status: string; size?: 'sm' | 'md' }) => {
    const baseClass = size === 'sm'
        ? 'text-[10px] px-2 py-1 rounded-full font-bold shadow-md flex items-center gap-1'
        : 'px-3 py-1 text-xs font-bold rounded-full';

    if (status === 'READY') {
        return (
            <span className={`${baseClass} ${size === 'sm' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'}`}>
                {size === 'sm' && <Truck className="w-3 h-3" />} READY {size === 'md' && 'STOCK'}
            </span>
        );
    }
    if (status === 'PO') {
        return (
            <span className={`${baseClass} ${size === 'sm' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700'}`}>
                {size === 'sm' && <Clock className="w-3 h-3" />} PRE-ORDER
            </span>
        );
    }
    return (
        <span className={`${baseClass} ${size === 'sm' ? 'bg-slate-500 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {size === 'sm' && <Bookmark className="w-3 h-3" />} BACKLIST
        </span>
    );
};

// ==================== MAIN COMPONENT ====================

export default function BookDetailClient({
    book,
    relatedBooks,
}: {
    book: Book;
    relatedBooks: Book[];
}) {
    const { addToCart } = useCart();
    const [imgSrc, setImgSrc] = useState(book.image || PLACEHOLDER_IMAGE);
    const [copied, setCopied] = useState(false);

    const isBacklisted =
        book.status === 'BACKLIST' ||
        book.status === 'REFERENSI' ||
        book.status === 'ARCHIVE';

    const handleShare = async () => {
        try {
            const url = window.location.href;
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleShareWhatsApp = () => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const text = `Lihat buku *${book.title}* di Akinara Books!\n${formatRupiah(book.price ?? 0)}\n\n${url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-[#FFF9F0] flex flex-col font-sans overflow-x-hidden">
            <Navbar />

            <main className="flex-1 pt-8 pb-20">
                <div className="max-w-6xl mx-auto px-4">

                    {/* ===== BREADCRUMB & NAV ===== */}
                    <div className="flex items-center justify-between xl:justify-start gap-4 mb-6 text-sm">
                        <Link
                            href="/katalog"
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors font-bold"
                        >
                            <ArrowLeft className="w-4 h-4" /> Kembali
                        </Link>

                        <nav className="hidden xl:flex items-center gap-2 text-gray-400" aria-label="Breadcrumb">
                            <Link href="/" className="hover:text-orange-500 transition-colors">
                                Home
                            </Link>
                            <ChevronRight className="w-3 h-3" />
                            <Link href="/katalog" className="hover:text-orange-500 transition-colors">
                                Katalog
                            </Link>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-[#8B5E3C] font-bold truncate max-w-md">
                                {book.title}
                            </span>
                        </nav>

                        <div className="ml-auto flex items-center gap-2">
                            <button
                                onClick={handleShare}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-orange-100 rounded-full font-bold text-[#8B5E3C] hover:bg-orange-50 transition-colors shadow-sm text-xs"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Tersalin!' : 'Copy Link'}
                            </button>
                            <button
                                onClick={handleShareWhatsApp}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-green-100 rounded-full font-bold text-green-600 hover:bg-green-50 transition-colors shadow-sm text-xs"
                            >
                                <Share2 className="w-4 h-4" /> Share WA
                            </button>
                        </div>
                    </div>

                    {/* ===== MAIN CARD ===== */}
                    <div className="bg-white rounded-[2rem] shadow-xl shadow-orange-100/50 p-6 md:p-10 flex flex-col md:flex-row gap-8 md:gap-12 relative overflow-hidden">
                        {/* Decorative blobs */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF9E9E]/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-200/10 rounded-full blur-3xl" />

                        {/* --- Left: Image --- */}
                        <div className="w-full md:w-5/12 lg:w-1/2 flex flex-col relative z-10">
                            <div className="bg-gray-50 rounded-[2rem] p-8 flex items-center justify-center border border-gray-100 relative">
                                {book.sticker_text && <StickerBadge type={book.sticker_text} />}
                                <img
                                    src={imgSrc}
                                    alt={`Cover buku ${book.title}${book.author ? ` karya ${book.author}` : ''}`}
                                    className="w-full max-w-[400px] object-contain rounded-lg shadow-lg hover:scale-105 transition-transform duration-500"
                                    onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
                                />
                            </div>

                            {/* Preview button */}
                            {book.previewurl && (
                                <a
                                    href={book.previewurl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-orange-50 hover:bg-orange-100 text-[#8B5E3C] rounded-2xl font-bold text-sm transition-colors border border-orange-100"
                                >
                                    <Play className="w-4 h-4" /> Lihat Preview Video
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>

                        {/* --- Right: Detail --- */}
                        <div className="w-full md:w-7/12 lg:w-1/2 flex flex-col relative z-10">

                            {/* Status Badges */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <StatusBadge status={book.status} size="md" />
                                <span className="inline-block px-3 py-1 bg-orange-100 text-[#8B5E3C] text-xs font-bold rounded-full">
                                    {book.type}
                                </span>
                                <span className="inline-block px-3 py-1 bg-[#FF9E9E] text-white text-xs font-bold rounded-full">
                                    {book.age}
                                </span>
                            </div>

                            {/* Title & Price */}
                            <h1 className="text-3xl md:text-5xl font-black text-[#8B5E3C] mb-3 leading-tight">
                                {book.title}
                            </h1>
                            <div className="mb-8">
                                <p className="text-3xl md:text-4xl font-black text-[#FF9E9E]">
                                    {formatRupiah(book.price ?? 0)}
                                </p>
                            </div>

                            {/* Status & ETA */}
                            <div className="bg-orange-50/50 p-5 rounded-2xl mb-8 border border-orange-100/50 text-sm">
                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-orange-100/50">
                                    <span className="text-gray-500 font-medium">Status Ketersediaan:</span>
                                    <span className="font-bold text-[#8B5E3C]">
                                        {book.status === 'READY'
                                            ? '✓ Tersedia (Ready Stock)'
                                            : book.status === 'PO'
                                                ? '⏳ Pre-Order'
                                                : '🚫 Belum Masuk Batch PO'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">Estimasi Kedatangan (ETA):</span>
                                    <span className="font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md">
                                        {book.eta || 'Harap Hubungi Admin'}
                                    </span>
                                </div>
                            </div>

                            {/* Specs */}
                            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm text-slate-600 mb-8 p-5 bg-gray-50 rounded-2xl">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <User className="w-3 h-3" /> Penulis
                                    </span>
                                    <span className="font-medium text-[#6D4C41]">{book.author || '-'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <Building2 className="w-3 h-3" /> Penerbit
                                    </span>
                                    <span className="font-medium text-[#6D4C41]">{book.publisher || '-'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <BookIcon className="w-3 h-3" /> Spesifikasi
                                    </span>
                                    <span className="font-medium text-[#6D4C41]">{book.pages || '-'}</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-8">
                                <h3 className="font-bold text-[#8B5E3C] mb-3 flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-[#FF9E9E]" /> Sinopsis / Deskripsi
                                </h3>
                                <div className="text-gray-600 leading-relaxed text-sm md:text-base border-l-4 border-orange-100 pl-4 py-1">
                                    {book.description || book.desc || 'Belum ada deskripsi untuk buku ini.'}
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="mt-auto">
                                <div className="flex gap-4">
                                    {isBacklisted ? (
                                        <a
                                            href={getWaLink(book)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 text-white py-4 rounded-2xl font-bold text-center bg-slate-500 hover:bg-slate-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 hover:-translate-y-1"
                                        >
                                            <MessageCircle className="w-5 h-5" /> Tanya Stok via WA
                                        </a>
                                    ) : (
                                        <button
                                            onClick={() => addToCart(book)}
                                            className="flex-1 text-white py-4 rounded-2xl font-bold text-center bg-gradient-to-r from-[#8B5E3C] to-[#a0724f] hover:from-[#6D4C41] hover:to-[#8B5E3C] transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-900/20 hover:-translate-y-1 text-lg"
                                        >
                                            <ShoppingBag className="w-6 h-6" /> Tambahkan ke Keranjang
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== BOTTOM SECTION ===== */}
                    <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12">

                        {/* Video Preview */}
                        <div>
                            <h4 className="text-xl font-black text-[#8B5E3C] mb-6 flex items-center gap-2 border-b border-orange-100 pb-4">
                                <Eye className="w-6 h-6 text-[#FF9E9E]" /> Sneak Peek Video
                            </h4>

                            {book.previewurl && isEmbeddable(book.previewurl) ? (
                                <div
                                    className={`relative w-full rounded-3xl overflow-hidden shadow-lg border border-orange-100 bg-white ${book.previewurl.includes('instagram') ? 'h-[600px]' : 'aspect-video'
                                        }`}
                                >
                                    <iframe
                                        className="absolute inset-0 w-full h-full"
                                        src={getEmbedUrl(book.previewurl) as string}
                                        title={`Preview buku ${book.title}`}
                                        loading="lazy"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                                        sandbox="allow-scripts allow-same-origin allow-presentation"
                                        allowFullScreen
                                    />
                                </div>
                            ) : (
                                <div className="bg-orange-50/50 rounded-3xl border border-orange-100/50 p-12 text-center flex flex-col items-center justify-center text-gray-400 h-[300px]">
                                    <Eye className="w-12 h-12 mb-4 text-orange-200" />
                                    <p className="font-medium">Video preview belum tersedia</p>
                                </div>
                            )}
                        </div>

                        {/* Related Books */}
                        <div>
                            <h4 className="text-xl font-black text-[#8B5E3C] mb-6 flex items-center gap-2 border-b border-orange-100 pb-4">
                                <Sparkles className="w-6 h-6 text-yellow-500" /> Rekomendasi Serupa
                            </h4>

                            {relatedBooks.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {relatedBooks.map((relBook) => (
                                        <Link
                                            key={relBook.id}
                                            href={`/katalog/${relBook.slug}`}
                                            className="group bg-white p-3 rounded-2xl shadow-sm hover:shadow-md transition-all border border-transparent hover:border-orange-100 flex flex-col h-full"
                                        >
                                            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 mb-3 relative flex-shrink-0">
                                                <img
                                                    src={relBook.image || PLACEHOLDER_IMAGE}
                                                    alt={relBook.title}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e) => {
                                                        e.currentTarget.src = PLACEHOLDER_IMAGE;
                                                    }}
                                                />
                                                {relBook.status === 'READY' && (
                                                    <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-green-500 rounded-full border border-white shadow-sm" />
                                                )}
                                            </div>
                                            <h5 className="text-xs font-bold text-[#6D4C41] line-clamp-2 leading-tight group-hover:text-orange-500 transition-colors mb-1">
                                                {relBook.title}
                                            </h5>
                                            <p className="text-[#FF9E9E] font-black text-sm mt-auto">
                                                {formatRupiah(relBook.price ?? 0)}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400">Belum ada rekomendasi yang mirip.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
            <CartDrawer />
        </div>
    );
}