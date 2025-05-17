"use client"
import { useAccount } from "wagmi"
import { useConnectModal } from "@xellar/kit"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

export default function LoginButton() {
    const { open } = useConnectModal()
    const { isConnected, address } = useAccount()
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isConnected) {
            setIsLoading(true);
            Cookies.set("isConnected", "true", { path: "/" })
            
            // Start navigation to homepage immediately
            router.push("/homepage");
            
            // Check ENS in the background
            fetch(`https://ens-gateway.onpaylisk.workers.dev/api/ens-lookup/${address}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.name) {
                        // Only redirect to username page if no ENS name
                        router.push("/username")
                    }
                })
                .catch(error => {
                    console.error("ENS lookup failed:", error);
                    // Continue with homepage if ENS lookup fails
                })
                .finally(() => {
                    setIsLoading(false);
                })
        } else {
            Cookies.remove("isConnected")
            setIsLoading(false);
        }
    }, [isConnected, address, router])

    return (
        <button
            onClick={() => {
                open?.()
            }}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? "Connecting..." : "Login"}
        </button>
    )
}
