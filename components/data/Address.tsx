'use client'
import { useAccount } from "wagmi";
import {useState} from 'react';

export default function Address() {
    const {address} = useAccount();
    const [copied, setCopied] = useState(false);

    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div>
            {address && (
                <span 
                    onClick={copyAddress} 
                    className="cursor-pointer hover:underline"
                    title="Click to copy address"
                >
                    {address.slice(0, 6)}...{address.slice(-4)}
                    {copied && <span className="ml-1 text-xs">✓</span>}
                </span>
            )}
        </div>
    );
}
