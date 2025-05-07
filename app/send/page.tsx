import Navbar from "@/components/buttons/Navbar";
import SendForm from "@/components/ui/SendForm";
import { SendHorizonal } from "lucide-react";
import { Suspense } from "react";

export default function SendPage() {
    return (
        <div>
            <div className="flex flex-col items-center justify-center min-h-screen p-4 pb-24">
                <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md mt-20">
                    <div className="flex flex-col justify-center items-center">
                    <SendHorizonal color="#0055FF"/>
                    <h1 className="text-2xl font-bold text-center mb-6 mt-2">Send IDRX</h1>
                    </div>
                    <Suspense fallback={<div>Loading...</div>}>
                        <SendForm />
                    </Suspense>
                </div>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <Navbar />
            </Suspense>
        </div>
    );
}
