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
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig;