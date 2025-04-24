import Navbar from "@/components/Navbar";
import Balance from "@/components/Balance";
import { TransactionHistory } from "@/components/TransactionHistory";
import { ArrowDownIcon } from "lucide-react";

export default function Homepage(){
    return (
        <div>
            <Navbar />
            <div className="flex flex-col items-center justify-center h-screen">
                <h1>Homepage</h1>
                <Balance />
                <ArrowDownIcon color="#0055FF" className="w-10 h-10"/>
            </div>
                <TransactionHistory />
        </div>
    )
}
