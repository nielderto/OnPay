import Logout from "./buttons/Logout";
import SendFunds from "./buttons/Send";
import Topup from "./buttons/Topup";
import Home from "./buttons/Home";

export default function Navbar(){
    return (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center items-center p-4 bg-white border-t border-gray-200 shadow-lg max-w-screen">
            <div className="flex items-center gap-4">
                <Home />
                <SendFunds />
                <Topup />
                <Logout />
            </div>
        </div>
    )
}
