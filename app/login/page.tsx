import LoginLogic from "@/components/ui/LoginLogic";
import { Suspense } from "react";

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
            <div className="flex flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-bold text-center">Login Page</h2>
            <Suspense fallback={<div>Loading...</div>}>
                <LoginLogic />
            </Suspense>
            </div>
        </div>
    );
}
