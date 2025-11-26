// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    // One-liner (works in every Next.js version)
    domains: ['images.openfoodfacts.org', 'cdn.dummyjson.com', 'drive.google.com', 'raw.githubusercontent.com'],
  },
};

export default nextConfig;