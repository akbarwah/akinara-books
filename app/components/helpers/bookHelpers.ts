// ============================================================
// SHARED HELPER FUNCTIONS
// Dipakai di MiniCatalog, KatalogPage, dan BookDetailModal
// ============================================================

import type { Book } from '@/app/types/book';

export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%23f3e8d0'/%3E%3Ctext x='150' y='220' text-anchor='middle' font-family='Arial' font-size='14' fill='%238B5E3C' opacity='0.7'%3EGambar tidak tersedia%3C/text%3E%3C/svg%3E";

export const WA_PHONE = '6282314336969';

export const getWaLink = (book: Book): string => {
  const text = `Halo Admin Akinara, saya tertarik dengan buku *${book.title}* (${book.type}). Apakah varian ini akan ada di Batch PO berikutnya?`;
  return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(text)}`;
};

export const isEmbeddable = (url: string): boolean => {
  if (!url) return false;
  return (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    // Instagram post/carousel bisa di-embed, Reels tidak (blocked by X-Frame-Options)
    isInstagramPost(url) ||
    // Google Books embedded preview
    isGoogleBooksPreview(url)
  );
};

// Instagram post/carousel — bisa di-embed via iframe (/p/ URL)
export const isInstagramPost = (url: string): boolean => {
  if (!url || !url.includes('instagram.com')) return false;
  return url.includes('/p/');
};

// Instagram Reels — TIDAK bisa di-embed (blocked by X-Frame-Options)
export const isInstagramReel = (url: string): boolean => {
  if (!url || !url.includes('instagram.com')) return false;
  return url.includes('/reel/') || url.includes('/reels/');
};

// Google Books embedded preview — format: https://books.google.com/books?id=XXX&...&output=embed
export const isGoogleBooksPreview = (url: string): boolean => {
  if (!url) return false;
  return url.includes('books.google.com/books') || url.includes('books.google.co');
};

export const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    if (url.includes('youtu.be')) {
      videoId = url.split('/').pop()?.split('?')[0] || '';
    } else if (url.includes('watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('/embed/')) {
      return url;
    } else if (url.includes('/shorts/')) {
      videoId = url.split('/shorts/')[1]?.split('?')[0] || '';
    }
    return `https://www.youtube.com/embed/${videoId}`;
  }
  // Instagram post/carousel embed
  if (isInstagramPost(url)) {
    let cleanUrl = url.split('?')[0];
    if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
    return `${cleanUrl}/embed`;
  }
  // Google Books — jika URL sudah format embed, gunakan langsung.
  // Jika belum, tambahkan output=embed
  if (isGoogleBooksPreview(url)) {
    if (url.includes('output=embed')) {
      return url.replace(/^http:/, 'https:');
    }
    // Construct embed URL dari URL biasa
    const urlObj = new URL(url);
    const bookId = urlObj.searchParams.get('id');
    if (bookId) {
      return `https://books.google.com/books?id=${bookId}&lpg=PP1&pg=PP1&output=embed`;
    }
    return url;
  }
  return url;
};

export const getSeriesPrefix = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .split(' ')
    .slice(0, 2)
    .join(' ');
};

export const generateBookSlug = (id: number | string, title: string): string => {
  // Hanya ambil huruf, angka, spasi, dan dash
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') 
    .replace(/\s+/g, '-') 
    .replace(/-+/g, '-') 
    .replace(/^-+|-+$/g, ''); // Hapus dash di awal/akhir
  return `${id}-${cleanTitle}`;
};

export const STATUS_PRIORITY: { [key: string]: number } = {
  READY: 1,
  PO: 2,
  BACKLIST: 3,
  ARCHIVE: 4,
  REFERENSI: 5,
};