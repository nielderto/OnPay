import ReceiveFunds from "@/components/ui/ReceiveFunds";
import Navbar from "@/components/buttons/Navbar";
import Address from "@/components/data/Address";
import { Suspense } from "react";
export default function ReceivePage() {
    return (
        <>
        <div className="flex flex-col items-center justify-center h-screen max-w-[45rem] mx-auto">
            <Suspense fallback={<div>Loading...</div>}>
                <ReceiveFunds />
            </Suspense>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
            <Navbar />
        </Suspense>
        </>
    );
}
