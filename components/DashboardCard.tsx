'use client'
import Balance from "@/components/Balance";
import { HandCoins, SendHorizontal, CirclePlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export default function DashboardCard() {
  const router = useRouter();
  const {address} = useAccount();

  return (
    <div className="bg-blue-500 rounded-2xl w-full p-4 sm:p-6 max-w-[95%] sm:max-w-xl sm:mt-35 mx-2 sm:mx-auto text-white flex flex-col gap-4 sm:gap-6 shadow-lg">
      <div className="flex flex-col gap-2">
        <span className="text-2xl sm:text-4xl font-bold">Balance 
          
        </span>
        <div className="flex items-end gap-2">
          <span className="text-base sm:text-lg"><Balance color="gray-300"/></span>
        </div>
      </div>
      <div className="flex gap-2 sm:gap-4 w-full">
        <button
          onClick={() => router.push("/send")}
          className="flex-1 bg-white text-blue-500 rounded-xl py-3 sm:py-4 flex flex-col items-center shadow-md hover:scale-105 transition-all"
        >
          <SendHorizontal className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
          <span className="font-medium text-sm sm:text-base">Send</span>
        </button>
        <button
          onClick={() => router.push("/receive")}
          className="flex-1 bg-white text-blue-500 rounded-xl py-3 sm:py-4 flex flex-col items-center shadow-md hover:scale-105 transition-all"
        >
          <HandCoins className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
          <span className="font-medium text-sm sm:text-base">Receive</span>
        </button>
        <button
          onClick={() => router.push("/topup")}
          className="hidden sm:flex flex-1 bg-white text-blue-500 rounded-xl py-4 flex-col items-center shadow-md hover:scale-105 transition-all"
        >
          <CirclePlusIcon className="w-6 h-6 mb-1" />
          <span className="font-medium">Topup</span>
        </button>
      </div>
    </div>
  );
} 