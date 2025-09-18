/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {},
  // Force complete rebuild
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
}

export default nextConfig
// Force Vercel rebuild 1758214185
