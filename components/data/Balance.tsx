'use client'

import { useAccount } from "wagmi";
import { useQuery } from '@tanstack/react-query';

interface BalanceData {
    formatted: string;
    value: string;
    cached: boolean;
}

export default function Balance({ color = 'black' }){
    const {address} = useAccount();
    
    const {data: balance, isLoading} = useQuery<BalanceData>({
        queryKey: ['balance', address],
        queryFn: async () => {
            const response = await fetch(`/api/balance?address=${address}`);
            if (!response.ok) throw new Error('Failed to fetch balance');
            return response.json();
        },
        enabled: !!address,
        staleTime: 10000, // Consider data fresh for 10 seconds
        gcTime: 30000, // Keep in cache for 30 seconds
        refetchInterval: 2000, // Refetch every 2 seconds
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        retry: 1, // Only retry once on failure
    });

    const formattedBalance = balance ? 
        new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4
        }).format(Number(balance.formatted)) : '0.00';

    return (
        <div className={`text-${color}`}>
            {isLoading ? (
                <span className="animate-pulse">Loading...</span>
            ) : (
                <>
                    {formattedBalance} IDRX
                    {balance?.cached && (
                        <span className="text-xs text-gray-400 ml-1">(cached)</span>
                    )}
                </>
            )}
        </div>
    );
}
