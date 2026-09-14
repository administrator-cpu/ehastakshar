import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  // @ts-expect-error - Ignore type check for eslint property
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
