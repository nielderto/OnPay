'use client'
import { useConnectModal } from "@xellar/kit";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Loading from "@/app/loading";


export default function LoginPage() {
    const { open } = useConnectModal();
    const { isConnected, isConnecting } = useAccount();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (isConnected) {
            setIsRedirecting(true);
            redirect('/homepage');
        }
    }, [isConnected]);

    if (isConnecting || isRedirecting) {
        return <Loading />;
    }

    return (
                <button 
                onClick={open}
                className="bg-blue-500 text-white px-8 py-4 rounded-md hover:bg-blue-600 transition-colors text-lg md:text-l mb-5">
                    Connect Wallet
                </button>
    );
}