import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    IDRX_API_KEY: process.env.IDRX_API_KEY,
    IDRX_SECRET_KEY: process.env.IDRX_SECRET_KEY,
    SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL,
  },
};

export default nextConfig;
