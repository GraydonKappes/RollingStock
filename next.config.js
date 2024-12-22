/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  distDir: '.next',
  images: {
    domains: [],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'e8hba3krunsdi3lp.public.blob.vercel-storage.com',
        port: '',
        pathname: '/vehicles/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig;