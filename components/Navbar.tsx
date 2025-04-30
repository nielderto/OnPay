import Logout from "./buttons/Logout";
import SendFunds from "./buttons/Send";
import Topup from "./buttons/Topup";
import Home from "./buttons/Home";
import Link from "next/link";

export default function Navbar(){
    return (
        <>
            {/* Mobile Navbar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200/50 shadow-lg max-w-[90%] mx-auto rounded-t-3xl">
                <Home />
                <SendFunds />
                <Topup />
                <Logout />
            </div>

            {/* Laptop Navbar */}
            <div className="hidden md:flex fixed top-0 left-0 right-0 justify-between items-center p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-lg max-w-[60%] mx-auto rounded-b-3xl mt-2">
                <Link 
                    href="/homepage" 
                    className="text-xl font-bold hover:text-gray-600 transition-colors"
                    prefetch
                >
                    OnPay
                </Link>
                <div className="flex items-center gap-2">
                    <Logout />
                </div>
            </div>
        </>
    )
}
