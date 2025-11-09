import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'techub.life',
      },
      {
        protocol: 'https',
        hostname: 'battles.techub.life',
      },
    ],
  },
  // Optimize for Vercel to prevent cold starts
  serverExternalPackages: ['firebase'],
  // Enable compression
  compress: true,
  // Disable source maps in production for faster builds
  productionBrowserSourceMaps: false,
  // Configure trailing slash for consistency
  trailingSlash: false,
};

export default nextConfig;
