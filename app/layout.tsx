import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 1. Import CartProvider (Wajib agar keranjang jalan)
import { CartProvider } from "./context/CartContext"; 
// 2. Import Analytics
import { Analytics } from "@vercel/analytics/react";
// 3. Import Speed Insights (INI YANG TADI KURANG)
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Akinara Books & Library",
  description: "Toko Buku Anak Jogja",
  icons: "favicon.ico",
};

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
        {/* CartProvider membungkus konten utama */}
        <CartProvider>
          {children}
        </CartProvider>

        {/* Analytics & Speed Insights diletakkan di sini */}
        <Analytics />
        <SpeedInsights /> 
      </body>
    </html>
  );
}