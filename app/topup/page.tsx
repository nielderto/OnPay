import Navbar from "@/components/Navbar";
import CreateOnRamp from "@/components/CreateOnRamp";

export default function TopupPage(){
    return (
        <div>
            <div className="flex flex-col items-center justify-center h-screen">
                <CreateOnRamp />
            </div>
            <Navbar />
        </div>
    )
}
