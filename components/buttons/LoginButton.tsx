'use client'
import { useConnectModal } from "@xellar/kit";

export default function LoginButton(){
    const {open} = useConnectModal();
    
    return (
        <button onClick={open} 
        className="bg-blue-500 text-white p-4 rounded-md hover:bg-blue-600 transition-colors">
            Login
        </button>
    )
}
