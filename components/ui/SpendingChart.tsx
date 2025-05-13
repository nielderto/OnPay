"use client"
import { useState, useMemo } from "react";
import dynamic from 'next/dynamic';
import { useTransactions } from "../../hooks/useTransactions";
import { useQuery } from '@tanstack/react-query';
import type { ApexOptions } from 'apexcharts';
import { useAccount } from "wagmi";
import { formatUnits } from "viem";

const Chart = dynamic(() => import('react-apexcharts').then(mod => mod.default), { 
  ssr: false,
  loading: () => <div className="h-[300px] flex items-center justify-center">Loading chart...</div>
});

interface Transaction {
  value: string;
  timestamp: number;
  type: "received" | "sent";
  tokenDecimal?: string;
}

interface TransactionStats {
  totalSent: number;
  totalReceived: number;
  last7DaysData: {
    dates: string[];
    sentData: number[];
    receivedData: number[];
  };
}

interface UseTransactionsResult {
  transactions: Transaction[];
  isLoading: boolean;
  isConnected: boolean;
  stats: TransactionStats;
  address?: string;
}

const fetchTransactions = async (address: string): Promise<Transaction[]> => {
  try {
    const url = `https://sepolia-blockscout.lisk.com/api?module=account&action=tokentx&address=${address}&contractaddress=0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661&page=1&offset=20&sort=desc`;
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.status === "1" && Array.isArray(data.result)) {
      return data.result.map((tx: any) => ({
        value: tx.value,
        timestamp: parseInt(tx.timeStamp),
        type: tx.to.toLowerCase() === address.toLowerCase() ? "received" : "sent",
        tokenDecimal: tx.tokenDecimal || "18"
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

const processChartData = (transactions: Transaction[]) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailyData = last7Days.map(date => {
    const dayTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.timestamp * 1000).toISOString().split('T')[0];
      return txDate === date;
    });

    const sent = dayTransactions
      .filter(tx => tx.type === "sent")
      .reduce((sum, tx) => {
        const decimals = parseInt(tx.tokenDecimal || "18");
        const value = Number(formatUnits(BigInt(tx.value), decimals));
        console.log('Sent transaction:', { raw: tx.value, formatted: value, decimals });
        return sum + value;
      }, 0);

    const received = dayTransactions
      .filter(tx => tx.type === "received")
      .reduce((sum, tx) => {
        const decimals = parseInt(tx.tokenDecimal || "18");
        const value = Number(formatUnits(BigInt(tx.value), decimals));
        console.log('Received transaction:', { raw: tx.value, formatted: value, decimals });
        return sum + value;
      }, 0);

    return { sent, received };
  });

  console.log('Processed daily data:', dailyData);

  return {
    dates: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    sent: dailyData.map(d => d.sent),
    received: dailyData.map(d => d.received)
  };
};

export default function SpendingChart() {
  const [selectedType, setSelectedType] = useState<"all" | "sent" | "received">("all");
  const { address } = useAccount();
  const { isConnected } = useTransactions();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', address],
    queryFn: () => fetchTransactions(address as string),
    enabled: !!address && isConnected,
    staleTime: 30000, // 30 seconds
    gcTime: 60000, // 1 minute
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  console.log('Raw transactions:', transactions);

  const chartData = useMemo(() => processChartData(transactions), [transactions]);

  const options: ApexOptions = useMemo(() => ({
    chart: {
      type: 'area',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      },
      animations: {
        enabled: true,
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    xaxis: {
      categories: chartData.dates,
      labels: {
        style: {
          colors: '#6B7280'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6B7280'
        },
        formatter: (value) => `${value.toFixed(2)} IDRX`
      }
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => `${value.toFixed(2)} IDRX`
      }
    },
    colors: selectedType === "received" ? ['#10B981'] : selectedType === "sent" ? ['#EF4444'] : ['#EF4444', '#10B981'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    states: {
      hover: {
        filter: {
          type: 'lighten',
          value: 0.1
        }
      },
      active: {
        filter: {
          type: 'darken',
          value: 0.35
        }
      }
    }
  }), [chartData.dates, selectedType]);

  const series = useMemo(() => {
    const data = [];
    if (selectedType === "all" || selectedType === "sent") {
      data.push({
        name: 'Sent',
        data: chartData.sent
      });
    }
    if (selectedType === "all" || selectedType === "received") {
      data.push({
        name: 'Received',
        data: chartData.received
      });
    }
    return data;
  }, [selectedType, chartData.sent, chartData.received]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 w-[55rem]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Spending Overview</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedType("all")}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedType === "all"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedType("sent")}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedType === "sent"
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Sent
          </button>
          <button
            onClick={() => setSelectedType("received")}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedType === "received"
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Received
          </button>
        </div>
      </div>
      <div className="h-[300px]">
        {typeof window !== 'undefined' && (
          <Chart
            options={options}
            series={series}
            type="area"
            height="100%"
            width="100%"
          />
        )}
      </div>
    </div>
  );
}



