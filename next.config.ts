import type { NextConfig } from "next";

const withMDX = require('@next/mdx');

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

module.exports = withMDX()(nextConfig);

export default nextConfig;
