import Logout from "./buttons/Logout";
import SendFunds from "./buttons/Send";
import Topup from "./buttons/Topup";
import Home from "./buttons/Home";
import Link from "next/link";

export default function Navbar(){
    return (
        <>
            {/* Mobile Navbar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 flex justify-center items-center p-4 bg-white border-t border-gray-200 shadow-lg max-w-screen">
                <div className="flex items-center gap-4">
                    <Home />
                    <SendFunds />
                    <Topup />
                    <Logout />
                </div>
            </div>

            {/* Laptop Navbar */}
            <div className="hidden md:flex fixed top-0 left-0 right-0 justify-between items-center p-4 bg-white border-b border-gray-200 shadow-lg max-w-screen">
                <Link href="/" className="text-xl font-bold hover:text-gray-600 transition-colors">OnPay</Link>
                <div className="flex items-center gap-4">
                    <SendFunds />
                    <Logout />
                </div>
            </div>
        </>
    )
}
