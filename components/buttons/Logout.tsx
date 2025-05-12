'use client';
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDisconnect } from "wagmi";  
import Cookies from "js-cookie";

export default function Logout() {
    const { disconnect } = useDisconnect();
    const router = useRouter();

    const handleLogout = () => {
        disconnect();
        Cookies.remove("isConnected", {path:"/"})
        router.push('/');
    };

    return (
        <button 
            onClick={handleLogout}
            className="text-black flex flex-col items-center justify-center gap-0.5 w-16">
            <LogOut
                className="w-4 h-4 sm:w-5 sm:h-5" color="red"
            />
            <span className="text-xs sm:text-sm text-red-500">Logout</span>
        </button>
    );
}
