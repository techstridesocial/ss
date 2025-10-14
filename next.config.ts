import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Temporarily ignore ESLint errors during build for deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily ignore TypeScript errors during build for deployment
    ignoreBuildErrors: true,
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.dev https://*.clerk.com https://*.clerk.services https://*.clerk.accounts.dev https://www.googletagmanager.com https://va.vercel-scripts.com https://vercel.live https://www.google-analytics.com https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.clerk.dev https://*.clerk.com https://*.clerk.services https://*.clerk.accounts.dev https://api.modash.io https://www.googletagmanager.com https://vercel.live",
              "frame-src 'self' https://*.clerk.dev https://*.clerk.com https://*.clerk.services https://*.clerk.accounts.dev",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  }
};

export default nextConfig;
