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
    url.includes('instagram.com')
  );
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

export const getSeriesPrefix = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .split(' ')
    .slice(0, 2)
    .join(' ');
};

export const STATUS_PRIORITY: { [key: string]: number } = {
  READY: 1,
  PO: 2,
  BACKLIST: 3,
  ARCHIVE: 4,
  REFERENSI: 5,
};