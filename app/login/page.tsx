'use client'
import { useAccount } from "wagmi";
import { useConnectModal } from "@xellar/kit";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {FastForward, MessageCircleQuestion, Minus, MoveDown, Lock, MonitorCheck} from "lucide-react";

export default function LoginPage(){
    const {isConnected} = useAccount();
    const {open} = useConnectModal();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && isConnected) {
            router.push('/homepage');
        }
    }, [isConnected, router, mounted]);

    if (!mounted) {
        return null;
    }

    if (!isConnected) {
        return (
            <>
            <div className="flex flex-col items-center min-h-screen mt-32">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">OnPay</h1>
                    <p className="text-gray-400"> The easiest, <span className="italic">fastest</span>, <br />seamless, payment app for you</p>
                    <button
                        onClick={open}
                        className="bg-blue-500 text-white p-4 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Login
                    </button>
                </div>

                <div className="mt-50">
                <MoveDown color="#0055FF" />
                </div>
            </div>

            <div className="flex items-center justify-center">
            <Minus color="#0055FF" size={100} />
            </div>
            
            <div className="flex flex-col items-center justify center min-h-screen">
                <div className="flex flex-row text-center">
                    <h1 className="font-bold text-4xl"> Why OnPay</h1>
                    <MessageCircleQuestion color="#0055FF"/>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 px-4 max-w-6xl w-full">
                    <div className="bg-blue-50 p-8 rounded-lg">
                        <div className="flex flex-col items-center">
                        <MonitorCheck color="#0055FF"/>
                        <h2 className="text-xl font-semibold mb-4">Simplicity</h2>
                        </div>
                        <p className="text-gray-600">
                            Experience hassle-free payments with our intuitive interface. 
                            No complex setups or technical knowledge required. 
                            Just connect and start sending money instantly.
                        </p>
                    </div>

                    <div className="bg-blue-50 p-8 rounded-lg">
                        <div className="flex flex-col items-center">
                        <FastForward color="#0055FF"/>
                        <h2 className="text-xl font-semibold mb-4">Quick</h2>
                        </div>
                        <p className="text-gray-600">
                            Transfer funds in seconds, not hours. Our lightning-fast 
                            blockchain technology ensures your transactions are processed 
                            immediately with minimal fees.
                        </p>
                    </div>

                    <div className="bg-blue-50 p-8 rounded-lg">
                        <div className="flex flex-col items-center">
                        <Lock color="#0055FF"/>
                        <h2 className="text-xl font-semibold mb-4">Secure & Private</h2>
                        </div>
                        <p className="text-gray-600">
                            Your security is our priority. Built on blockchain technology, 
                            every transaction is encrypted and protected. Your financial 
                            privacy remains in your control.
                        </p>
                    </div>
                </div>
            </div>

            
            </>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-pulse text-gray-500">Redirecting...</div>
        </div>
    );
}