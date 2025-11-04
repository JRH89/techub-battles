import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/battle?*', // Don't index dynamic battle URLs with query params
          '/api/*', // Don't crawl API routes
        ],
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/battle?*', '/api/*'],
        crawlDelay: 0.5,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/battle?*', '/api/*'],
        crawlDelay: 0.5,
      },
    ],
    sitemap: 'https://battles.techub.life/sitemap.xml',
    host: 'https://battles.techub.life',
  };
}
