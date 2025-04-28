'use client'
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SendHorizontal } from "lucide-react";

export default function Send(){
    const router = useRouter();
    return (
        <button 
        onClick={() => router.push('/send')}
        className="text-black flex flex-col items-center justify-center gap-0.5 w-16">
            <SendHorizontal className="w-4 h-4 sm:w-5 sm:h-5" color="black"/>
            <span className="text-xs sm:text-sm">Send</span>
        </button>
    )
}
