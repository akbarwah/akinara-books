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

async function getRelatedBooks(currentBook: Book): Promise<Book[]> {
    // Ambil buku dengan kategori atau usia yang sama
    const { data } = await supabase
        .from('books')
        .select('*')
        .neq('id', currentBook.id)
        .limit(50);

    if (!data) return [];

    const currentSeries = currentBook.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .split(' ')
        .slice(0, 2)
        .join(' ');

    // Scoring logic
    const scored = (data as Book[])
        .map((b) => {
            let score = 0;
            const bSeries = b.title
                .toLowerCase()
                .replace(/[^\w\s]/gi, '')
                .split(' ')
                .slice(0, 2)
                .join(' ');

            if (bSeries === currentSeries && currentSeries.length > 3) score += 10;
            if (b.author && currentBook.author && b.author === currentBook.author) score += 5;
            if (b.category === currentBook.category) score += 1;
            return { ...b, _score: score };
        })
        .filter((b) => b._score > 0)
        .sort((a, b) => b._score - a._score);

    // Deduplicate by title
    const unique: Book[] = [];
    const seen = new Set<string>();
    for (const b of scored) {
        const key = b.title.trim().toLowerCase();
        if (!seen.has(key)) {
            unique.push(b);
            seen.add(key);
        }
        if (unique.length >= 4) break;
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

// ==================== STATIC PARAMS ====================

export async function generateStaticParams() {
    const { data } = await supabase.from('books').select('slug');
    return (data || []).map((book) => ({ slug: book.slug }));
}

// ==================== PAGE ====================

export default async function BookDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const book = await getBook(slug);

    if (!book) {
        notFound();
    }

    const relatedBooks = await getRelatedBooks(book);

    return <BookDetailClient book={book} relatedBooks={relatedBooks} />;
}