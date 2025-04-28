'use client'
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CirclePlusIcon } from "lucide-react";

export default function Topup(){
    const router = useRouter();
    return (
        <button 
        onClick={() => router.push('/topup')}
        className="text-black px-3 py-1.5 rounded-lg flex flex-col sm:flex-row items-center gap-1 sm:gap-2
                          transition-all duration-200 hover:scale-110 active:scale-95
                          text-xs sm:text-sm font-medium
                          h-[48px] w-[48px] sm:h-[56px] sm:min-w-[120px]
                          justify-center">
            <CirclePlusIcon className="w-5 h-5 sm:w-6 sm:h-6"/>
            <span>Topup</span>
        </button>
    )
}
