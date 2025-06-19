import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for PWA
  experimental: {
    // Enable service worker registration
    webVitalsAttribution: ["CLS", "LCP"],
  },
};

// Simple PWA configuration without next-pwa for now
export default nextConfig;
