"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import Logout from "./Logout";
import SendFunds from "./Send";
import Topup from "./Topup";
import Home from "./Home";
import Link from "next/link";
import { lookupENSName } from "@/lib/ens-service";
import { User } from "lucide-react";

export default function Navbar() {
    const { address } = useAccount()
    const [ensName, setEnsName] = useState<string | null>(null)

    useEffect(() => {
        const fetchEnsName = async () => {
            if (address) {
                try {
                    const name = await lookupENSName(address)
                    setEnsName(name)
                } catch (error) {
                    console.error("Error fetching ENS name:", error)
                }
            }
        }

        fetchEnsName()
    }, [address])

    return (
        <>
            {/* Mobile Navbar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center p-4 bg-white/40 backdrop-blur-sm border-t border-gray-200/50 shadow-lg max-w-[90%] mx-auto rounded-t-3xl">
                <Home />
                <SendFunds />
                <Topup />
                <Logout />

            </div>

            {/* Laptop Navbar */}
            <div className="hidden md:flex fixed top-0 z-50 left-0 right-0 justify-between items-center p-4 bg-white/40 backdrop-blur-sm border-b border-gray-200/50 shadow-lg max-w-[60%] mx-auto rounded-3xl mt-4">
                <Link
                    href="/homepage"
                    className="text-xl font-bold hover:text-gray-600 transition-colors"
                    prefetch
                >
                    OnPay
                </Link>
                <div className="flex items-center gap-4">
                    {ensName && (
                        <div className="flex items-center text-sm font-medium bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full">
                            <User className="w-3.5 h-3.5 mr-1.5" />
                            {ensName}
                        </div>
                    )}
                    <Logout />
                </div>
            </div>
        </>
    )
}
