import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// Google Books API Lookup
// Endpoint: GET /api/books/lookup?q=<title>
// Returns: Array of book candidates with auto-fill data
// ============================================================

interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title?: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
      extraLarge?: string;
    };
    previewLink?: string;
    language?: string;
    industryIdentifiers?: { type: string; identifier: string }[];
  };
  accessInfo?: {
    viewability?: string; // "NO_PAGES" | "PARTIAL" | "ALL_PAGES"
    embeddable?: boolean;
  };
}

interface BookCandidate {
  title: string;
  author: string;
  publisher: string;
  description: string;
  pages: string;
  image: string;
  language: string;
  previewUrl: string;
}

function getBestImage(imageLinks?: GoogleBooksVolume['volumeInfo']['imageLinks']): string {
  if (!imageLinks) return '';
  // Prefer higher resolution, fallback ke thumbnail
  const url =
    imageLinks.extraLarge ||
    imageLinks.large ||
    imageLinks.medium ||
    imageLinks.small ||
    imageLinks.thumbnail ||
    imageLinks.smallThumbnail ||
    '';
  // Google Books kadang return http, upgrade ke https
  return url.replace(/^http:/, 'https:');
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required (min 2 characters).' },
      { status: 400 }
    );
  }

  try {
    // Google Books API — free tier, no key required for basic searches
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query
    )}&maxResults=8&printType=books&langRestrict=en&orderBy=relevance`;

    const response = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }, // Cache 1 jam
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const statusCode = response.status;
      let errorMessage = 'Failed to fetch from Google Books API.';

      if (statusCode === 429) {
        errorMessage = 'Limit pencarian harian Google Books telah habis. Silakan coba lagi besok.';
      } else if (statusCode === 403) {
        errorMessage = 'Akses ke Google Books API ditolak (Quota Exceeded / Forbidden).';
      } else if (errorData?.error?.message) {
        errorMessage = errorData.error.message;
      }

      console.error(`Google Books API error (${statusCode}):`, errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: statusCode }
      );
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const results: BookCandidate[] = data.items.map((item: GoogleBooksVolume) => {
      const v = item.volumeInfo;
      const fullTitle = v.subtitle ? `${v.title}: ${v.subtitle}` : (v.title || '');

      // Google Books embed preview — hanya jika viewability bukan NO_PAGES dan embeddable = true
      const canEmbed =
        item.accessInfo?.embeddable === true &&
        item.accessInfo?.viewability !== 'NO_PAGES';
      const previewUrl = canEmbed
        ? `https://books.google.com/books?id=${item.id}&lpg=PP1&pg=PP1&output=embed`
        : '';

      return {
        title: fullTitle,
        author: v.authors?.join(', ') || '',
        publisher: v.publisher || '',
        description: v.description || '',
        pages: v.pageCount ? `${v.pageCount} pages` : '',
        image: getBestImage(v.imageLinks),
        language: v.language || 'en',
        previewUrl,
      };
    });

    return NextResponse.json({ results });
  } catch (err) {
    console.error('Book lookup error:', err);
    return NextResponse.json(
      { error: 'Internal server error during book lookup.' },
      { status: 500 }
    );
  }
}
