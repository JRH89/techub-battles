import { MetadataRoute } from 'next';
import { getFightersFromFirestore } from '@/lib/fighter-sync';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://battles.techub.life';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/directory`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Dynamic player pages
  try {
    const fighters = await getFightersFromFirestore();
    const playerPages: MetadataRoute.Sitemap = fighters.map((fighter) => ({
      url: `${baseUrl}/player/${fighter.profile.login}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticPages, ...playerPages];
  } catch (error) {
    // Error generating sitemap
    // Return static pages if dynamic generation fails
    return staticPages;
  }
}
