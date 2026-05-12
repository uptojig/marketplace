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
};

export default nextConfig;
