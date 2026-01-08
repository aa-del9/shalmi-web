import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@repo/ui",
    "@repo/hooks",
    "@repo/constants",
    "@repo/utils",
    "@repo/types",
    "@repo/schemas",
    "@repo/contexts",
  ],
};

export default nextConfig;
