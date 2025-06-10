/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["localhost", "alliance-insurance.com"], // Add your production domain when ready
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  experimental: {
    appDir: true,
  },
  allowedDevOrigins: [
    '.replit.dev',
    '.repl.co',
    'localhost:3000',
    '127.0.0.1:3000'
  ],
};

module.exports = nextConfig;