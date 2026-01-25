import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext"; 
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- BAGIAN INI YANG DI-UPDATE (SEO SUPER LENGKAP) ---
export const metadata: Metadata = {
  // Ganti URL ini dengan domain asli Anda (misal: https://akinara.my.id)
  // Ini penting agar gambar di WA muncul.
  metadataBase: new URL('https://akinarabooks.my.id'), 

  title: {
    default: "Akinara Books & Library | Treasured Import & Local Children’s Books",
    template: "%s | Akinara Books"
  },
  description: "Explore our handpicked collection of extraordinary books, chosen to be the perfect companions for your little explorer’s first steps into the magic of reading.",
  
  // Konfigurasi untuk Facebook / WhatsApp (Open Graph)
  openGraph: {
    title: "Akinara Books & Library",
    description: "Explore our handpicked collection of extraordinary books, chosen to be the perfect companions for your little explorer’s first steps into the magic of reading.",
    url: 'https://akinarabooks.my.id',
    siteName: 'Akinara Books',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png', // Pastikan file ini ada di folder public
        width: 1200,
        height: 630,
        alt: 'Akinara Books Storefront',
      }
    ],
  },

  // Konfigurasi untuk Twitter / X
  twitter: {
    card: 'summary_large_image',
    title: "Akinara Books & Library",
    description: "Explore our handpicked collection of extraordinary books, chosen to be the perfect companions for your little explorer’s first steps into the magic of reading.",
    images: ['/opengraph-image.png'],
  },
  
  icons: "favicon.ico",
};
// --- BATAS AKHIR UPDATE METADATA ---

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          {children}
        </CartProvider>
        <Analytics />
        <SpeedInsights /> 
      </body>
    </html>
  );
}