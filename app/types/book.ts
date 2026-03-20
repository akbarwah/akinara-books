// ============================================================
// SHARED TYPES — Dipakai di CartContext & MiniCatalog
// ============================================================

export type BookStatus = 'READY' | 'PO' | 'BACKLIST' | 'REFERENSI' | 'ARCHIVE';

export type Book = {
  id: number;
  title: string;
  price: number;
  image: string;
  status: BookStatus;
  type?: string;
  weight?: number;
  // Fields tambahan dari katalog (optional di cart)
  author?: string;
  publisher?: string;
  category?: string;
  age?: string;
  pages?: string;
  description?: string;
  desc?: string;
  previewurl?: string;
  eta?: string;
  sticker_text?: string;
  is_highlight?: boolean;
};

export type CartItem = Book & {
  quantity: number;
};