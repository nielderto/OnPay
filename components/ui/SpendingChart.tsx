'use client'
import React, { useMemo, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Transaction {
  value: string;
  timestamp: number;
  type: "received" | "sent";
  tokenDecimal?: string;
}

const fetchTransactions = async (address: string): Promise<Transaction[]> => {
  try {
    const url = `https://sepolia-blockscout.lisk.com/api?module=account&action=tokentx&address=${address}&contractaddress=0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661&page=1&offset=100&sort=desc`;
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

const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const processTransactionData = (txs: Transaction[], last7Days: Date[]) => {
  const received = Array(7).fill(0);
  const sent = Array(7).fill(0);

  txs.forEach((tx) => {
    const txDate = new Date(tx.timestamp * 1000);
    for (let i = 0; i < last7Days.length; i++) {
      if (
        txDate.getDate() === last7Days[i].getDate() &&
        txDate.getMonth() === last7Days[i].getMonth() &&
        txDate.getFullYear() === last7Days[i].getFullYear()
      ) {
        const value = Number(tx.value) / 10 ** Number(tx.tokenDecimal || "18");
        if (tx.type === "received") received[i] += value;
        else sent[i] += value;
      }
    }
  });

  return {
    chartData: {
      labels: last7Days.map(formatDate),
      datasets: [
        {
          label: "Received",
          data: received,
          backgroundColor: "rgba(0, 200, 83, 0.7)",
        },
        {
          label: "Transferred",
          data: sent,
          backgroundColor: "rgba(229, 57, 53, 0.7)",
        },
      ],
    },
    totals: {
      received: received.reduce((a, b) => a + b, 0),
      sent: sent.reduce((a, b) => a + b, 0),
    }
  };
};

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top" as const },
    title: { display: true, text: "IDRX Cash Flow (Last 7 Days)" },
  },
  scales: {
    y: { beginAtZero: true },
  },
};

export default function SpendingChart() {
  const { address } = useAccount();
  
  // Memoize the last 7 days calculation
  const last7Days = useMemo(() => getLast7Days(), []);

  // Memoize the query function
  const queryFn = useCallback(() => 
    address ? fetchTransactions(address) : Promise.resolve([]),
    [address]
  );

  // Use React Query with memoized query function
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', address],
    queryFn,
    enabled: !!address,
  });

  // Memoize the processed data
  const { chartData, totals } = useMemo(() => 
    processTransactionData(transactions, last7Days),
    [transactions, last7Days]
  );

  // Memoize the formatted totals
  const formattedTotals = useMemo(() => ({
    received: totals.received.toLocaleString(undefined, { maximumFractionDigits: 4 }),
    sent: totals.sent.toLocaleString(undefined, { maximumFractionDigits: 4 })
  }), [totals]);

  return (
    <div className="w-full flex justify-center items-center min-h-[60vh] p-2 sm:p-4">
      <div className="bg-white rounded-lg p-2 sm:p-6 shadow-lg w-full max-w-[55rem]">
        <h2 className="text-2xl font-bold mb-4 text-center">This week's activity</h2>
        {chartData ? (
          <div className="w-full flex justify-center items-center" style={{height: 300}}>
            <Bar data={chartData} options={CHART_OPTIONS} style={{width: '100%'}} />
          </div>
        ) : (
          <div className="flex justify-center items-center h-[300px]">Loading...</div>
        )}
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 text-base sm:text-lg font-semibold">
          <div className="flex items-center gap-2 text-green-700">
            <span className="w-4 h-4 inline-block rounded bg-green-400"></span>
            Total Received: {formattedTotals.received} <span className="font-normal">IDRX</span>
          </div>
          <div className="flex items-center gap-2 text-red-700">
            <span className="w-4 h-4 inline-block rounded bg-red-400"></span>
            Total Sent: {formattedTotals.sent} <span className="font-normal">IDRX</span>
          </div>
        </div>
      </div>
    </div>
  );
}
