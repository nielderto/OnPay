"use client"
import { useEffect, useRef, useState } from 'react'
import ApexCharts from 'apexcharts'
import { useTransactions } from '../../hooks/useTransactions'

export default function SpendingChart() {
    const sentChartRef = useRef<HTMLDivElement>(null);
    const receivedChartRef = useRef<HTMLDivElement>(null);
    const { transactions, isLoading, isConnected, stats } = useTransactions();
    const [selectedType, setSelectedType] = useState<'sent' | 'received'>('sent');

    useEffect(() => {
        let currentChart: ApexCharts | undefined;

        if ((sentChartRef.current || receivedChartRef.current) && transactions.length > 0) {
            // Find the maximum value among both sent and received data
            const rawMaxY = Math.max(
                ...stats.last7DaysData.sentData,
                ...stats.last7DaysData.receivedData,
                1 // fallback to 1 to avoid 0 max
            );
            // Add a larger margin to make small spikes more visible
            const maxY = rawMaxY > 0 ? rawMaxY * 1.5 : 1;

            const baseOptions = {
                chart: {
                    height: "100%",
                    maxWidth: "100%",
                    type: "area",
                    fontFamily: "Inter, sans-serif",
                    dropShadow: {
                        enabled: false,
                    },
                    toolbar: {
                        show: false,
                    },
                    animations: {
                        enabled: false
                    }
                },
                tooltip: {
                    enabled: true,
                    x: {
                        show: false,
                    },
                },
                fill: {
                    type: "gradient",
                    gradient: {
                        opacityFrom: 0.55,
                        opacityTo: 0,
                    },
                },
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    width: 6,
                },
                grid: {
                    show: false,
                    strokeDashArray: 4,
                    padding: {
                        left: 2,
                        right: 2,
                        top: 0
                    },
                },
                xaxis: {
                    categories: stats.last7DaysData.dates,
                    labels: {
                        show: false,
                    },
                    axisBorder: {
                        show: false,
                    },
                    axisTicks: {
                        show: false,
                    },
                },
                yaxis: {
                    show: true,
                    min: 0,
                    max: maxY,
                    forceNiceScale: false,
                    labels: { show: false },
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                },
            };

            // Destroy any existing chart
            if (currentChart) {
                currentChart.destroy();
                currentChart = undefined;
            }

            // Create new chart based on selected type
            const chartOptions = selectedType === 'sent' 
                ? {
                    ...baseOptions,
                    colors: ["#EF4444"],
                    fill: {
                        ...baseOptions.fill,
                        gradient: {
                            ...baseOptions.fill.gradient,
                            shade: "#EF4444",
                            gradientToColors: ["#EF4444"],
                        },
                    },
                    series: [{
                        name: "Sent",
                        data: stats.last7DaysData.sentData,
                    }],
                }
                : {
                    ...baseOptions,
                    colors: ["#10B981"],
                    fill: {
                        ...baseOptions.fill,
                        gradient: {
                            ...baseOptions.fill.gradient,
                            shade: "#10B981",
                            gradientToColors: ["#10B981"],
                        },
                    },
                    series: [{
                        name: "Received",
                        data: stats.last7DaysData.receivedData,
                    }],
                };

            const chartElement = selectedType === 'sent' ? sentChartRef.current : receivedChartRef.current;
            if (chartElement) {
                currentChart = new ApexCharts(chartElement, chartOptions);
                currentChart.render();
            }

            return () => {
                if (currentChart) {
                    currentChart.destroy();
                    currentChart = undefined;
                }
            };
        }
    }, [transactions, stats, selectedType]);

    if (!isConnected) {
        return (
            <div className="p-4 text-gray-500 text-center">
                Please connect your wallet to view transaction charts
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

    return (
        <div className="w-[25rem] lg:w-[55rem] mx-auto">
            {selectedType === 'sent' ? (
                <div className="bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-base font-normal text-gray-500 dark:text-gray-400">Total Sent</p>
                            <h5 className="leading-none text-3xl font-bold text-gray-900 dark:text-white pb-2">
                                {stats.totalSent.toFixed(2)} IDRX
                            </h5>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex items-center px-2.5 py-0.5 text-base font-semibold text-red-500 text-center mb-2">
                                Sent
                            </div>
                            <select
                                className="border rounded px-3 py-1 text-sm"
                                value={selectedType}
                                onChange={e => setSelectedType(e.target.value as 'sent' | 'received')}
                            >
                                <option value="sent">Sent</option>
                                <option value="received">Received</option>
                            </select>
                        </div>
                    </div>
                    <div ref={sentChartRef} id="sent-chart"></div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-base font-normal text-gray-500 dark:text-gray-400">Total Received</p>
                            <h5 className="leading-none text-3xl font-bold text-gray-900 dark:text-white pb-2">
                                {stats.totalReceived.toFixed(2)} IDRX
                            </h5>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex items-center px-2.5 py-0.5 text-base font-semibold text-green-500 text-center mb-2">
                                Received
                            </div>
                            <select
                                className="border rounded px-3 py-1 text-sm"
                                value={selectedType}
                                onChange={e => setSelectedType(e.target.value as 'sent' | 'received')}
                            >
                                <option value="sent">Sent</option>
                                <option value="received">Received</option>
                            </select>
                        </div>
                    </div>
                    <div ref={receivedChartRef} id="received-chart"></div>
                </div>
            )}
        </div>
    );
}



