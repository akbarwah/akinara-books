import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Katalog Buku Anak Import & Lokal',
  description:
    'Jelajahi koleksi buku anak Ready Stock dan Pre-Order. Gunakan filter untuk mencari buku berdasarkan usia, penerbit, dan kategori.',
  // ✅ FIX: Tambah canonical & robots
  alternates: {
    canonical: 'https://akinarabooks.my.id/katalog',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Katalog Buku - Akinara Books',
    description:
      'Cari buku anak? Cek katalog lengkap kami. Bisa filter umur, penerbit, dan status ketersediaan.',
    url: 'https://akinarabooks.my.id/katalog',
    type: 'website',
  },
};

export default function KatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ FIX: Return langsung, tidak perlu fragment wrapper
  return <>{children}</>;
}