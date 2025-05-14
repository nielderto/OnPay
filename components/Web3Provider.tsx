'use client'

import React, { useState, useEffect, lazy, Suspense } from "react";
import { Config, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { XellarKitProvider, defaultConfig, darkTheme } from "@xellar/kit";
import { liskSepolia } from "viem/chains";

// Lazy load non-critical components
const LazyXellarKitProvider = lazy(() => import("@xellar/kit").then(mod => ({ 
  default: ({ children, theme }: { children: React.ReactNode, theme: any }) => 
    <mod.XellarKitProvider theme={theme}>{children}</mod.XellarKitProvider>
})));

const config = defaultConfig({
  appName: "Xellar",
  walletConnectProjectId: process.env.WALLET_CONNECT_PROJECT_ID || "",
  xellarAppId: process.env.XELLAR_APP_ID || "",
  xellarEnv: "sandbox",
  ssr: true,
  chains: [liskSepolia]
}) as Config;

// Create query client outside component to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

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
                <Suspense fallback={<div>Loading...</div>}>
                    <LazyXellarKitProvider theme={darkTheme}>
                        {children}
                    </LazyXellarKitProvider>
                </Suspense>
            </QueryClientProvider>
        </WagmiProvider>
    );
};