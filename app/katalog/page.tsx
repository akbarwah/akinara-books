// app/katalog/page.tsx
// ✅ TIDAK ada 'use client' — ini Server Component

import { supabase } from '../../supabaseClient';
import KatalogClient from '@/app/katalog/KatalogClient';
import type { Book } from '@/app/types/book';
import { STATUS_PRIORITY } from '../components/helpers/bookHelpers';

export default async function KatalogPage() {
  // ✅ Fetch di server — Google langsung bisa baca kontennya
  const { data, error } = await supabase.from('books').select('*');

  const books: Book[] = error || !data
    ? []
    : [...data].sort((a, b) => {
        const pA = STATUS_PRIORITY[a.status] ?? 99;
        const pB = STATUS_PRIORITY[b.status] ?? 99;
        if (pA !== pB) return pA - pB;
        return a.id - b.id;
      });

  return <KatalogClient initialBooks={books} />;
}