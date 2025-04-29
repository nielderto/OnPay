import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    IDRX_API_KEY: process.env.IDRX_API_KEY,
    IDRX_SECRET_KEY: process.env.IDRX_SECRET_KEY,
  },
};

export default nextConfig;
