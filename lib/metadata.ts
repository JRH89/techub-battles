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
  keywords,
  type = 'website',
}: {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  path?: string;
  keywords?: string[];
  type?: 'website' | 'article' | 'profile';
}): Metadata {
  const metaTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const metaDescription = description || siteConfig.description;
  const metaImage = image || siteConfig.ogImage;
  const url = `${siteConfig.url}${path}`;

  const defaultKeywords = [
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
    'programmer battle game',
    'developer RPG',
    'coding competition',
    'tech battle simulator',
    'GitHub card game',
    'developer fighting game',
    'programmer stats',
    'code warrior',
    'tech arena',
    'developer showdown',
  ];

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: keywords || defaultKeywords,
    authors: [{ name: 'TecHub', url: siteConfig.links.techub }],
    creator: 'TecHub',
    publisher: 'TecHub',
    applicationName: siteConfig.name,
    referrer: 'origin-when-cross-origin',
    category: 'Gaming',
    classification: 'Entertainment',
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
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
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
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
      icon: '/favicon.png',
      shortcut: '/favicon.png',
      apple: '/favicon.png',
    },
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: siteConfig.name,
    },
    formatDetection: {
      telephone: false,
    },
    verification: {
      // Add your verification codes here when available
      // google: 'your-google-verification-code',
      // yandex: 'your-yandex-verification-code',
      // bing: 'your-bing-verification-code',
    },
  };
}

// Generate JSON-LD structured data for rich snippets
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/directory?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TecHub',
    url: siteConfig.links.techub,
    logo: `${siteConfig.url}/favicon.png`,
    sameAs: [siteConfig.links.github],
  };
}

export function generateGameSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    image: `${siteConfig.url}/og-image.png`,
    genre: ['Strategy', 'Turn-based', 'Multiplayer'],
    gamePlatform: 'Web Browser',
    applicationCategory: 'Game',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  };
}

export function generatePersonSchema({
  login,
  name,
  avatarUrl,
  profileUrl,
}: {
  login: string;
  name?: string;
  avatarUrl: string;
  profileUrl: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: name || login,
    alternateName: `@${login}`,
    image: avatarUrl,
    url: profileUrl,
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
