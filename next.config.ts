import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Quote form photos are resized in the browser; this leaves room for up to 5 of them.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
