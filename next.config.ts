import type { NextConfig } from "next";

const withMDX = require('@next/mdx');

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // Pin the workspace root to this project — a stray ~/package-lock.json otherwise makes
  // Turbopack infer the home directory as the root and emit a warning.
  turbopack: {
    root: __dirname,
  },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react/dist/ssr"],
  },
};

module.exports = withMDX()(nextConfig);

export default nextConfig;