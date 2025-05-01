import Navbar from "@/components/buttons/Navbar";
import CreateOnRamp from "@/components/ui/CreateOnRamp";
import { Suspense } from "react";

export default function TopupPage(){
    return (
        <div>
            <div className="flex flex-col items-center justify-center h-screen">
                <Suspense fallback={<div>Loading...</div>}>
                    <CreateOnRamp />
                </Suspense>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <Navbar />
            </Suspense>
        </div>
    )
}
