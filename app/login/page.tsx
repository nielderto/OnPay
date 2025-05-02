import LoginLogic from "@/components/ui/LoginLogic";
import { Suspense } from "react";

export default function LoginPage() {
    return (
            <Suspense fallback={<div>Loading...</div>}>
                <LoginLogic />
            </Suspense>
            
    );
}
