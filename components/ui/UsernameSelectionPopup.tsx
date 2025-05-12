"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { lookupENSName } from "@/lib/ens-service"
import UsernameSelection from "./UsernameSelection"
import { X } from "lucide-react"

export default function UsernameSelectionPopup() {
    const { address } = useAccount()
    const [showPopup, setShowPopup] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkUsername = async () => {
            if (!address) {
                setIsLoading(false)
                return
            }

            try {
                // Check if the user has an ENS name by looking up their address
                const existingName = await lookupENSName(address)
                setShowPopup(!existingName)
            } catch (error) {
                console.error("Error checking username:", error)
            } finally {
                setIsLoading(false)
            }
        }

        checkUsername()
    }, [address])

    if (isLoading || !showPopup) {
        return null
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative">
                <button
                    onClick={() => setShowPopup(false)}
                    className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>
                <UsernameSelection />
            </div>
        </div>
    )
} 