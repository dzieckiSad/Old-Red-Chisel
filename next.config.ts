import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Embedded Postgres for local development ships a WASM file that must not be bundled.
  serverExternalPackages: ["@electric-sql/pglite"],
  experimental: {
    serverActions: {
      // Quote form photos are resized in the browser; this leaves room for up to 5 of them.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
