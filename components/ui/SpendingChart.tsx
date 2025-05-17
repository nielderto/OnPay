'use client'
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { useAccount } from "wagmi";

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

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function SpendingChart() {
  const [chartData, setChartData] = useState<any>(null);
  const [totals, setTotals] = useState<{ received: number; sent: number }>({ received: 0, sent: 0 });
  const { address } = useAccount();

  useEffect(() => {
    if (!address) return;
    const load = async () => {
      const txs = await fetchTransactions(address);
      const days = getLast7Days();
      const received = Array(7).fill(0);
      const sent = Array(7).fill(0);

      txs.forEach((tx) => {
        const txDate = new Date(tx.timestamp * 1000);
        for (let i = 0; i < days.length; i++) {
          if (
            txDate.getDate() === days[i].getDate() &&
            txDate.getMonth() === days[i].getMonth() &&
            txDate.getFullYear() === days[i].getFullYear()
          ) {
            const value = Number(tx.value) / 10 ** Number(tx.tokenDecimal || "18");
            if (tx.type === "received") received[i] += value;
            else sent[i] += value;
          }
        }
      });

      setChartData({
        labels: days.map(formatDate),
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
      });
      setTotals({
        received: received.reduce((a, b) => a + b, 0),
        sent: sent.reduce((a, b) => a + b, 0),
      });
    };
    load();
  }, [address]);

  const options = {
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

  return (
    <div className="w-full flex justify-center items-center min-h-[60vh] p-2 sm:p-4">
      <div className="bg-white rounded-lg p-2 sm:p-6 shadow-lg w-full max-w-[55rem]">
        <h2 className="text-2xl font-bold mb-4 text-center">This week's activity</h2>
        {chartData ? (
          <div className="w-full flex justify-center items-center" style={{height: 300}}>
            <Bar data={chartData} options={options} style={{width: '100%'}} />
          </div>
        ) : (
          <div className="flex justify-center items-center h-[300px]">Loading...</div>
        )}
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 text-base sm:text-lg font-semibold">
          <div className="flex items-center gap-2 text-green-700">
            <span className="w-4 h-4 inline-block rounded bg-green-400"></span>
            Total Received: {totals.received.toLocaleString(undefined, { maximumFractionDigits: 4 })} <span className="font-normal">IDRX</span>
          </div>
          <div className="flex items-center gap-2 text-red-700">
            <span className="w-4 h-4 inline-block rounded bg-red-400"></span>
            Total Sent: {totals.sent.toLocaleString(undefined, { maximumFractionDigits: 4 })} <span className="font-normal">IDRX</span>
          </div>
        </div>
      </div>
    </div>
  );
}
