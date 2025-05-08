import { Suspense } from "react";
import UsernameSelection from "../../components/ui/UsernameSelection";

export default function UsernamePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative">
            {/* Background elements */}
            <div className="absolute inset-0 z-0">
                {/* Hexagon grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15L30 0z' fillRule='evenodd' stroke='%230000FF' strokeWidth='2' fill='none'/%3E%3C/svg%3E")`,
                        backgroundSize: "60px 60px",
                    }}
                ></div>
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <UsernameSelection />
            </Suspense>
        </div>
    );
} 
