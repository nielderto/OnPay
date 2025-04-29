'use client'
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CirclePlusIcon } from "lucide-react";

export default function Topup(){
    const router = useRouter();
    return (
        <button 
        onClick={() => router.push('/topup')}
        className="text-black flex flex-col items-center justify-center gap-0.5 w-16">
            <CirclePlusIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
            <span className="text-xs sm:text-sm">Topup</span>
        </button>
    )
}
