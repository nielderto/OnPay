"use client"

import { useConnectModal } from "@xellar/kit"
import { useAccount } from "wagmi"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import Loading from "@/app/loading"
import { ArrowRight, Shield } from "lucide-react"

export default function LoginPage() {
  const { open } = useConnectModal()
  const { isConnected, isConnecting } = useAccount()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (isConnected) {
      setIsRedirecting(true)
      redirect("/homepage")
    }
  }, [isConnected])

  if (isConnecting || isRedirecting) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        {/* Hexagon grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15L30 0z' fillRule='evenodd' stroke='%230000FF' strokeWidth='2' fill='none'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        ></div>
      </div>

      <div className="relative z-10 bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Login</h1>
          <p className="text-gray-600 mt-2">Connect your wallet to access your account</p>
        </div>

        <button
          onClick={open}
          className="w-full bg-blue-500 text-white px-6 py-4 rounded-lg hover:bg-blue-600 transition-colors text-lg font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          Connect Wallet
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Supported wallets:</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {["MetaMask", "Phantom", "Coinbase", "Trust Wallet"].map((wallet) => (
              <div key={wallet} className="px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-600">
                {wallet}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security note */}
      <div className="relative z-10 mt-6 bg-white rounded-lg p-4 border border-gray-100 shadow-sm flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
          <Shield className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Secure Connection</h3>
          <p className="text-sm text-gray-600">Your wallet connects securely without sharing your private keys</p>
        </div>
      </div>

      <div className="mt-2">© {new Date().getFullYear()} ONPAY. All rights reserved.</div>
    </div>
  )
}