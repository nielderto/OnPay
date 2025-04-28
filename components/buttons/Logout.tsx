'use client';
import {useDisconnect} from 'wagmi';
import { useRouter } from 'next/navigation';
import { LogOutIcon } from 'lucide-react';

export default function Logout(){
    const {disconnect} = useDisconnect();
    const router = useRouter();

    const handleLogout = () => {
        disconnect();
        router.push('/login');
    };

    return (
        <button 
        onClick={handleLogout} 
        className="text-black px-2 py-1.5 rounded-lg flex flex-col sm:flex-row items-center 
                  transition-all duration-200 hover:scale-105 active:scale-95
                  text-xs sm:text-sm font-medium
                  h-[56px] w-[56px] sm:h-auto sm:w-auto sm:min-w-[80px]
                  justify-center gap-0.5 shadow-sm hover:shadow-md sm:shadow-none sm:hover:shadow-none">
            <LogOutIcon color="red" />
            <span className="sm:text-red-600 sm:text-sm text-red-600">Sign Out</span>
        </button>
    )
}
