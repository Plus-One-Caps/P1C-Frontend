import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  async redirects() {
    return [
      { source: "/apparel", destination: "/shop", permanent: true },
      { source: "/products", destination: "/shop", permanent: true },
      { source: "/products/:slug", destination: "/shop/:slug", permanent: true },
      { source: "/quote", destination: "/order", permanent: true },
      { source: "/order-request", destination: "/order", permanent: true },
      { source: "/services", destination: "/process", permanent: true },
      { source: "/services/:slug", destination: "/process", permanent: true },
    ];
  },
  images: {
    qualities: [75, 90, 100],
    deviceSizes: [640, 750, 828, 1080, 1200, 1280, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    // Allow local images with cache-bust query strings (e.g. ?v=5)
    localPatterns: [
      { pathname: "/images/**" },
      { pathname: "/brand/**" },
      { pathname: "/**" },
    ],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "www.ssactivewear.com" },
      { protocol: "https", hostname: "cdn.ssactivewear.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
    ],
  },
};

export default nextConfig;
