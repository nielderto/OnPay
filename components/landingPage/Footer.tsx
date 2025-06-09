import { DM_Sans } from "next/font/google";
import DevPage from "@/components/cards/DevPage";

const dmSans = DM_Sans({
    subsets: ['latin'],
    preload: true,
    display: 'swap',
});

export default function FooterPage() {
    return (
        <>
        <footer className="w-screen bg-blue-500 text-white py-12 min-h-screen flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className={`${dmSans.className} text-5xl font-bold mb-8`}>Developed By</h2>
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
              <DevPage
                name="Nathanael Firgo"
                role="Backend Developer"
                imageUrl="/onel.png"
                socialMedia={[
                  "https://github.com/FOwen123",
                  "www.linkedin.com/in/filbert-owen-susanto-470564270",
                  "https://t.me/haowen34",
                  "https://instagram.com/filbertowen",
                ]}
              />
            </div>
        </div>
      </footer>        
        </>
    ) 
}
