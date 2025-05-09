'use client'
import Logout from "./Logout";
import SendFunds from "./Send";
import Topup from "./Topup";
import Home from "./Home";
import Link from "next/link";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function Navbar(){
    const pathname = usePathname();
    const isHomePage = pathname === "/homepage";

    return (
        <>
            {/* Mobile Navbar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center p-4 bg-white/40 backdrop-blur-sm border-t border-gray-200/50 shadow-sm max-w-[90%] mx-auto rounded-t-3xl">
                    <Home />
                    <SendFunds />
                    <Topup />
                    <Logout />
            </div>

            {/* Laptop Navbar */}
            <div className="hidden md:flex fixed top-0 z-50 left-0 right-0 justify-between items-center p-4 bg-white/40 backdrop-blur-sm border-b border-gray-200/50 shadow-sm lg:w-[55rem] mx-auto rounded-3xl mt-4">
                <Link 
                    href="/homepage" 
                    className="text-xl font-bold hover:text-gray-600 transition-colors group flex items-center gap-2"
                    prefetch
                >
                    {isHomePage ? (
                        "OnPay"
                    ) : (
                        <>
                            <ArrowLeft className="w-5 h-5" />
                        </>
                    )}
                </Link>
                <div className="flex items-center gap-4">
                    <Logout />
                </div>
            </div>
        </>
    )
}
