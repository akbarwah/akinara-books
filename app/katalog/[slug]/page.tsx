import { Metadata } from 'next';
import { supabase } from '../../../supabaseClient';
import { notFound } from 'next/navigation';
import BookDetailClient from './BookDetailClient';
import type { Book } from '@/app/types/book';

// ==================== TYPES ====================

interface PageProps {
    params: Promise<{ slug: string }>;
}

// ==================== DATA FETCHING ====================

async function getBook(slug: string): Promise<Book | null> {
    const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !data) return null;
    return data as Book;
}

// ✅ BARU: Ambil semua varian (judul sama, tipe beda)
async function getBookVariants(book: Book): Promise<Book[]> {
    const { data } = await supabase
        .from('books')
        .select('*')
        .eq('title', book.title.trim())
        .order('price', { ascending: true });

    if (!data || data.length <= 1) return []; // Tidak ada varian lain
    return data as Book[];
}

async function getRelatedBooks(currentBook: Book): Promise<Book[]> {
    // ✅ Fetch lebih targeted — hanya buku yang kemungkinan relevan
    const { data } = await supabase
        .from('books')
        .select('*')
        .neq('id', currentBook.id)
        .or(
            [
                currentBook.author ? `author.eq.${currentBook.author}` : '',
                currentBook.category ? `category.eq.${currentBook.category}` : '',
                currentBook.publisher ? `publisher.eq.${currentBook.publisher}` : '',
                currentBook.age ? `age.eq.${currentBook.age}` : '',
            ]
                .filter(Boolean)
                .join(',')
        )
        .limit(200);

    if (!data || data.length === 0) return [];

    // ✅ Ambil 2 & 3 kata pertama untuk deteksi seri (lebih akurat)
    const normalize = (title: string) =>
        title.toLowerCase().replace(/[^\w\s]/gi, '').trim();

    const currentWords = normalize(currentBook.title).split(/\s+/);
    const currentSeries2 = currentWords.slice(0, 2).join(' ');
    const currentSeries3 = currentWords.slice(0, 3).join(' ');

    // ✅ Scoring logic — lebih granular
    const scored = (data as Book[])
        .map((b) => {
            let score = 0;
            const bWords = normalize(b.title).split(/\s+/);
            const bSeries2 = bWords.slice(0, 2).join(' ');
            const bSeries3 = bWords.slice(0, 3).join(' ');

            // 🥇 Seri yang sama (3 kata) — paling kuat
            if (
                currentSeries3.length > 5 &&
                bSeries3 === currentSeries3
            ) {
                score += 15;
            }
            // 🥈 Seri yang sama (2 kata) — kuat
            else if (
                currentSeries2.length > 3 &&
                bSeries2 === currentSeries2
            ) {
                score += 10;
            }

            // 🥉 Author sama
            if (
                b.author &&
                currentBook.author &&
                b.author.toLowerCase() === currentBook.author.toLowerCase()
            ) {
                score += 5;
            }

            // ✅ Publisher sama
            if (
                b.publisher &&
                currentBook.publisher &&
                b.publisher.toLowerCase() === currentBook.publisher.toLowerCase()
            ) {
                score += 3;
            }

            // ✅ Usia sama
            if (
                b.age &&
                currentBook.age &&
                b.age === currentBook.age
            ) {
                score += 3;
            }

            // ✅ Type/format sama
            if (
                b.type &&
                currentBook.type &&
                b.type.toLowerCase() === currentBook.type.toLowerCase()
            ) {
                score += 1;
            }

            // Kategori sama (Impor/Lokal)
            if (b.category === currentBook.category) {
                score += 1;
            }

            return { ...b, _score: score };
        })
        .filter((b) => b._score > 0)
        .sort((a, b) => {
            // ✅ Sort by score, lalu by status (READY first)
            if (b._score !== a._score) return b._score - a._score;
            const statusOrder: Record<string, number> = { READY: 0, PO: 1, BACKLIST: 2 };
            return (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
        });

    // ✅ Deduplicate by title (ambil yang skor tertinggi / READY)
    const unique: Book[] = [];
    const seen = new Set<string>();
    for (const b of scored) {
        const key = b.title.trim().toLowerCase();
        if (!seen.has(key)) {
            unique.push(b);
            seen.add(key);
        }
        if (unique.length >= 6) break;
    }

    return unique;
}

// ==================== SEO METADATA ====================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const book = await getBook(slug);

    if (!book) {
        return { title: 'Buku Tidak Ditemukan — Akinara Books' };
    }

    const description = book.desc || book.description
        ? (book.desc || book.description || '').slice(0, 160)
        : `Beli ${book.title} di Akinara Books. ${book.type} untuk usia ${book.age}. ${book.status === 'READY' ? 'Ready stock!' : 'Pre-order sekarang!'
        } Harga Rp ${(book.price ?? 0).toLocaleString('id-ID')}`;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://akinarabooks.com';

    return {
        title: `${book.title} — Akinara Books`,
        description,
        openGraph: {
            title: `${book.title} — Akinara Books`,
            description,
            images: book.image ? [{ url: book.image, width: 600, height: 800, alt: book.title }] : [],
            type: 'website',
            siteName: 'Akinara Books',
            url: `${siteUrl}/katalog/${slug}`,
        },
        twitter: {
            card: 'summary_large_image',
            title: `${book.title} — Akinara Books`,
            description,
            images: book.image ? [book.image] : [],
        },
        alternates: {
            canonical: `${siteUrl}/katalog/${slug}`,
        },
    };
}

// ✅ Render on-demand, bukan saat build (hindari timeout di Vercel)
export const dynamic = 'force-dynamic';

// ==================== PAGE ====================

export default async function BookDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const book = await getBook(slug);

    if (!book) {
        notFound();
    }

    // ✅ Fetch varian + rekomendasi secara parallel
    const [variants, relatedBooks] = await Promise.all([
        getBookVariants(book),
        getRelatedBooks(book),
    ]);

    return (
        <BookDetailClient
            book={book}
            variants={variants}
            relatedBooks={relatedBooks}
        />
    );
}