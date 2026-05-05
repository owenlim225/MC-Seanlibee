import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "goldbelly.imgix.net",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
