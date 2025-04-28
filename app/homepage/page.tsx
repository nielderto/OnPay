import Navbar from "@/components/Navbar";
import DashboardCard from "@/components/DashboardCard";
import EmptyHistory from "@/components/EmptyHistory";
import { TransactionHistory } from "@/components/TransactionHistory";

export default function Homepage(){
    return (
        <div>
            <Navbar />
            <div className="flex flex-col items-center py-8 gap-8">
                <DashboardCard />
                <TransactionHistory />
            </div>
        </div>
    )
}
