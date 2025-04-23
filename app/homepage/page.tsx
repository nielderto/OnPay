import Navbar from "@/components/Navbar";
import Balance from "@/components/Balance";

export default function Homepage(){
    return (
        <div>
            <Navbar />
            <div className="flex flex-col items-center justify-center h-screen">
                <h1>Homepage</h1>
                <Balance />
            </div>
        </div>
    )
}
