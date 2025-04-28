'use client'
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import axios from "axios";
import { formatUnits } from "viem";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useState } from "react";

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  type: "received" | "sent";
  tokenSymbol?: string;
  tokenDecimal?: string;
}

const IDRX_TOKEN_ADDRESS = "0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661"; 

const fetchTransactions = async (address: string): Promise<Transaction[]> => {
  try {
    const url = `https://sepolia-blockscout.lisk.com/api?module=account&action=tokentx&address=${address}&contractaddress=${IDRX_TOKEN_ADDRESS}&page=1&offset=20&sort=desc`; // Increased offset slightly
    console.log("API URL:", url);

    const response = await axios.get(url);
    console.log("Full API Response:", response);
    console.log("API Response Data:", response.data);

    // Check Etherscan-style response structure
    if (response.data && response.data.status === "1" && Array.isArray(response.data.result)) {
      return response.data.result.map((tx: any) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        timestamp: parseInt(tx.timeStamp),
        type: tx.to.toLowerCase() === address.toLowerCase() ? "received" : "sent",
        tokenSymbol: tx.tokenSymbol,
        tokenDecimal: tx.tokenDecimal,
      }));
    } else if (response.data && response.data.status === "0") {
      console.log("No transactions found (API status 0):", response.data.message);
      return [];
    } else {
      console.log("Unexpected API response structure or status not '1':", response.data);
      return [];
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
  
      if (error.response?.status === 404) {
        console.error("Received 404 - The Etherscan-compatible API endpoint might not be available at /api on this Blockscout instance.");
      }
    } else {
      console.error("Error fetching transactions:", error);
    }
    throw error; // Re-throw error for React Query
  }
};

export const TransactionHistory = () => {
  const { address, isConnected } = useAccount();
  const [showWeek, setShowWeek] = useState(false);

  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ["idrxTokenTransactions", address, IDRX_TOKEN_ADDRESS], // More specific query key
    queryFn: () => (address ? fetchTransactions(address) : Promise.resolve([])),
    enabled: !!address && isConnected,
  });

  if (!isConnected) {
    return (
      <div className="p-4 text-gray-500 text-center">
        Please connect your wallet to view transactions
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.error("React Query Error in Component:", error);
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        Error loading transactions: {error instanceof Error ? error.message : 'Failed to fetch'}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        <p>No IDRX transactions found for address: {address}</p>
        <p className="text-sm mt-2">Ensure you have IDRX transactions on Lisk Sepolia ({IDRX_TOKEN_ADDRESS}).</p>
      </div>
    );
  }

  // Filter transactions within the last 7 days
  const oneWeekAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
  const recentTransactions = transactions.filter(tx => tx.timestamp >= oneWeekAgo);
  const latestThree = transactions.slice(0, 3);

  const displayTransactions = showWeek ? recentTransactions : latestThree;

  if (displayTransactions.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        <p>{showWeek ? "No transactions in the last 7 days." : "No recent transactions."}</p>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-0 mt-6 space-y-4 pb-20 sm:max-w-xl sm:mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-semibold">
          {showWeek ? "History (a week's transactions)" : "History"}
        </h2>
        <button
          className="px-3 py-2 rounded-lg bg-[#7B3FE4] text-white font-medium hover:bg-[#6a2fd0] transition-all ml-2 text-sm sm:text-base"
          onClick={() => setShowWeek((prev) => !prev)}
        >
          {showWeek ? "Show Latest 3" : "Show All"}
        </button>
      </div>
      <div className="space-y-2">
        {displayTransactions.map((tx) => (
          <div
            key={tx.hash}
            className="flex flex-row items-center justify-between p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div
                className={`p-2 rounded-full ${
                  tx.type === "received"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {tx.type === "received" ? (
                  <ArrowDownIcon className="h-5 w-5" />
                ) : (
                  <ArrowUpIcon className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base">
                  {tx.type === "received" ? "Received" : "Sent"}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {new Date(tx.timestamp * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-sm sm:text-base">
                {formatUnits(BigInt(tx.value), parseInt(tx.tokenDecimal || '18'))} {tx.tokenSymbol || 'IDRX'}
              </p>
              <a
                href={`https://sepolia-blockscout.lisk.com/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-blue-500 hover:underline"
              >
                View on Blockscout
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
