import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, ".."),
  experimental: {
    externalDir: true,
  },
  turbopack: {
    resolveAlias: {
      "@lms-mocks": path.join(__dirname, "../shared/lms-mocks"),
    },
  },
};

export default nextConfig;
