'use client'
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SendHorizontal } from "lucide-react";

export default function Send(){
    const router = useRouter();
    return (
        <button 
        onClick={() => router.push('/send')}
        className="text-black px-2 py-1.5 rounded-lg flex flex-col sm:flex-row items-center 
                  transition-all duration-200 hover:scale-105 active:scale-95
                  text-xs sm:text-sm font-medium
                  h-[56px] w-[56px] sm:h-auto sm:w-auto sm:min-w-[80px]
                  justify-center gap-0.5 shadow-sm hover:shadow-md sm:shadow-none sm:hover:shadow-none">
            <SendHorizontal color="black"/>
            <span>Send</span>
        </button>
    )
}
