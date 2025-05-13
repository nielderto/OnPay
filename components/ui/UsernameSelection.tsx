"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { ArrowRight, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { checkENSNameAvailable, registerENSName } from "@/lib/ens-service"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

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
    const [isChecking, setIsChecking] = useState(false)
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
    const [isRegistering, setIsRegistering] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [suggestedNames, setSuggestedNames] = useState<string[]>([])

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

    // Generate suggested names on component mount
    useEffect(() => {
        if (address) {
            const addr = address.toLowerCase()
            const shortAddr = `${addr.slice(2, 6)}${addr.slice(-4)}`

            setSuggestedNames([
                `haowen`,
                `nielderto`,
            ])
        }
    }, [address])

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

    const registerUsername = async (data: UsernameFormData) => {
        if (!data.username || !isAvailable || !address) return

        setIsRegistering(true)
        setError(null)

        try {
            // Add .lisk.eth suffix if not present
            const fullName = data.username.endsWith(".lisk.eth") ? data.username : `${data.username}.lisk.eth`

            // Register the name using the ENS service
            await registerENSName(fullName, address)

            // Call onSuccess callback if provided
            onSuccess?.()
        } catch (error: any) {
            console.error("Error registering ENS name:", error)
            setError(error.message || "Error registering username. Please try again.")
        } finally {
            setIsRegistering(false)
        }
    }

    const handleCheckAvailability = () => {
        if (username.length >= 3) {
            checkAvailability(username)
        }
    }

    const handleSuggestionClick = (suggestion: string) => {
        setValue("username", suggestion)
        checkAvailability(suggestion)
    }

    return (
        <div className="relative z-10 bg-white rounded-xl shadow-lg border border-gray-100 p-8 max-w-md w-full">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Choose Your Username</h1>
                <p className="text-gray-600 mt-2">Select a unique ENS username that will be registered as {username ? `${username}.lisk.eth` : "yourname.lisk.eth"}</p>
            </div>

            <form onSubmit={handleSubmit(registerUsername)} className="mb-6">
                <div className="flex">
                    <div className="relative flex-1">
                        <input
                            {...register("username")}
                            type="text"
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
                        type="button"
                        onClick={handleCheckAvailability}
                        disabled={!username || username.length < 3 || isChecking || isRegistering}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-r-lg border border-gray-300 border-l-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isChecking ? <Loader2 className="w-5 h-5 animate-spin" /> : "Check"}
                    </button>
                </div>

                {errors.username && (
                    <div className="mt-2 text-sm text-red-600">{errors.username.message}</div>
                )}

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
                                type="button"
                                onClick={() => handleSuggestionClick(name)}
                                className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                disabled={isRegistering}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!isAvailable || isRegistering}
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
    )
} 