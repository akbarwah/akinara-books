import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Katalog Buku Anak Import & Lokal',
  description:
    'Jelajahi koleksi buku anak Ready Stock dan Pre-Order. Gunakan filter untuk mencari buku berdasarkan usia, penerbit, dan kategori.',
  
  // ✅ Tambah keywords spesifik katalog
  keywords: [
    'katalog buku anak',
    'buku anak ready stock',
    'buku anak pre-order',
    'buku anak import murah',
    'buku anak lokal',
  ],
  
  alternates: {
    canonical: 'https://akinarabooks.my.id/katalog',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Katalog Buku Anak - Akinara Books',
    description:
      'Jelajahi koleksi buku anak Ready Stock dan Pre-Order. Filter berdasarkan usia, penerbit, dan kategori.',
    url: 'https://akinarabooks.my.id/katalog',
    type: 'website',
  },
};

export default function KatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}