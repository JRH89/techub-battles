import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/battle?*'], // Don't index dynamic battle URLs
      },
    ],
    sitemap: 'https://battles.techub.life/sitemap.xml',
  };
}
