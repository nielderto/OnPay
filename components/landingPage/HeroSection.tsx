import Link from "next/link";
import { DM_Sans } from "next/font/google";
import { MoveDown } from "lucide-react";
import Image from "next/image";
import LoginButton from "../LoginButton";

const dmSans = DM_Sans({
  subsets: ['latin'],
  preload: true,
  display: 'swap',
});

export default function HeroSection() {
  return (
    <>
      <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-white">
        <div className="absolute inset-0 -z-10 bg-[#f8fafc]">
          <div className="absolute inset-0 bg-grid-black/[0.02] -z-10 bg-[size:20px_20px]"></div>
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent"></div>
        </div>

        <section className="max-w-4xl w-full mx-auto">
          <div className="flex flex-col items-center gap-4">
            {/* ONPAY Title with Highlight Effect */}
            <div className="relative">
              <h1 className={`${dmSans.className} text-6xl lg:text-9xl font-bold tracking-tight relative z-10`}>
                <span className="bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">ONPAY</span>
              </h1>
            </div>

            {/* Subtitle */}
            <h2 className={`${dmSans.className} text-3xl lg:text-6xl font-bold tracking-tight text-gray-800`}>
            Seamless Transactions Across Every Time Zone            
            </h2>

            {/* Catchphrase */}
            <div className="mt-4 mb-8 max-w-3xl">
              <p className="text-gray-600 text-center font-medium text-xl lg:text-2xl">
                <span className="text-blue-600">Borderless. Instant. Secure.</span> — Reimagining payments for the future of finance.
              </p>
            </div>

            {/* Login Button */}
            <div className="mt-4">
              <LoginButton />
            </div>
          </div>
        </section>

        <section className="mt-16 animate-bounce" aria-label="Scroll down indicator">
          <MoveDown color="black" size={32} className="md:w-8 md:h-8 lg:w-10 lg:h-10" />
        </section>
      </main>
    </>
  )
}
