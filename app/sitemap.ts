import { supabase } from '../supabaseClient';

// ✅ Sitemap hanya perlu di-regenerate 1x sehari
export const revalidate = 86400;

export default async function sitemap() {
  // Fetch all book slugs
  const { data: books } = await supabase
    .from('books')
    .select('slug, id')
    .order('id', { ascending: false });

  const bookUrls = (books || []).map((book) => ({
    url: `https://akinara.com/katalog/${book.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://akinara.com',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: 'https://akinara.com/katalog',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: 'https://akinara.com/cek-pesanan',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    ...bookUrls,
  ];
}