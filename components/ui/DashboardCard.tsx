'use client'
import Balance from "@/components/data/Balance";
import { Plus, Send, QrCode, Copy, ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import Address from "../data/Address";
import { useState } from "react";

export default function DashboardCard() {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleCopyAddress = () => {
    const addressElement = document.querySelector('[data-address]');
    if (addressElement) {
      copyToClipboard(addressElement.textContent || '');
    }
    setIsActionsOpen(false);
  };

  const handleViewExplorer = () => {
    const addressElement = document.querySelector('[data-address]');
    if (addressElement) {
      window.open(`https://liskscan.com/address/${addressElement.textContent}`, '_blank');
    }
    setIsActionsOpen(false);
  };

  return (
    <div className="relative mt-32">
      <div className="w-[55rem] mx-auto">
        {/* Top Gradient Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl p-8 sm:p-10 text-white flex flex-col gap-6">
          <div className="flex justify-between items-start w-full">
            <span className="text-lg text-white/90 font-medium">Available Balance</span>
            <div className="relative">
              <button 
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                className="flex items-center gap-1 text-white/90 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
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
          
          <div className="flex flex-col gap-3 w-full">
            <span className="text-4xl sm:text-5xl font-bold tracking-tight">
              <Balance color="white"/>
            </span>
            <div className="flex items-center gap-2 py-2 px-3 w-fit">
              <span data-address><Address/></span>
            </div>
          </div>
        </div>

        {/* Bottom White Section */}
        <div className="bg-white rounded-b-2xl w-[55rem] mx-auto shadow-lg">
          <div className="grid grid-cols-3 border-t border-gray-200">
            <Link
              href="/send"
              className="flex flex-col items-center py-6 hover:bg-blue-100 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-center w-10 h-10 mb-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium">Send</span>
            </Link>
            <Link
              href="/receive"
              className="flex flex-col items-center py-6 hover:bg-blue-100 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-center w-10 h-10 mb-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <QrCode className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium">Receive</span>
            </Link>
            <Link
              href="/topup"
              className="flex flex-col items-center py-6 hover:bg-blue-100 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-center w-10 h-10 mb-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium">Topup</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
