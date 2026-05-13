/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    // ESLint runs in CI/dev; production build shouldn't gate on lint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TS errors caught during dev/CI; production build shouldn't gate on them
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  experimental: {
    serverActions: {
      // Wizard submits logo+banner as data URLs (base64) inline. The Next.js
      // 1MB default chokes on anything bigger than a thumbnail, surfacing as
      // an opaque "Server Components render" error. 10MB covers typical
      // logo + 4K banner pairs; Spaces upload happens server-side after.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
