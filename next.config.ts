import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Embedded Postgres for local development ships a WASM file that must not be bundled.
  serverExternalPackages: ["@electric-sql/pglite"],
  images: {
    // Product photos uploaded from the admin panel (Vercel Blob).
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  experimental: {
    serverActions: {
      // Photos are resized in the browser first: up to 5 per quote request, and one per
      // upload in the admin panel. Vercel caps request bodies at 4.5 MB anyway.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
