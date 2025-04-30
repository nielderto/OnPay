'use client'
import { useAccount } from "wagmi";

export default function Address() {
    const { address: walletAddress } = useAccount();
    return (
        <div>{walletAddress}</div>
    )
}
