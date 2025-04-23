'use client'

import React, { useState, useEffect } from "react";
import { Config, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { XellarKitProvider, defaultConfig, darkTheme } from "@xellar/kit";
import { liskSepolia} from "viem/chains";

const config = defaultConfig({
  appName: "Xellar",
  // Required for WalletConnect
  walletConnectProjectId: '6989cc47d81e04ffbb064f2e2bcc7240',
 
  // Required for Xellar Passport
  xellarAppId: 'f67a35ea-57c9-4c57-9afc-8194fa0f19fa',
  xellarEnv: "sandbox",
  ssr: true, // Use this if you're using Next.js App Router
  chains: [liskSepolia]
}) as Config;
 
const queryClient = new QueryClient();
 
export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <XellarKitProvider theme={darkTheme}>
                    {children}
                </XellarKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};