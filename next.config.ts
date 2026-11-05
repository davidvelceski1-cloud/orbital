import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // three.js ships ESM that Next can tree-shake; transpiling keeps drei/fiber happy.
  transpilePackages: ["three"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "apod.nasa.gov" }],
  },
};

export default nextConfig;
