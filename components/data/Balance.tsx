'use client'

import { useAccount, useBalance } from "wagmi";
import { liskSepolia } from "viem/chains";

export default function Balance({ color = 'black' }){
    const {address} = useAccount();
    const {data: balance} = useBalance({
        address: address as `0x${string}`,
        chainId: liskSepolia.id,
        token: '0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661',
        query: {
            refetchInterval: 2000, // Refetch every 2 seconds
        }
    });

    const formattedBalance = balance ? 
        new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4
        }).format(Number(balance.formatted)) : '0.00';

    return (
        <div className={`text-${color}`}>
            {formattedBalance} IDRX
        </div>
    );
}
