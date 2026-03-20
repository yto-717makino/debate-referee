import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/debate-referee',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
