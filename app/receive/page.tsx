import ReceiveFunds from "@/components/ReceiveFunds";
import Navbar from "@/components/Navbar";
import Address from "@/components/data/Address";

export default function ReceivePage() {
    return (
        <>
        <div className="flex flex-col items-center justify-center h-screen">
            <ReceiveFunds />
        </div>
        <Navbar />
        </>
    );
}
