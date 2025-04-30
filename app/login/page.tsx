'use client'
import { useConnectModal } from "@xellar/kit";
import { MoveDown, Lock, LogInIcon, UserRoundPlusIcon, SendIcon } from "lucide-react";
import { useAccount } from "wagmi";
import { Suspense, useEffect, useState } from "react";
import { DM_Sans } from 'next/font/google';
import { HyperText } from "@/components/magicui/hyper-text";
import Image from 'next/image';
import DevPage from "@/components/DevPage";
import { redirect } from "next/navigation";
import Loading from "../loading";
const dmSans = DM_Sans({ subsets: ['latin'] });

export default function LoginPage() {
    const { open } = useConnectModal();
    const { isConnected } = useAccount();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (isConnected) {
            setIsRedirecting(true);
            // Add a small delay to show the loading state
            setTimeout(() => {
                redirect('/homepage');
            }, 500);
        }
    }, [isConnected]);

    if (isRedirecting) {
        return <Loading />;
    }
    
    if(!isConnected){
    return (
        <>
        <div className="flex flex-col items-center mt-5">
        <h1 className={`text-2xl md:text-5xl lg:text-3xl font-bold mb-4 border-b-2 `}>OnPay</h1>
        </div>
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <div className="flex flex-col items-center justify-center text-center w-full max-w-4xl mx-auto">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="flex flex-row items-center justify-center gap-2">
                    <Image src="/idrx.svg" alt="idrx" width={40} height={40} />
                    <Image src="/lsk.svg" alt="lsk" width={40} height={40} />
                    <Image src="/ether.svg" alt="idrx" width={40} height={40} />
                        </div>
                    <h2 className={`${dmSans.className} text-2xl md:text-4xl lg:text-6xl font-bold mb-8`}>
                    Send Value, Not Gas — Powered by <HyperText>OnPay</HyperText>
                    </h2>
                    </div>
                    <button
                        onClick={open}
                        className="bg-blue-500 text-white px-8 py-4 rounded-md hover:bg-blue-600 transition-colors text-lg md:text-l mb-5">
                        Login
                    </button>
                </div>

                <div className="mt-16">
                    <MoveDown color="#0055FF" size={32} className="md:w-8 md:h-8 lg:w-10 lg:h-10" />
                </div>
            </div>
            
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <div className="flex flex-col items-center justify-center gap-4 mb-12">
                    <h2 className="font-bold">How it works</h2>
                    <h3 className={` ${dmSans.className} font-bold text-3xl md:text-4xl lg:text-5xl text-center`}>Payments done in <br />three steps</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
                    <div className="bg-gray-80 p-6 md:p-8 rounded-lg border-1 ">
                        <div className="flex flex-col items-center">
                            <LogInIcon color="#0055FF" className="w-10 h-10 md:w-12 md:h-12 mb-4" />
                            <h2 className={` ${dmSans.className} text-xl md:text-2xl font-bold mb-4`}>Login</h2>
                        </div>
                        <p className="text-gray-600 text-center">
                        Log in using your email, Google, or crypto wallet.
                        New here? We'll set up your wallet instantly — no extra steps.
                        </p>
                    </div>

                    <div className="bg-gray-80 p-6 md:p-8 rounded-lg border-1 ">
                        <div className="flex flex-col items-center">
                            <UserRoundPlusIcon color="#0055FF" className="w-10 h-10 md:w-12 md:h-12 mb-4" />
                            <h2 className={`${dmSans.className} text-xl md:text-2xl font-bold mb-4`}>Add funds</h2>
                        </div>
                        <p className="text-gray-600 text-center">
                           Topup IDRX to your account using bank transfer (BNI, BRI, BCA, etc).
                        </p>
                    </div>

                    <div className="bg-gray-80 p-6 md:p-8 rounded-lg border-1 ">
                        <div className="flex flex-col items-center">
                            <SendIcon color="#0055FF" className="w-10 h-10 md:w-12 md:h-12 mb-4" />
                            <h2 className={`${dmSans.className} text-xl md:text-2xl font-bold mb-4`}>Send</h2>
                        </div>
                        <p className="text-gray-600 text-center">
                           Make transactions using your IDRX and nothing else.
                        </p>
                    </div>
                </div>

                <div className="w-screen bg-blue-500 text-white py-12 mt-70">
                    <div className="max-w-6xl mx-auto px-4">
                        <h2 className={`${dmSans.className} text-5xl font-bold text-center mb-8`}>Developed By</h2>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
                        <Suspense fallback={<div>Loading...</div>}>
                        <DevPage name="Otneil Xander Susanto" role="Frontend Developer" imageUrl="/otniel.jpeg" socialMedia={["https://github.com/nielderto", "www.linkedin.com/in/nielderto", "https://x.com/XOtniel23798", "https://t.me/nielderto"]}/>
                        <DevPage name="Filbert Owen Susanto" role="Backend Developer" imageUrl="/oween.jpg" socialMedia={["https://github.com/FOwen123", "www.linkedin.com/in/filbert-owen-susanto-470564270", "https://t.me/haowen34", "https://instagram.com/filbertowen"]}/>
                        </Suspense>
                    </div>
                </div>
            </div>
        </>
)
    }
}