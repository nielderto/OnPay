import { Suspense } from "react";
import { DM_Sans } from 'next/font/google';
import { MoveDown, LogInIcon, UserRoundPlusIcon, SendIcon } from "lucide-react";
import Image from 'next/image';
import Link from "next/link";
import { HyperText } from "@/components/magicui/hyper-text";
import DevPage from "@/components/cards/DevPage";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import Navbar from "@/components/buttons/Navbar";

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
        <section className="max-w-4xl w-full mx-auto">
          <div className="flex flex-col items-center gap-2">
            <h2 className={`${dmSans.className} text-4xl md:text-8xl font-bold tracking-tight`}>
              Send Value, Not Gas 
            </h2>
            <h3 className="text-black text-center mb-6 font-bold text-2xl">
              Powered by OnPay
            </h3>
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

      <section className="flex flex-col items-center justify-center min-h-screen px-6 pb-10 text-center" aria-label="How it works section">
        <header className="mb-15 mt-15">
          <h2 className="font-bold">HOW IT WORKS</h2>
          <h3 className={`${dmSans.className} font-bold text-2xl md:text-4xl lg:text-5xl`}>
            Payments done in three steps
          </h3>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          <article className="bg-white p-6 md:p-8 rounded-lg border">
            <div className="flex flex-col items-center">
              <LogInIcon color="#0055FF" className="w-10 h-10 md:w-12 md:h-12 mb-4" />
              <h2 className={`${dmSans.className} text-xl md:text-2xl font-bold mb-4`}>Login</h2>
              <p className="text-gray-600 text-center">
                Log in using your email, Google, or crypto wallet.
                New here? We'll set up your wallet instantly — no extra steps.
              </p>
            </div>
          </article>

          <article className="bg-white p-6 md:p-8 rounded-lg border">
            <div className="flex flex-col items-center">
              <UserRoundPlusIcon color="#0055FF" className="w-10 h-10 md:w-12 md:h-12 mb-4" />
              <h2 className={`${dmSans.className} text-xl md:text-2xl font-bold mb-4`}>Add funds</h2>
              <p className="text-gray-600 text-center">
                Topup IDRX to your account using bank transfer (BNI, BRI, BCA, etc).
              </p>
            </div>
          </article>

          <article className="bg-white p-6 md:p-8 rounded-lg border">
            <div className="flex flex-col items-center">
              <SendIcon color="#0055FF" className="w-10 h-10 md:w-12 md:h-12 mb-4" />
              <h2 className={`${dmSans.className} text-xl md:text-2xl font-bold mb-4`}>Send</h2>
              <p className="text-gray-600 text-center">
                Make transactions using your IDRX and nothing else.
              </p>
            </div>
          </article>
        </div>
      </section>

      <footer className="w-screen bg-blue-500 text-white py-12">
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
