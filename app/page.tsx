import type { Metadata } from "next";
import AkinaraLanding from "./components/AkinaraLanding";

// ✅ FIX: Tambah page-level metadata untuk homepage
export const metadata: Metadata = {
  title: "Akinara Books & Library | Toko Buku Anak Import & Lokal Terpercaya",
  description:
    "Temukan koleksi buku anak import dan lokal pilihan tangan di Akinara Books. Buku berkualitas untuk menemani si kecil dalam petualangan membaca pertama mereka.",
  alternates: {
    canonical: "https://akinarabooks.my.id",
  },
  openGraph: {
    title: "Akinara Books & Library | Toko Buku Anak Import & Lokal Terpercaya",
    description:
      "Temukan koleksi buku anak import dan lokal pilihan tangan di Akinara Books. Buku berkualitas untuk menemani si kecil dalam petualangan membaca pertama mereka.",
    url: "https://akinarabooks.my.id",
    type: "website",
  },
};

export default function Home() {
  return (
    <main>
      <AkinaraLanding />
    </main>
  );
}