'use client'
import Link from "next/link";
import { Home as HomeIcon } from "lucide-react";

export default function Home() {
    return (
        <Link 
            href="/homepage"
            className="text-black flex flex-col items-center justify-center gap-0.5 w-16">
            <HomeIcon
                className="w-4 h-4 sm:w-5 sm:h-5"
            />
            <span className="text-xs sm:text-sm">Home</span>
        </Link>
    );
} 