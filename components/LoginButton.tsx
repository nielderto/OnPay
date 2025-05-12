"use client"
import { useAccount } from "wagmi"
import { useConnectModal } from "@xellar/kit"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

export default function LoginButton() {
    const { open } = useConnectModal()
    const { isConnected } = useAccount()  
    const router = useRouter();

    useEffect(() => {   
        if (isConnected) {
            Cookies.set("isConnected", "true", {path: "/"})
            router.push("/homepage")
        } else {
            Cookies.remove("isConnected")
        }
    }, [isConnected])
    
    
    return (
        <button 
        onClick={() => {
            open?.()
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
            Login
        </button>
    )
}
