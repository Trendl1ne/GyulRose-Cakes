import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: import.meta.dirname },
  experimental: { serverActions: { bodySizeLimit: "4mb" } }
};

export default nextConfig;
