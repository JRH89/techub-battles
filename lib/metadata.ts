import type { Metadata } from 'next';

export const siteConfig = {
  name: 'TecHub Battles',
  description: 'Watch TecHub developer profiles battle it out in epic turn-based combat! Unique stats, archetypes, spirit animals, and special moves determine the victor.',
  url: 'https://battles.techub.life',
  ogImage: '/og-image.png',
  links: {
    github: 'https://github.com/techub-life',
    techub: 'https://techub.life',
  },
};

export function createMetadata({
  title,
  description,
  image,
  noIndex = false,
  path = '',
}: {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  path?: string;
}): Metadata {
  const metaTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const metaDescription = description || siteConfig.description;
  const metaImage = image || siteConfig.ogImage;
  const url = `${siteConfig.url}${path}`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: [
      'TecHub',
      'developer battles',
      'GitHub profiles',
      'coding game',
      'developer stats',
      'tech community',
      'profile cards',
      'turn-based combat',
      'developer leaderboard',
      'GitHub stats game',
    ],
    authors: [{ name: 'TecHub' }],
    creator: 'TecHub',
    publisher: 'TecHub',
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      title: metaTitle,
      description: metaDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
      creator: '@techublife',
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: 'any' },
      ],
      apple: '/apple-touch-icon.png',
    },
  };
}
