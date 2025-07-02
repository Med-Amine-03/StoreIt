import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100MB",
    },
  },
  images: {
    domains: [
      'upload.wikimedia.org',
      'fra.cloud.appwrite.io',
      'cloud.appwrite.io', 
       'ui-avatars.com', 
    ],
  },
  webpackDevMiddleware(config) {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};

export default nextConfig;
