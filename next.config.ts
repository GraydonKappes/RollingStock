import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static optimization where possible
  reactStrictMode: true,
  // Add specific env variables that should be available at build time
  env: {
    // Add any public env variables here
  },
  // Optional: Add custom headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
  // Add this section
  experimental: {
    // Enable if you're using server actions
    serverActions: {
      allowedOrigins: ['*']
    },
  },
  // Optional: Configure image domains if you're using next/image
  images: {
    domains: [
      // Add domains for your image URLs here
    ],
  },
};

export default nextConfig;
