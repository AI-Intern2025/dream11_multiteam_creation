/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Transpile ESM-only packages for both client and server
  transpilePackages: ['lucide-react'],
};

module.exports = nextConfig;
