import { Metadata } from 'next';
import { supabase } from '../../../supabaseClient';
import { notFound } from 'next/navigation';
import BookDetailClient from './BookDetailClient';
import type { Book } from '@/app/types/book';

// ==================== CACHING ====================

// ✅ ISR: cache halaman 4 jam, lalu revalidate di background
// revalidate=60 sebelumnya menyebabkan 535K ISR writes/hari (limit free: 200K/bulan!)
// Dengan 14400 (4 jam): ~2.2K writes/hari = ~66K/bulan → aman di free tier
export const revalidate = 14400;

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

// Ambil semua varian (judul sama, tipe beda)
async function getBookVariants(book: Book): Promise<Book[]> {
    const { data } = await supabase
        .from('books')
        .select('*')
        .eq('title', book.title.trim())
        .order('price', { ascending: true });

    if (!data || data.length <= 1) return [];
    return data as Book[];
}

// ✅ OPTIMIZED: Fetch lebih sedikit data untuk rekomendasi
async function getRelatedBooks(currentBook: Book): Promise<Book[]> {
    const filters = [
        currentBook.author ? `author.eq.${currentBook.author}` : '',
        currentBook.publisher ? `publisher.eq.${currentBook.publisher}` : '',
        currentBook.age ? `age.eq.${currentBook.age}` : '',
    ].filter(Boolean).join(',');

    // Jika tidak ada filter yang valid, return kosong
    if (!filters) return [];

    const { data } = await supabase
        .from('books')
        .select('id, title, price, image, status, type, author, publisher, category, age, slug, sticker_text')
        .neq('id', currentBook.id)
        .or(filters)
        .limit(50);

    if (!data || data.length === 0) return [];

    const normalize = (title: string) =>
        title.toLowerCase().replace(/[^\w\s]/gi, '').trim();

    const currentWords = normalize(currentBook.title).split(/\s+/);
    const currentSeries2 = currentWords.slice(0, 2).join(' ');
    const currentSeries3 = currentWords.slice(0, 3).join(' ');

    const scored = (data as Book[])
        .map((b) => {
            let score = 0;
            const bWords = normalize(b.title).split(/\s+/);
            const bSeries2 = bWords.slice(0, 2).join(' ');
            const bSeries3 = bWords.slice(0, 3).join(' ');

            if (currentSeries3.length > 5 && bSeries3 === currentSeries3) score += 15;
            else if (currentSeries2.length > 3 && bSeries2 === currentSeries2) score += 10;

            if (b.author && currentBook.author &&
                b.author.toLowerCase() === currentBook.author.toLowerCase()) score += 5;
            if (b.publisher && currentBook.publisher &&
                b.publisher.toLowerCase() === currentBook.publisher.toLowerCase()) score += 3;
            if (b.age && currentBook.age && b.age === currentBook.age) score += 3;
            if (b.type && currentBook.type &&
                b.type.toLowerCase() === currentBook.type.toLowerCase()) score += 1;
            if (b.category === currentBook.category) score += 1;

            return { ...b, _score: score };
        })
        .filter((b) => b._score > 0)
        .sort((a, b) => {
            if (b._score !== a._score) return b._score - a._score;
            const statusOrder: Record<string, number> = { READY: 0, PO: 1, BACKLIST: 2 };
            return (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
        });

    // Deduplicate by title
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