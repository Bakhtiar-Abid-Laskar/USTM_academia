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
  // ✅ PWA/TWA: Custom headers for Digital Asset Links and Service Worker
  async headers() {
    return [
      {
        // Serve Digital Asset Links with correct content-type
        source: "/.well-known/assetlinks.json",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        // Service Worker needs to control the entire scope
        source: "/sw.js",
        headers: [
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
