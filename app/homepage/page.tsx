import Navbar from "@/components/buttons/Navbar";
import DashboardCard from "@/components/ui/DashboardCard";
import { TransactionHistory } from "@/components/data/TransactionHistory";
import { Suspense } from "react";

export default function Homepage(){
    return (
        <div>
            <Suspense fallback={<div>Loading...</div>}>
                <Navbar />
            </Suspense>
            <div className="flex flex-col items-center py-8 gap-8 pb-24">
                <Suspense fallback={<div>Loading...</div>}>
                    <DashboardCard />
                    <TransactionHistory />
                </Suspense>
            </div>
        </div>
    )
}
