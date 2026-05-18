/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    imageSizes: [16, 32, 48, 64, 96],
    deviceSizes: [640, 750, 828, 1080, 1200],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  // Ensure proper handling of PDF files
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;

    // On Windows, filesystem cache compression ('gzip') causes random ENOENT rename crashes
    // due to asynchronous file locks during fast hot-reloads.
    // Instead of compressing, we configure infrastructure logging to only show errors,
    // which completely filters out the harmless "Serializing big strings" warning.
    config.infrastructureLogging = {
      level: "error",
    };

    return config;
  },
  // ✅ OPTIMIZED: Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ["@radix-ui", "lucide-react"],
  },
  // ✅ OPTIMIZED: Compression for faster delivery
  compress: true,
  // ✅ OPTIMIZED: React strict mode for development warnings
  reactStrictMode: true,
};

export default nextConfig;
