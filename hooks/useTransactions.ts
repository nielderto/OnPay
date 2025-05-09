import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import axios from "axios";
import { formatUnits } from "viem";

export interface Transaction {
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

export const IDRX_TOKEN_ADDRESS = "0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661";

const fetchTransactions = async (address: string): Promise<Transaction[]> => {
  try {
    const url = `https://sepolia-blockscout.lisk.com/api?module=account&action=tokentx&address=${address}&contractaddress=${IDRX_TOKEN_ADDRESS}&page=1&offset=20&sort=desc`;
    const response = await axios.get(url);

    if (response.data && response.data.status === "1" && Array.isArray(response.data.result)) {
      return response.data.result.map((tx: any) => {
        const type = tx.to.toLowerCase() === address.toLowerCase() ? "received" : "sent";
        return {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          timestamp: parseInt(tx.timeStamp),
          type,
          status: "completed",
          description: type === "received" ? "Payment received" : "Payment for services",
          tokenSymbol: tx.tokenSymbol,
          tokenDecimal: tx.tokenDecimal,
        };
      });
    }
    return [];
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

export interface TransactionStats {
  totalSent: number;
  totalReceived: number;
  netChange: number;
  percentageChange: number;
  last7DaysData: {
    dates: string[];
    sentData: number[];
    receivedData: number[];
  };
}

export const useTransactions = () => {
  const { address, isConnected } = useAccount();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["idrxTokenTransactions", address, IDRX_TOKEN_ADDRESS],
    queryFn: () => (address ? fetchTransactions(address) : Promise.resolve([])),
    enabled: !!address && isConnected,
  });

  const calculateStats = (): TransactionStats => {
    // Calculate totals
    const totalSent = transactions
      .filter((tx) => tx.type === "sent")
      .reduce((sum, tx) => 
        sum + parseFloat(formatUnits(BigInt(tx.value), parseInt(tx.tokenDecimal || "18"))), 0);

    const totalReceived = transactions
      .filter((tx) => tx.type === "received")
      .reduce((sum, tx) => 
        sum + parseFloat(formatUnits(BigInt(tx.value), parseInt(tx.tokenDecimal || "18"))), 0);

    const netChange = totalReceived - totalSent;
    const percentageChange = totalSent > 0 ? ((totalReceived - totalSent) / totalSent) * 100 : 0;

    // Calculate last 7 days data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const sentData = new Array(7).fill(0);
    const receivedData = new Array(7).fill(0);

    // Debug logging for received transactions
    console.log('Received transactions:', transactions.filter(tx => tx.type === 'received').map(tx => ({
      date: new Date(tx.timestamp * 1000).toISOString(),
      value: formatUnits(BigInt(tx.value), parseInt(tx.tokenDecimal || "18"))
    })));

    transactions.forEach((tx) => {
      const txDate = new Date(tx.timestamp * 1000);
      const txDateStr = txDate.toISOString().split('T')[0];
      const dayIndex = last7Days.indexOf(txDateStr);
      
      if (dayIndex !== -1) {
        const value = parseFloat(formatUnits(BigInt(tx.value), parseInt(tx.tokenDecimal || "18")));
        if (tx.type === "received") {
          receivedData[dayIndex] += value;
        } else {
          sentData[dayIndex] += value;
        }
      }
    });

    // Debug logging for aggregated data
    console.log('Last 7 days:', last7Days);
    console.log('Received data:', receivedData);

    return {
      totalSent,
      totalReceived,
      netChange,
      percentageChange,
      last7DaysData: {
        dates: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        sentData,
        receivedData,
      },
    };
  };

  return {
    transactions,
    isLoading,
    isConnected,
    stats: calculateStats(),
  };
}; 