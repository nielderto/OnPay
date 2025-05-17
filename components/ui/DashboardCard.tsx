'use client'
import Balance from "@/components/data/Balance";
import { Plus, Send, QrCode, Copy, ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import Address from "../data/Address";
import { useState, useEffect } from "react";
import UserGreeting from "../UserGreeting";
import { useAccount } from "wagmi";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardCard() {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const { address } = useAccount();
  const router = useRouter();
  const pathname = usePathname();

  // Prefetch all routes on component mount
  useEffect(() => {
    router.prefetch('/send');
    router.prefetch('/receive');
    router.prefetch('/topup');
  }, [router]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleCopyAddress = () => {
    if (address) {
      copyToClipboard(address);
    }
    setIsActionsOpen(false);
  };

  const handleViewExplorer = () => {
    if (address) {
      window.open(`https://sepolia-blockscout.lisk.com/address/${address}`, '_blank');
    }
    setIsActionsOpen(false);
  };

  const handleNavigation = async (path: string) => {
    if (pathname === path) return;
    await router.push(path);
  };

  return (
    <div className="relative flex flex-col items-center ">
      {address && <UserGreeting address={address} />}
      <div className="w-full sm:w-[26rem] lg:w-[60rem] mx-auto p-2 sm:p-6 md:p-8 lg:p-10">
        {/* Top Gradient Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl p-4 sm:p-8 md:p-10 text-white flex flex-col gap-4 sm:gap-6">
          <div className="flex justify-between items-start w-full">
            <div className="flex flex-col gap-2 sm:gap-[0.5rem] border-white">
              <span className="text-base sm:text-lg text-white/90 font-medium">Your Balance</span>
              <span className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                <Balance color="white"/>
              </span>
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                className="flex items-center gap-1 text-white/90 hover:text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                Actions
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {isActionsOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  <button
                    onClick={handleCopyAddress}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Address
                  </button>
                  <button
                    onClick={handleViewExplorer}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Explorer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom White Section */}
        <div className="bg-white rounded-b-2xl w-full shadow-lg">
          <div className="grid grid-cols-3 border-t border-gray-200">
            <button
              onClick={() => handleNavigation('/send')}
              className="flex flex-col items-center py-4 sm:py-6 hover:bg-blue-100 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 mb-1.5 sm:mb-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <Send className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <span className="text-xs sm:text-sm font-medium">Send</span>
            </button>
            <button
              onClick={() => handleNavigation('/receive')}
              className="flex flex-col items-center py-4 sm:py-6 hover:bg-blue-100 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 mb-1.5 sm:mb-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <span className="text-xs sm:text-sm font-medium">Receive</span>
            </button>
            <button
              onClick={() => handleNavigation('/topup')}
              className="flex flex-col items-center py-4 sm:py-6 hover:bg-blue-100 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 mb-1.5 sm:mb-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <span className="text-xs sm:text-sm font-medium">Topup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
