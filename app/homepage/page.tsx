import Navbar from "@/components/buttons/Navbar";
import DashboardCard from "@/components/ui/DashboardCard";
import { TransactionHistory } from "@/components/data/TransactionHistory";
import { Suspense } from "react";
import Link from "next/link";
import UsernameSelection from "@/components/ui/UsernameSelection";
import SpendingChart from "@/components/ui/SpendingChart";

export default function Homepage() {
    return (
        <div>
            <div className="flex flex-col items-center py-8 gap-6 pb-24">
                <Suspense fallback={<div>Loading...</div>}>
                    <DashboardCard />
                    <Link href="/ens-test" className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors">
                        Test ENS Resolution
                    </Link>
                    <SpendingChart />
                    <TransactionHistory />
                    <UsernameSelection />
                </Suspense>
            </div>
        </div>
    )
}
