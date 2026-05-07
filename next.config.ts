import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "goldbelly.imgix.net",
      },
      {
        protocol: "https",
        hostname: "sdgpxydkqdthgolfmpei.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
