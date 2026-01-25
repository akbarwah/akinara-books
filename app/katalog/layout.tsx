import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Katalog Buku',
  description: 'Jelajahi koleksi buku anak Ready Stock dan Pre-Order. Gunakan filter untuk mencari buku berdasarkan usia dan kategori.',
  openGraph: {
    title: 'Katalog Buku - Akinara Books',
    description: 'Cari buku anak? Cek katalog lengkap kami. Bisa filter umur, penerbit, dan status ketersediaan.',
  },
};

export default function KatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}