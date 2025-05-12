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
          <div className="flex flex-col items-center gap-2">
            <h2 className={`${dmSans.className} text-4xl lg:text-8xl font-bold tracking-tight`}>
              <span className="text-blue-500">Smart Transfers</span>  for a Digital World
            </h2>
            <h3 className="text-gray-600 text-center mb-8 mt-10 font-bold text-2xl lg:text-3xl">
            Effortless payments for the modern age. Send money as easily as sending a text—no technical knowledge required.            </h3>
          </div>
          <LoginButton />

          
    <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[8px] rounded-t-xl h-[172px] max-w-[301px] md:h-[294px] md:max-w-[512px]">
        <div className="rounded-lg overflow-hidden h-[156px] md:h-[278px] bg-white dark:bg-gray-800">
        <Image src="/desktop.png" width={512} height={278} className="dark:hidden h-[156px] md:h-[278px] w-full rounded-lg" alt="" ></Image>
        </div>
    </div>
    <div className="relative mx-auto bg-gray-900 dark:bg-gray-700 rounded-b-xl rounded-t-sm h-[17px] max-w-[351px] md:h-[21px] md:max-w-[597px]">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-xl w-[56px] h-[5px] md:w-[96px] md:h-[8px] bg-gray-800"></div>
    </div>

        </section>
        <section className="mt-16 animate-bounce" aria-label="Scroll down indicator">
        <MoveDown color="black" size={32} className="md:w-8 md:h-8 lg:w-10 lg:h-10" />
      </section>
      </main>
        </>

    )
}
