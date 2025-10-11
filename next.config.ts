import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Webflow Cloud configuration
  // App is mounted at /config on Webflow Cloud
  basePath: '/config',
  assetPrefix: '/config',

  // Image optimization config
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '') || 'akwhptzlqgtlcpzvcnjl.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Webpack config for PDF lib and other dependencies
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude these server-only packages from client bundle
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
        encoding: false,
      };
    }
    return config;
  },
};

export default nextConfig;
