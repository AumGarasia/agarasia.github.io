// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don’t fail `next build` on ESLint errors (you can still run `npm run lint` in CI)
  eslint: { ignoreDuringBuilds: true },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "mosaic.scdn.co" },
    ],
  },

  // --- GitHub Pages (static export) ---
  // If you plan to deploy a static export (no server/API routes), uncomment:
  // output: "export",
  // images: { ...this.images, unoptimized: true }, // or just: images: { unoptimized: true }
  // trailingSlash: true,
};

export default nextConfig;
