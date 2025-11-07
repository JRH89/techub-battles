import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  createMetadata,
  generateWebsiteSchema,
  generateOrganizationSchema,
  generateGameSchema,
} from '@/lib/metadata';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = createMetadata({
  title: 'TecHub Battles - Epic Developer Profile Battles',
  description:
    'Watch TecHub developer profiles battle it out in epic turn-based combat! Unique stats, archetypes, spirit animals, and special moves determine the victor. Join the leaderboard and compete!',
  path: '/',
  keywords: [
    'TecHub Battles',
    'developer battle game',
    'GitHub profile battles',
    'coding game',
    'programmer RPG',
    'developer stats game',
    'tech community game',
    'turn-based developer combat',
    'GitHub card game',
    'developer leaderboard',
    'coding competition',
    'tech battle simulator',
    'free developer game',
    'browser-based game',
    'developer showdown',
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = generateWebsiteSchema();
  const organizationSchema = generateOrganizationSchema();
  const gameSchema = generateGameSchema();

  return (
    <html lang="en">
      <head>
        {/* JSON-LD Structured Data for Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(gameSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Navbar />
        <main className="flex-1">
          {children}
          <SpeedInsights />
          <Analytics />
        </main>
        <Footer />
      </body>
    </html>
  );
}
