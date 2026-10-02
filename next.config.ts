import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  /* Route → standalone HTML mapping.
     The single-file artifacts in /public ARE the product surfaces:
     visiting the friendly route serves the standalone HTML directly
     (no React page shadowing it). beforeFiles = beats filesystem+pages. */
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/showcase", destination: "/showcase.html" },
        { source: "/index-help", destination: "/index-help.html" },
        { source: "/help", destination: "/index-help.html" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
