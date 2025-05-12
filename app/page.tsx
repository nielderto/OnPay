import { Suspense } from "react";
import { DM_Sans } from 'next/font/google';
import { MoveDown } from "lucide-react";
import Link from "next/link";
import DevPage from "@/components/cards/DevPage";
import Features from "@/components/landingPage/Features";
import HowItWorks from "@/components/landingPage/HowItWorks";

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  preload: true,
  display: 'swap',
});

// Loading component for developer cards
const DevCardsLoading = () => (
  <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
    {[1, 2].map((i) => (
      <div key={i} className="w-64 h-64 bg-gray-200 rounded-lg animate-pulse" />
    ))}
  </div>
);

export default function Home() {
  return (
    <>
      <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center ">
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
          <Link
            href="/login"
            aria-label="Login to your account"
            className="bg-blue-500 text-white px-8 py-4 rounded-md hover:bg-blue-600 transition-colors text-lg md:text-xl mb-5"
          >
            Login
          </Link>
        </section>

        <section className="mt-16 animate-bounce" aria-label="Scroll down indicator">
          <MoveDown color="black" size={32} className="md:w-8 md:h-8 lg:w-10 lg:h-10" />
        </section>
      </main>

      <HowItWorks />
      <Features />

      <footer className="w-screen bg-blue-500 text-white py-12 min-h-screen flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className={`${dmSans.className} text-5xl font-bold mb-8`}>Developed By</h2>
          <Suspense fallback={<DevCardsLoading />}>
            <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
              <DevPage
                name="Otneil Xander Susanto"
                role="Frontend Developer"
                imageUrl="/otniel.jpeg"
                socialMedia={[
                  "https://github.com/nielderto",
                  "www.linkedin.com/in/nielderto",
                  "https://x.com/nieldert0",
                  "https://t.me/nielderto",
                ]}
              />
              <DevPage
                name="Filbert Owen Susanto"
                role="Backend Developer"
                imageUrl="/oween.jpg"
                socialMedia={[
                  "https://github.com/FOwen123",
                  "www.linkedin.com/in/filbert-owen-susanto-470564270",
                  "https://t.me/haowen34",
                  "https://instagram.com/filbertowen",
                ]}
              />
            </div>
          </Suspense>
        </div>
      </footer>
    </>
  );
}
