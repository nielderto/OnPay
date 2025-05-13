import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Web3Provider } from "@/components/Web3Provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense } from "react";
import Loading from "./loading";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: "OnPay",
  description: "A decentralized application built with Lisk",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://sepolia-blockscout.lisk.com" />
        <link rel="preconnect" href="https://accounts.google.com" />
        <link rel="preconnect" href="https://ens-gateway.onpaylisk.workers.dev" />
        <link rel="preconnect" href="https://dash-api.xellar.co" />
        
        <link rel="modulepreload" href="/_next/static/chunks/webpack.js" />
        <link rel="modulepreload" href="/_next/static/chunks/main.js" />
        <link rel="modulepreload" href="/_next/static/chunks/pages/_app.js" />
        
        <link rel="dns-prefetch" href="https://sepolia-blockscout.lisk.com" />
        <link rel="dns-prefetch" href="https://accounts.google.com" />
        <link rel="dns-prefetch" href="https://ens-gateway.onpaylisk.workers.dev" />
        <link rel="dns-prefetch" href="https://dash-api.xellar.co" />
      </head>
      <body className={`${inter.className} antialiased bg-[#f0f0f0] suppressHydrationWarning`}>
        <ErrorBoundary>
          <Web3Provider>
            <Suspense fallback={<Loading />}> 
              {children}
            </Suspense>
          </Web3Provider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
