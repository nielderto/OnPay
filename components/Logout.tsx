'use client';
import {useDisconnect} from 'wagmi';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
        className=" text-black px-2 py-1.5 rounded-lg flex flex-col items-center 
                  transition-all duration-200 hover:scale-105 active:scale-95
                  text-xs sm:text-sm font-medium
                  h-[56px] w-[56px] sm:w-auto sm:min-w-[80px]
                  justify-center gap-0.5 shadow-sm hover:shadow-md hover:bg-red-600 active:bg-red-700">
            <Image 
                src="/sign-out.svg" 
                alt="Sign out" 
                width={20} 
                height={20}
                className="w-5 h-5"
            />
            <span>Sign Out</span>
        </button>
    )
}
