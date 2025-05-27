import DashboardCard from "@/components/ui/DashboardCard";
import { TransactionHistory } from "@/components/data/TransactionHistory";
import { Suspense } from "react";
import Link from "next/link";
import SpendingChart from "@/components/ui/SpendingChart";
import { SuspenseBoundary } from "@/components/ui/SuspenseBoundary";

// Separate critical and non-critical components
const CriticalComponents = () => (
    <>
        <SuspenseBoundary fallback={<div>Loading dashboard...</div>}>
            <DashboardCard />
        </SuspenseBoundary>
    </>
);

const NonCriticalComponents = () => (
    <>
        <SuspenseBoundary fallback={<div>Loading chart...</div>}>
            <SpendingChart />
        </SuspenseBoundary>
        <SuspenseBoundary fallback={<div>Loading transactions...</div>}>
            <TransactionHistory />
        </SuspenseBoundary>
    </>
);

export default function Homepage() {
    return (
        <div>
            <div className="flex flex-col items-center py-8 gap-6 pb-24">
                {/* Load critical components first */}
                <CriticalComponents />
                
                {/* Load non-critical components with lower priority */}
                <Suspense fallback={null}>
                    <NonCriticalComponents />
                </Suspense>
            </div>
        </div>
    );
}
