import Navbar from "@/components/buttons/Navbar";
import DashboardCard from "@/components/ui/DashboardCard";
import { TransactionHistory } from "@/components/data/TransactionHistory";
import { Suspense } from "react";
import Link from "next/link";

export default function Homepage() {
    return (
        <div>
            <Suspense fallback={<div>Loading...</div>}>
                <Navbar />
            </Suspense>
            <div className="flex flex-col items-center py-8 gap-8">
                <Suspense fallback={<div>Loading...</div>}>
                    <DashboardCard />
                    <Link href="/ens-test" className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors">
                        Test ENS Resolution
                    </Link>
                    <TransactionHistory />
                </Suspense>
            </div>
        </div>
    )
}
