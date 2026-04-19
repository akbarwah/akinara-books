// app/katalog/page.tsx
import { supabase } from '../../supabaseClient';
import KatalogClient from './KatalogClient';
import type { Book } from '@/app/types/book';
import { STATUS_PRIORITY } from '../components/helpers/bookHelpers';

// ✅ Helper: konversi status ke schema availability
function getAvailability(status: string): string {
  switch (status) {
    case 'READY':
      return 'https://schema.org/InStock';
    case 'PO':
      return 'https://schema.org/PreOrder';
    default:
      return 'https://schema.org/OutOfStock';
  }
}

// ✅ Helper: group buku berdasarkan judul (sama seperti di client)
function groupBooks(books: Book[]): { title: string; books: Book[] }[] {
  const groups: { [key: string]: Book[] } = {};
  books.forEach((book) => {
    const key = book.title.trim();
    if (!groups[key]) groups[key] = [];
    groups[key].push(book);
  });
  return Object.keys(groups).map((title) => ({
    title,
    books: groups[title],
  }));
}

export default async function KatalogPage() {
  // ✅ Fetch di server — select('*') sudah include slug
  const { data, error } = await supabase.from('books').select('*');

  const books: Book[] = error || !data
    ? []
    : [...data].sort((a, b) => {
      const pA = STATUS_PRIORITY[a.status] ?? 99;
      const pB = STATUS_PRIORITY[b.status] ?? 99;
      if (pA !== pB) return pA - pB;
      return a.id - b.id;
    });

  // ✅ Group buku untuk schema
  const bookGroups = groupBooks(books);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://akinarabooks.my.id';

  // ✅ Generate ItemList Schema
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Katalog Buku Anak Akinara Books',
    description:
      'Koleksi lengkap buku anak import dan lokal pilihan terbaik di Akinara Books.',
    url: `${siteUrl}/katalog`,
    numberOfItems: bookGroups.length,
    itemListElement: bookGroups.map((group, index) => {
      const displayBook = group.books[0];
      const prices = group.books.map((b) => b.price ?? 0);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const hasVariants = group.books.length > 1;

      // ✅ URL per buku pakai slug (jika ada)
      const bookUrl = displayBook.slug
        ? `${siteUrl}/katalog/${displayBook.slug}`
        : `${siteUrl}/katalog`;

      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Book',
          name: displayBook.title,
          ...(displayBook.author && {
            author: {
              '@type': 'Person',
              name: displayBook.author,
            }
          }),
          ...(displayBook.publisher && {
            publisher: {
              '@type': 'Organization',
              name: displayBook.publisher,
            }
          }),
          ...(displayBook.image && { image: displayBook.image }),
          ...(displayBook.description && { description: displayBook.description }),
          inLanguage: displayBook.category === 'Impor' ? 'en' : 'id',
          url: bookUrl, // ✅ Sekarang pakai slug
          offers: {
            '@type': hasVariants ? 'AggregateOffer' : 'Offer',
            priceCurrency: 'IDR',
            ...(hasVariants
              ? {
                lowPrice: minPrice,
                highPrice: maxPrice,
                offerCount: group.books.length,
              }
              : {
                price: minPrice,
              }),
            availability: getAvailability(displayBook.status),
            seller: {
              '@type': 'Organization',
              name: 'Akinara Books',
            },
          },
        },
      };
    }),
  };

  return (
    <>
      {/* ✅ Inject ItemList + Book Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema),
        }}
      />
      <KatalogClient initialBooks={books} />
    </>
  );
}