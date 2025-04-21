'use client'
import { useAccount } from "wagmi";
import { useConnectModal } from "@xellar/kit";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

    // Only render after component has mounted
    if (!mounted) {
        return null;
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-6">Welcome to Lisk Challenge</h1>
                    <button
                        onClick={open}
                        className="bg-blue-500 text-white p-4 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Connect Wallet
                    </button>
                </div>
            </div>
        );
    }

    // This will only render briefly before the redirect happens
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-pulse text-gray-500">Redirecting...</div>
        </div>
    );
}