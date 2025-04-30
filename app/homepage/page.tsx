import Navbar from "@/components/Navbar";
import DashboardCard from "@/components/DashboardCard";
import { TransactionHistory } from "@/components/TransactionHistory";
import { Suspense } from "react";
export default function Homepage(){
    return (
        <div>
            <Suspense fallback={<div>Loading...</div>}>
                <Navbar />
            </Suspense>
            <div className="flex flex-col items-center py-8 gap-8">
                <Suspense fallback={<div>Loading...</div>}>
                    <DashboardCard />
                    <TransactionHistory />
                </Suspense>
            </div>
        </div>
    )
}
