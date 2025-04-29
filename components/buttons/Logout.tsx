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
        className="text-black flex flex-col items-center justify-center gap-0.5 w-16">
            <LogOutIcon className="w-4 h-4 sm:w-5 sm:h-5" color="red" />
            <span className="text-xs sm:text-sm text-red-600">Logout</span>
        </button>
    )
}
