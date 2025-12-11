import type { NextConfig } from "next";

// Import bundle analyzer (optional - only if installed)
let withBundleAnalyzer: any = (config: NextConfig) => config;
try {
  withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });
} catch (e) {
  // Bundle analyzer not installed, skip it
  console.log('Bundle analyzer not available, skipping...');
}

const nextConfig: NextConfig = {
  eslint: {
    // Enable ESLint during builds to catch errors
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enable TypeScript error checking during builds
    ignoreBuildErrors: false,
  },
  
  // Performance optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Experimental features for performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-avatar', '@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs'],
    
    // Enable turbopack in development (faster builds)
    // turbo is enabled via --turbopack flag in package.json
  },
  
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.modash.io',
      },
      {
        protocol: 'https',
        hostname: 'imgigp.modash.io',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: '*.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'scontent.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: '*.fna.fbcdn.net',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  
  // Output configuration for optimal bundling
  output: 'standalone',
  
  // Compression
  compress: true,
  
  // Remove powered by header
  poweredByHeader: false,
  
  // Generate ETags for caching
  generateEtags: true,
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side optimizations
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Common vendor chunks
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              priority: 10,
            },
            // Separate large libraries
            react: {
              name: 'react',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 20,
            },
            clerk: {
              name: 'clerk',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]@clerk[\\/]/,
              priority: 20,
            },
            radix: {
              name: 'radix',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              priority: 15,
            },
            recharts: {
              name: 'recharts',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              priority: 15,
            },
          },
        },
      }
    }
    
    return config
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.dev https://*.clerk.com https://*.clerk.services https://*.clerk.accounts.dev https://clerk.stride-suite.com https://www.googletagmanager.com https://va.vercel-scripts.com https://vercel.live https://www.google-analytics.com https://challenges.cloudflare.com",
              "script-src-elem 'self' 'unsafe-inline' https://*.clerk.dev https://*.clerk.com https://*.clerk.services https://*.clerk.accounts.dev https://clerk.stride-suite.com https://www.googletagmanager.com https://va.vercel-scripts.com https://vercel.live https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.clerk.dev https://*.clerk.com https://*.clerk.services https://*.clerk.accounts.dev https://clerk.stride-suite.com https://api.modash.io https://www.googletagmanager.com https://vercel.live",
              "frame-src 'self' https://*.clerk.dev https://*.clerk.com https://*.clerk.services https://*.clerk.accounts.dev",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
            ].join('; '),
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
      // Static asset caching
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Image caching
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  }
};

export default withBundleAnalyzer(nextConfig);
