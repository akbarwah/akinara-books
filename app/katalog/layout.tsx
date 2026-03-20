// app/katalog/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Katalog Buku Anak Import & Lokal',
  description:
    'Jelajahi koleksi buku anak Ready Stock dan Pre-Order. Gunakan filter untuk mencari buku berdasarkan usia, penerbit, dan kategori.',
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

// ✅ Organization Schema — info toko Akinara Books
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Akinara Books',
  url: 'https://akinarabooks.my.id',
  logo: 'https://akinarabooks.my.id/favicon.ico',
  description:
    'Toko buku anak online yang menjual koleksi buku import dan lokal pilihan terbaik untuk usia dini hingga SD.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Yogyakarta',
    addressRegion: 'Daerah Istimewa Yogyakarta',
    addressCountry: 'ID',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+62-823-1433-6969',
    contactType: 'customer service',
    availableLanguage: 'Indonesian',
    contactOption: 'TollFree',
  },
  sameAs: [
    'https://www.instagram.com/akinarabooks/',
    'https://shopee.co.id/akinarabooks',
  ],
};

export default function KatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* ✅ Inject Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      {children}
    </>
  );
}