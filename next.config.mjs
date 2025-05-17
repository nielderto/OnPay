/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        IDRX_API_KEY: process.env.IDRX_API_KEY,
        IDRX_SECRET_KEY: process.env.IDRX_SECRET_KEY,
        RELAYER_PRIVATE_KEY: process.env.RELAYER_PRIVATE_KEY,
        SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL,
        WALLET_CONNECT_PROJECT_ID: process.env.WALLET_CONNECT_PROJECT_ID,
        XELLAR_APP_ID: process.env.XELLAR_APP_ID,
        XELLAR_CLIENT_SECRET: process.env.XELLAR_CLIENT_SECRET,
    },
    devIndicators: false,
};

export default nextConfig; 