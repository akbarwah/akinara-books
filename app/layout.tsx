import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from '@next/third-parties/google';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://akinarabooks.my.id"),

  title: {
    default: "Akinara Books | Toko Buku Anak Import & Lokal Terpilih",
    template: "%s | Akinara Books",
  },
  
  description:
    "Temukan koleksi buku anak import dan lokal pilihan terbaik di Akinara Books. Buku cerita, edukasi, dan dongeng untuk mendampingi si kecil jatuh cinta dengan membaca.",

  keywords: [
    "akinara books",
    "buku anak",
    "buku anak import",
    "buku anak lokal",
    "buku cerita anak",
    "buku anak berkualitas",
    "toko buku anak online",
    "beli buku anak online",
    "jual buku anak",
    "buku anak bahasa inggris",
    "buku anak bilingual",
    "buku anak usia dini",
    "buku anak TK",
    "buku anak SD",
    "toko buku anak online indonesia",
    "buku anak import murah",
  ],

  // ✅ Kode verifikasi GSC Anda
  verification: {
    google: '8jrtWiL5w29l-yxCJHiV2S_RtFmq1UeMZN0pVOphdAw',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  alternates: {
    canonical: "https://akinarabooks.my.id",
  },

  openGraph: {
    title: "Akinara Books | Toko Buku Anak Import & Lokal Terpilih",
    description:
      "Temukan koleksi buku anak import dan lokal pilihan terbaik di Akinara Books.",
    url: "https://akinarabooks.my.id",
    siteName: "Akinara Books",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Akinara Books - Toko Buku Anak Online",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Akinara Books | Toko Buku Anak Import & Lokal Terpilih",
    description:
      "Temukan koleksi buku anak import dan lokal pilihan terbaik di Akinara Books.",
    images: ["/opengraph-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CartProvider>
          {children}
        </CartProvider>
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics gaId="G-7K589MS6C3" /> {/* ← isi setelah setup GA4 */}
      </body>
    </html>
  )
}