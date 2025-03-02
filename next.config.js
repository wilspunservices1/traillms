const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  eslint: {
    ignoreDuringBuilds: true, // ⛔ Skips ESLint checks during builds
  },

  typescript: {
    ignoreBuildErrors: true, // ⛔ Ignores TS errors during production build
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/ddj5gisb3/image/upload/**",
      },
    ],
  },

  // Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Webpack configuration for alias resolution & fallback
  webpack: (config) => {
    // ✅ Add alias resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
      "@/db": path.resolve(__dirname, "src/db/index"),
      "@/components": path.resolve(__dirname, "src/components"),
    };

    // ✅ Preserve existing fallback settings
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false, // Prevents errors when fs module is not needed
    };

    return config;
  },

  // Experimental features
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
};

module.exports = nextConfig;
