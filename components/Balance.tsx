'use client'

import { useAccount, useBalance } from "wagmi";
import { liskSepolia } from "viem/chains";
import { useState } from "react";

export default function Balance({ color = 'black' }){
    const {address} = useAccount();
    const {data: balance} = useBalance({
        address: address as `0x${string}`,
        chainId: liskSepolia.id,
        token: '0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661', 
    });
    const [copied, setCopied] = useState(false);

    const formattedBalance = balance ? 
        new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4
        }).format(Number(balance.formatted)) : '0.00';

    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className={`text-${color}`}>
            {formattedBalance} IDRX 
            {address && (
                <span 
                    onClick={copyAddress} 
                    className="cursor-pointer hover:underline ml-1"
                    title="Click to copy address"
                >
                    ({address.slice(0, 6)}...{address.slice(-4)})
                    {copied && <span className="ml-1 text-xs">✓</span>}
                </span>
            )}
        </div>
    );
}
