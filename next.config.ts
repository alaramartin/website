import type { NextConfig } from "next";

const withMDX = require('@next/mdx');

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react/dist/ssr"],
  },
};

module.exports = withMDX()(nextConfig);

export default nextConfig;