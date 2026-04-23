/**
 * Generate URL-friendly slug dari judul buku + tipe (opsional).
 * Jika tipe disertakan, hasilnya: "dear-zoo-a-lift-the-flap-book-board-book"
 * Ini mencegah collision ketika 2 buku berjudul sama tapi beda format.
 */
export function generateSlug(title: string, type?: string): string {
  let raw = title;
  if (type) {
    raw = `${title} ${type}`;
  }
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')  // hapus karakter spesial
    .replace(/\s+/g, '-')           // spasi → dash
    .replace(/-+/g, '-')            // multiple dash → single
    .replace(/^-|-$/g, '');          // trim dash di awal/akhir
}