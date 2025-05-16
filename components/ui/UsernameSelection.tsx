"use client"
import { ethers } from "ethers"
import { useState, useEffect } from "react"
import { useAccount, useWalletClient } from "wagmi"
import { ArrowRight, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { checkENSNameAvailable, registerENSName } from "@/lib/ens-service"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { clearENSCache } from "./AddressWithENS"
import { clearUserGreetingCache } from "../UserGreeting"

const usernameSchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .regex(/^[a-z0-9]+$/, "Username can only contain lowercase letters and numbers")
})

type UsernameFormData = z.infer<typeof usernameSchema>

interface UsernameSelectionProps {
    onSuccess?: () => void
}

export default function UsernameSelection({ onSuccess }: UsernameSelectionProps) {
    const { address } = useAccount()
    const { data: walletClient } = useWalletClient()
    const [isChecking, setIsChecking] = useState(false)
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
    const [isRegistering, setIsRegistering] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<UsernameFormData>({
        resolver: zodResolver(usernameSchema),
        defaultValues: {
            username: ""
        }
    })

    const username = watch("username")

    // Debounced ENS availability check
    useEffect(() => {
        if (!username || username.length < 3 || !/^[a-z0-9]+$/.test(username)) {
            setIsAvailable(null)
            setError(null)
            return
        }

        setIsChecking(true)
        setError(null)

        const handler = setTimeout(async () => {
            try {
                // Add .lisk.eth suffix if not present
                const fullName = username.endsWith(".lisk.eth") ? username : `${username}.lisk.eth`

                // Check availability using the ENS service
                const result = await checkENSNameAvailable(fullName)

                setIsAvailable(result.available)

                if (!result.available && result.reason) {
                    setError(result.reason)
                }
            } catch (error) {
                console.error("Error checking ENS availability:", error)
                setError("Error checking name availability. Please try again.")
                setIsAvailable(false)
            } finally {
                setIsChecking(false)
            }
        }, 500) // 500ms debounce

        return () => clearTimeout(handler)
    }, [username])

    const registerUsername = async (data: UsernameFormData) => {
        if (!data.username || !isAvailable || !address) return

        setIsRegistering(true)
        setError(null)

        try {
            // Add .lisk.eth suffix if not present
            const fullName = data.username.endsWith(".lisk.eth") ? data.username : `${data.username}.lisk.eth`

            // Register the name using the ENS service
            // Pass the walletClient to use Xellar Kit if available
            const xellarAddress = await walletClient?.getAddresses()
            console.log("address", xellarAddress)
            await registerENSName(fullName, walletClient)

            // Call onSuccess callback if provided
            onSuccess?.()

            // Clear both ENS caches for this address
            clearENSCache(address)
            clearUserGreetingCache(address)

            // Force a page refresh to ensure ENS name is properly displayed
            window.location.href = '/homepage'
        } catch (error: any) {
            console.error("Error registering ENS name:", error)
            setError(error.message || "Error registering username. Please try again.")
        } finally {
            setIsRegistering(false)
        }
    }

    const handleSuggestionClick = (suggestion: string) => {
        setValue("username", suggestion)
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="relative z-10 bg-white rounded-xl shadow-lg border border-gray-100 p-8 max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Choose Your Username</h1>
                    <p className="text-gray-600 mt-2">Select a unique ENS username that will be registered as {username ? `${username}.lisk.eth` : "yourname.lisk.eth"}</p>
                </div>

                <form onSubmit={handleSubmit(registerUsername)} className="mb-6">
                    <div className="relative w-full">
                        <input
                            {...register("username")}
                            type="text"
                            placeholder="Enter username"
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${error
                                ? 'border-red-500 focus:ring-red-500 bg-red-50'
                                : isAvailable
                                    ? 'border-green-500 focus:ring-green-500 bg-green-50'
                                    : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            disabled={isRegistering}
                        />
                        {username && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                .lisk.eth
                            </div>
                        )}
                        {isChecking && (
                            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                            </div>
                        )}
                    </div>

                    {errors.username && (
                        <div className="mt-2 text-sm text-red-600">{errors.username.message}</div>
                    )}

                    {isAvailable === true && !isChecking && username && (
                        <div className="mt-2 flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm">{username}.lisk.eth is available!</span>
                        </div>
                    )}

                    {isAvailable === false && !error && !isChecking && (
                        <div className="mt-2 flex items-center text-red-600">
                            <XCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm">{username}.lisk.eth is not available</span>
                        </div>
                    )}

                    {error && !isChecking && (
                        <div className="mt-2 text-sm text-red-600">
                            <XCircle className="w-4 h-4 mr-1 inline-block" />
                            {error}
                        </div>
                    )}

                    {/* Suggested Names Section */}
                    <div className="mt-6 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">Suggested usernames:</p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => handleSuggestionClick("satoshi21")}
                                className="px-2 py-1 text-sm bg-white text-blue-600 rounded-md hover:bg-blue-100 transition-colors border border-blue-200"
                            >
                                satoshi21
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSuggestionClick("haowen")}
                                className="px-2 py-1 text-sm bg-white text-blue-600 rounded-md hover:bg-blue-100 transition-colors border border-blue-200"
                            >
                                haowen
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSuggestionClick("nielderto")}
                                className="px-2 py-1 text-sm bg-white text-blue-600 rounded-md hover:bg-blue-100 transition-colors border border-blue-200"
                            >
                                nielderto
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!isAvailable || isRegistering || isChecking}
                        className="w-full mt-6 bg-blue-500 text-white px-6 py-4 rounded-lg hover:bg-blue-600 transition-colors text-lg font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isRegistering ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Registering...
                            </>
                        ) : (
                            <>
                                Register Username
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        This will register <strong>{username ? `${username}.lisk.eth` : "yourname.lisk.eth"}</strong> as your ENS name
                    </p>
                </div>
            </div>
        </div>
    )
} 