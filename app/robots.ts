import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin', // blokir halaman admin dari crawler
    },
    sitemap: 'https://akinarabooks.my.id/sitemap.xml',
  }
}