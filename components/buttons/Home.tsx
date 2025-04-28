'use client'
import { useRouter } from "next/navigation";
import { House } from "lucide-react";

export default function Home() {
    const router = useRouter();
    return (
        <button 
            onClick={() => router.push('/homepage')}
            className="text-black flex flex-col items-center justify-center gap-0.5 w-16">
            <House
                className="w-4 h-4 sm:w-5 sm:h-5"
            />
            <span className="text-xs sm:text-sm">Home</span>
        </button>
    );
} 