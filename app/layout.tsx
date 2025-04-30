import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Web3Provider } from "@/components/Web3Provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";


const inter = Inter({
  subsets: ['latin']
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
      <body
        className={`${inter.className} antialiased bg-[#f0f0f0]`}>
        <ErrorBoundary>
          <Web3Provider>
            {children}
          </Web3Provider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
