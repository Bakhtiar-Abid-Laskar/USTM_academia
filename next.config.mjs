/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
};

export default nextConfig;
