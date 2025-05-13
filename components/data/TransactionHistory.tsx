'use client'

import { Send, Copy, ExternalLink } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { useTransactions } from "../../hooks/useTransactions";
import { formatUnits } from "viem";
import axios from "axios";
import { lookupENSName } from "@/lib/ens-service";
import { AddressWithENS } from "../ui/AddressWithENS";
import { useQuery } from '@tanstack/react-query';
import { useAccount } from "wagmi";

// Types
interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  type: "received" | "sent";
  status: "completed" | "pending";
  description?: string;
  tokenSymbol?: string;
  tokenDecimal?: string;
}

type FilterType = "all" | "sent" | "received" | "pending";

// Constants
const IDRX_TOKEN_ADDRESS = "0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661";
const TRANSACTIONS_PER_PAGE = 20;
const REFETCH_INTERVAL = 30000; // 30 seconds

// API
const fetchTransactions = async (address: string): Promise<Transaction[]> => {
  try {
    const url = `https://sepolia-blockscout.lisk.com/api?module=account&action=tokentx&address=${address}&contractaddress=${IDRX_TOKEN_ADDRESS}&page=1&offset=${TRANSACTIONS_PER_PAGE}&sort=desc`;
    const response = await axios.get(url);

    if (response.data?.status !== "1" || !Array.isArray(response.data.result)) {
      return [];
    }

    return response.data.result.map((tx: any) => {
      const fromAddress = tx.from?.toLowerCase() || '';
      const toAddress = tx.to?.toLowerCase() || '';
      const userAddress = address.toLowerCase();
      
      return {
        hash: tx.hash,
        from: fromAddress,
        to: toAddress,
        value: tx.value,
        timestamp: parseInt(tx.timeStamp),
        type: toAddress === userAddress ? "received" : "sent",
        status: "completed",
        description: toAddress === userAddress ? "Payment received" : "Payment for services",
        tokenSymbol: tx.tokenSymbol,
        tokenDecimal: tx.tokenDecimal,
      };
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

// Utility functions
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return {
    full: `${day}/${month}/${year} • ${hours}:${minutes}`,
    mobile: `${day}/${month} ${hours}:${minutes}`
  };
};

// Components
const TransactionItem = ({ tx }: { tx: Transaction }) => {
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const openInExplorer = useCallback((hash: string) => {
    window.open(`https://sepolia-blockscout.lisk.com/tx/${hash}`, '_blank');
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-full ${tx.type === "received" ? "bg-green-100" : "bg-red-100"}`}>
            <Send className={`h-5 w-5 ${tx.type === "received" ? "text-green-600 rotate-180" : "text-red-600"}`} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-gray-900">
                {tx.type === "received" ? "From" : "To"}: <AddressWithENS address={tx.type === "received" ? tx.from : tx.to} />
              </span>
              <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                {tx.status}
              </span>
            </div>
            <span className="text-gray-500 text-sm">
              {tx.description}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-start sm:items-end">
          <span className={`font-medium ${tx.type === "received" ? "text-green-600" : "text-red-600"}`}>
            {tx.type === "received" ? "+" : "-"}{formatUnits(BigInt(tx.value), parseInt(tx.tokenDecimal || "18"))} {tx.tokenSymbol || "IDRX"}
          </span>
          <span className="text-gray-500 text-sm">
            <span className="hidden sm:inline">{formatDate(tx.timestamp).full}</span>
            <span className="sm:hidden">{formatDate(tx.timestamp).mobile}</span>
          </span>
        </div>
      </div>
      <div className="mt-4 pt-4 flex items-center gap-2 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          TX: {tx.hash ? `${tx.hash.slice(0, 8)}...${tx.hash.slice(-4)}` : 'N/A'}
        </div>
        <div className="flex gap-4 ml-auto">
          {tx.hash && (
            <>
              <button
                onClick={() => copyToClipboard(tx.hash)}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </button>
              <button
                onClick={() => openInExplorer(tx.hash)}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Explorer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const FilterButton = ({ 
  type, 
  activeFilter, 
  onClick 
}: { 
  type: FilterType; 
  activeFilter: FilterType; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 transition-colors duration-200 ${
      activeFilter === type
        ? "bg-white rounded-t-lg border-t border-l border-r border-gray-200 font-medium"
        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
    }`}
  >
    {type.charAt(0).toUpperCase() + type.slice(1)}
  </button>
);

// Main Component
export const TransactionHistory = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showAll, setShowAll] = useState(false);
  const { isConnected } = useTransactions();
  const { address } = useAccount();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', address],
    queryFn: () => fetchTransactions(address as string),
    enabled: !!address,
    staleTime: REFETCH_INTERVAL,
    gcTime: REFETCH_INTERVAL * 2,
    refetchInterval: REFETCH_INTERVAL,
  });

  const filteredTransactions = useMemo(() => 
    transactions.filter(tx => {
      if (activeFilter === "all") return true;
      if (activeFilter === "pending") return tx.status === "pending";
      return tx.type === activeFilter;
    }), [transactions, activeFilter]);

  const displayedTransactions = useMemo(() => 
    showAll ? filteredTransactions : filteredTransactions.slice(0, 3),
    [filteredTransactions, showAll]);

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

  if (displayedTransactions.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Transaction History</h1>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="text-gray-500 mb-2">No transactions found</div>
          <div className="text-sm text-gray-400">Your transaction history will appear here</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Transaction History</h1>
        {filteredTransactions.length > 3 && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 bg-blue-500 rounded-lg border border-gray-200 text-sm font-medium hover:bg-blue-400 text-white"
          >
            {showAll ? "Show Less" : "Show All"}
          </button>
        )}
      </div>

      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <FilterButton type="all" activeFilter={activeFilter} onClick={() => setActiveFilter("all")} />
        <FilterButton type="sent" activeFilter={activeFilter} onClick={() => setActiveFilter("sent")} />
        <FilterButton type="received" activeFilter={activeFilter} onClick={() => setActiveFilter("received")} />
      </div>

      <div className="space-y-4">
        {displayedTransactions.map((tx, index) => (
          <TransactionItem key={`${tx.hash}-${index}`} tx={tx} />
        ))}
      </div>
    </div>
  );
};
