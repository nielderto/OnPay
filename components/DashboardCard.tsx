import Balance from "@/components/Balance";
import { HandCoins, RotateCcw } from "lucide-react";

export default function DashboardCard() {
  return (
    <div className="bg-[#7B3FE4] rounded-2xl w-screen p-6 max-w-xl sm:mt-35 mx-4 text-white flex flex-col gap-6 shadow-lg">
      <div className="flex flex-col gap-2">
        <span className="text-4xl font-bold ">Balance </span>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold"><Balance /></span>
        </div>
      </div>
      <div className="flex gap-4 w-full">
        <a
          href="/send"
          className="flex-1 bg-white text-[#7B3FE4] rounded-xl py-4 flex flex-col items-center shadow-md hover:scale-105 transition-all"
        >
          <RotateCcw className="w-6 h-6 mb-1" />
          <span className="font-medium">Send</span>
        </a>
        <a
          href="/receive"
          className="flex-1 bg-white text-[#7B3FE4] rounded-xl py-4 flex flex-col items-center shadow-md hover:scale-105 transition-all"
        >
          <HandCoins className="w-6 h-6 mb-1" />
          <span className="font-medium">Receive</span>
        </a>
        
      </div>
    </div>
  );
} 