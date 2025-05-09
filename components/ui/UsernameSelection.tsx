"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { ArrowRight, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { checkENSNameAvailable, registerENSName} from "@/lib/ens-service"

export default function UsernameSelection() {
    const { address } = useAccount()
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [isChecking, setIsChecking] = useState(false)
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
    const [isRegistering, setIsRegistering] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [suggestedNames, setSuggestedNames] = useState<string[]>([])

    // Generate suggested names on component mount
    useEffect(() => {
        if (address) {
            const addr = address.toLowerCase()
            const shortAddr = `${addr.slice(2, 6)}${addr.slice(-4)}`
            const timestamp = Math.floor(Date.now() / 1000).toString().slice(-5)

            setSuggestedNames([
                `user${timestamp}`,
                `wallet${shortAddr}`,
                `account${timestamp}`,
                `user${shortAddr}`,
                `lisk${timestamp}`
            ])

            // Check if user already has an ENS name
            checkExistingName()
        }
    }, [address])

    const checkExistingName = async () => {
        if (!address) return

        try {
            const existingName = await checkENSNameAvailable(address)
            if (existingName) {
                // User already has a name, redirect to homepage
                router.push("/homepage")
            }
        } catch (error) {
            console.error("Error checking existing name:", error)
        }
    }

    const checkAvailability = async (name: string) => {
        if (!name) return

        setIsChecking(true)
        setError(null)
        setIsAvailable(null)

        try {
            // Add .lisk.eth suffix if not present
            const fullName = name.endsWith(".lisk.eth") ? name : `${name}.lisk.eth`

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
    }

    const registerUsername = async () => {
        if (!username || !isAvailable || !address) return

        setIsRegistering(true)
        setError(null)

        try {
            // Add .lisk.eth suffix if not present
            const fullName = username.endsWith(".lisk.eth") ? username : `${username}.lisk.eth`

            // Register the name using the ENS service
            await registerENSName(fullName, address)

            // Redirect to homepage
            router.push("/homepage")
        } catch (error: any) {
            console.error("Error registering ENS name:", error)
            setError(error.message || "Error registering username. Please try again.")
        } finally {
            setIsRegistering(false)
        }
    }

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim().toLowerCase()
        // Only allow alphanumeric characters and numbers
        const sanitized = value.replace(/[^a-z0-9]/g, '')
        setUsername(sanitized)

        // Reset availability status when input changes
        if (isAvailable !== null) {
            setIsAvailable(null)
        }
    }

    const handleCheckAvailability = () => {
        if (username.length >= 3) {
            checkAvailability(username)
        } else {
            setError("Username must be at least 3 characters")
        }
    }

    const handleSuggestionClick = (suggestion: string) => {
        setUsername(suggestion)
        checkAvailability(suggestion)
    }

    return (
        <div className="relative z-10 bg-white rounded-xl shadow-lg border border-gray-100 p-8 max-w-md w-full">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Choose Your Username</h1>
                <p className="text-gray-600 mt-2">Select a unique ENS username that will be registered as {username ? `${username}.lisk.eth` : "yourname.lisk.eth"}</p>
            </div>

            <div className="mb-6">
                <div className="flex">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={username}
                            onChange={handleUsernameChange}
                            placeholder="Enter username"
                            className="w-full px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            disabled={isRegistering}
                        />
                        {username && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                .lisk.eth
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleCheckAvailability}
                        disabled={!username || username.length < 3 || isChecking || isRegistering}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-r-lg border border-gray-300 border-l-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isChecking ? <Loader2 className="w-5 h-5 animate-spin" /> : "Check"}
                    </button>
                </div>

                {isAvailable === true && (
                    <div className="mt-2 flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm">{username}.lisk.eth is available!</span>
                    </div>
                )}

                {isAvailable === false && !error && (
                    <div className="mt-2 flex items-center text-red-600">
                        <XCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm">{username}.lisk.eth is not available</span>
                    </div>
                )}

                {error && (
                    <div className="mt-2 text-sm text-red-600">{error}</div>
                )}

                <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Suggested names:</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestedNames.map((name) => (
                            <button
                                key={name}
                                onClick={() => handleSuggestionClick(name)}
                                className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                disabled={isRegistering}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <button
                onClick={registerUsername}
                disabled={!isAvailable || isRegistering}
                className="w-full bg-blue-500 text-white px-6 py-4 rounded-lg hover:bg-blue-600 transition-colors text-lg font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
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

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    This will register <strong>{username ? `${username}.lisk.eth` : "yourname.lisk.eth"}</strong> as your ENS name
                </p>
            </div>
        </div>
    )
} 