/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
   eslint: {
    ignoreDuringBuilds: true, // ⛔ Skips ESLint checks during builds
  },
  typescript: {
    ignoreBuildErrors: true, // <--- Ignores TS errors during production build
  },
  images : {
    unoptimized: true,
    remotePatterns : [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/ddj5gisb3/image/upload/**",
      },
    ],
    // Only disable optimization if absolutely necessary
    unoptimized: process.env.NODE_ENV === "development",
  },

  // Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Webpack configuration for better module resolution
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },

  // Experimental features
  experimental: {
    // Enable optimized page loading
    optimizeCss: true,
    // Better handling of hydration
    scrollRestoration: true,
  },
};

export default nextConfig;
